export interface Player {
    id: number;
    jugador: string;
    alias?: string;
    ng: number;
    fitness: number;
    defensive: number;
    strengths: number;
    intensity: number;
    pos?: string;       // Primary position number(s), e.g. "1"
    p_name?: string;    // Comma-separated position names in preference order, e.g. "GK,LI"
    status?: string;
}

// ─── Position name → category ─────────────────────────────────────────────────

const GK_NAMES  = new Set(['gk', 'arquero', 'portero', 'golero']);
const DEF_NAMES = new Set(['li', 'ld', 'ci', 'cd', 'def', 'lateral', 'central', 'libero', 'lb', 'rb', 'cb', 'zaguero']);
const MID_NAMES = new Set(['mc', 'mcd', 'mco', 'mi', 'md', 'mid', 'medio', 'volante', 'interno', 'enganche', 'pivot', 'cm', 'dm', 'am', 'lm', 'rm']);
const FWD_NAMES = new Set(['del', 'delantero', 'extremo', 'punta', 'winger', 'cf', 'lw', 'rw', 'ss', 'fw']);

// Position numbers → category
const POS_NUM_MAP: Record<string, Category> = {
    '1': 'GK',
    '2': 'DEF', '3': 'DEF', '4': 'DEF', '5': 'DEF',
    '6': 'MID', '7': 'MID', '8': 'MID', '10': 'MID',
    '9': 'FWD', '11': 'FWD',
};

type Category = 'GK' | 'DEF' | 'MID' | 'FWD' | 'OTHER';

function norm(s: string) {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

/** Get all position names from p_name (comma-separated) */
function getPNames(p: Player): string[] {
    return (p.p_name || '')
        .split(',')
        .map(s => norm(s))
        .filter(Boolean);
}

/** Get primary position number tokens from pos field */
function getPosNums(p: Player): string[] {
    return (p.pos || '')
        .split(/[\s,]+/)
        .map(s => s.trim())
        .filter(Boolean);
}

/** Map a p_name token to a category */
function pnameToCategory(name: string): Category {
    const n = norm(name);
    if (GK_NAMES.has(n))  return 'GK';
    if (DEF_NAMES.has(n)) return 'DEF';
    if (MID_NAMES.has(n)) return 'MID';
    if (FWD_NAMES.has(n)) return 'FWD';
    return 'OTHER';
}

/** 
 * Returns the player's category given how many GK slots are still open.
 * Uses pos numbers first (primary), then p_name list in order.
 * If primary is GK but no GK slots remain, falls back to next p_name.
 */
export function effectiveCategory(p: Player, gkSlotsOpen: number): Category {
    const posNums = getPosNums(p);
    const pnames  = getPNames(p);

    // Determine primary category from pos number
    let primaryCat: Category = 'OTHER';
    for (const num of posNums) {
        if (POS_NUM_MAP[num]) { primaryCat = POS_NUM_MAP[num]; break; }
    }

    // If primary is GK and there's a slot → assign GK
    if (primaryCat === 'GK') {
        if (gkSlotsOpen > 0) return 'GK';
        // Fall back: look at secondary p_names (skip the GK one)
        for (const name of pnames) {
            const cat = pnameToCategory(name);
            if (cat !== 'GK') return cat;
        }
        return 'DEF'; // last resort for displaced GK
    }

    // Non-GK primary from pos: use it
    if (primaryCat !== 'OTHER') return primaryCat;

    // No pos number match → use p_name list
    for (const name of pnames) {
        const cat = pnameToCategory(name);
        if (cat === 'GK' && gkSlotsOpen <= 0) continue; // skip GK if no slot
        if (cat !== 'OTHER') return cat;
    }

    return 'OTHER';
}

/** Display label for a player (uses their effective p_name or pos) */
export function posLabel(p: Player): string {
    const pnames = getPNames(p);
    if (pnames.length > 0) return pnames[0].toUpperCase();
    const nums = getPosNums(p);
    if (nums.length > 0) {
        const cat = POS_NUM_MAP[nums[0]];
        if (cat) return cat;
    }
    return '-';
}

/** True if player is primarily a GK */
export function isGK(p: Player): boolean {
    const posNums = getPosNums(p);
    for (const num of posNums) {
        if (num === '1') return true;
    }
    const pnames = getPNames(p);
    if (pnames.length > 0 && GK_NAMES.has(pnames[0])) return true;
    return false;
}

// ─── Snake draft ───────────────────────────────────────────────────────────────

function snakeDraft(items: Player[], teams: Player[][], teamCount: number, maxPerTeam: number) {
    let dir = 1;
    let idx = 0;
    for (const item of items) {
        // Find next team that can still receive a player
        let tries = 0;
        while (teams[idx].length >= maxPerTeam && tries < teamCount) {
            idx = (idx + teamCount + dir) % teamCount;
            tries++;
        }
        if (teams[idx].length < maxPerTeam) {
            teams[idx].push(item);
            idx += dir;
            if (idx >= teamCount || idx < 0) {
                dir *= -1;
                idx += dir;
            }
        }
    }
}

// ─── Main generator ───────────────────────────────────────────────────────────

export interface GenerateResult {
    teams: Player[][];
    bench: Player[];   // players left out to keep equal team sizes
}

export function generateTeams(players: Player[], teamCount: number = 2): GenerateResult {
    if (players.length === 0) return { teams: [], bench: [] };

    // ── Step 1: Equal team size enforcement ──────────────────────────────────
    const playersPerTeam = Math.floor(players.length / teamCount);
    const totalSlots = playersPerTeam * teamCount;

    // Sort all players by NG desc for initial assignment priority
    const sorted = [...players].sort((a, b) => b.ng - a.ng);

    // Bench = lowest NG players that don't fit
    const active = sorted.slice(0, totalSlots);
    const bench  = sorted.slice(totalSlots);

    // ── Step 2: Categorize with flexible GK logic ────────────────────────────
    // We want exactly teamCount GKs.
    // Pass 1: find how many true GKs we have among active players
    let gkSlotsOpen = teamCount;

    // Assign categories, consuming GK slots
    const withCategory: { player: Player; cat: Category }[] = [];

    // Sort GK-primary players first so they get their GK slot
    const gkFirst = [...active].sort((a, b) => {
        const aGK = isGK(a) ? -1 : 1;
        const bGK = isGK(b) ? -1 : 1;
        if (aGK !== bGK) return aGK - bGK;
        return b.ng - a.ng;
    });

    for (const p of gkFirst) {
        const cat = effectiveCategory(p, gkSlotsOpen);
        if (cat === 'GK') gkSlotsOpen--;
        withCategory.push({ player: p, cat });
    }

    // ── Step 3: Group by category, sort by NG desc ───────────────────────────
    const byCategory = (cat: Category) =>
        withCategory
            .filter(x => x.cat === cat)
            .map(x => x.player)
            .sort((a, b) => b.ng - a.ng);

    const gks    = byCategory('GK');
    const defs   = byCategory('DEF');
    const mids   = byCategory('MID');
    const fwds   = byCategory('FWD');
    const others = byCategory('OTHER');

    // ── Step 4: Snake draft per category ─────────────────────────────────────
    const teams: Player[][] = Array.from({ length: teamCount }, () => []);

    snakeDraft(gks,    teams, teamCount, playersPerTeam);
    snakeDraft(defs,   teams, teamCount, playersPerTeam);
    snakeDraft(mids,   teams, teamCount, playersPerTeam);
    snakeDraft(fwds,   teams, teamCount, playersPerTeam);

    // Others: greedy (lowest NG sum team gets next) respecting max size
    for (const p of others) {
        const eligible = teams
            .map((t, i) => ({ i, sum: t.reduce((s, x) => s + Number(x.ng), 0), size: t.length }))
            .filter(t => t.size < playersPerTeam)
            .sort((a, b) => a.sum - b.sum);
        if (eligible.length > 0) teams[eligible[0].i].push(p);
    }

    // ── Step 5: Sort each team: GK → DEF → MID → FWD → OTHER ────────────────
    const catOrder: Record<Category, number> = { GK: 0, DEF: 1, MID: 2, FWD: 3, OTHER: 4 };
    const finalTeams = teams.map(team => {
        return team.slice().sort((a, b) => {
            // Find their effective category in this context (gkSlotsOpen=0 now)
            const catA = withCategory.find(x => x.player.id === a.id)?.cat ?? 'OTHER';
            const catB = withCategory.find(x => x.player.id === b.id)?.cat ?? 'OTHER';
            if (catA !== catB) return catOrder[catA] - catOrder[catB];
            return b.ng - a.ng;
        });
    });

    return { teams: finalTeams, bench };
}

export function calculateTeamStats(team: Player[]) {
    const count = team.length || 1;
    return {
        avgNG:        Number(team.reduce((sum, p) => sum + Number(p.ng), 0) / count),
        avgFitness:   Number(team.reduce((sum, p) => sum + Number(p.fitness), 0) / count),
        avgDefensive: Number(team.reduce((sum, p) => sum + Number(p.defensive), 0) / count),
        avgStrengths: Number(team.reduce((sum, p) => sum + Number(p.strengths), 0) / count),
    };
}
