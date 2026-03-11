interface Player {
    id: number;
    jugador: string;
    alias?: string;
    ng: number;
    fitness: number;
    defensive: number;
    strengths: number;
    intensity: number;
    pos?: string;
    p_name?: string;
    status?: string;
}

export function generateTeams(players: Player[], teamCount: number = 2) {
    if (players.length === 0) return [];

    // Separate players by priority
    const isGK = (p: Player) => {
        const posStr = p.pos?.toUpperCase() || '';
        const nameStr = p.p_name?.toLowerCase() || '';
        // Check for 'GK', 'Arquero' or the number '1' (as a standalone position)
        return posStr.includes('GK') || 
               nameStr.includes('arquero') || 
               /(^|[^0-9])1([^0-9]|$)/.test(posStr);
    };

    const gks = players.filter(isGK);
    
    // Key tactical positions: 2, 3, 4, 5, 7, 9, 11
    const keyPositions = ['2', '3', '4', '5', '7', '9', '11'];
    const tacticalPlayers = players.filter(p => {
        if (isGK(p)) return false;
        // Check if p.pos contains any of the key position numbers (as independent tokens or with separators)
        return keyPositions.some(kp => {
            const regex = new RegExp(`(^|[^0-9])${kp}([^0-9]|$)`);
            return regex.test(p.pos || '');
        });
    });

    const others = players.filter(p => !isGK(p) && !tacticalPlayers.includes(p));

    // Initialize teams
    const teams: Player[][] = Array.from({ length: teamCount }, () => []);

    // 1. Distribute GKs (Snake by NG)
    gks.sort((a, b) => b.ng - a.ng);
    gks.forEach((p, i) => {
        const teamIdx = i % teamCount;
        teams[teamIdx].push(p);
    });

    // 2. Distribute Tactical players (Snake by NG)
    tacticalPlayers.sort((a, b) => b.ng - a.ng);
    let currentDir = 1;
    let teamIdx = 0;
    
    tacticalPlayers.forEach((p) => {
        teams[teamIdx].push(p);
        teamIdx += currentDir;
        if (teamIdx >= teamCount || teamIdx < 0) {
            currentDir *= -1;
            teamIdx += currentDir;
        }
    });

    // 3. Distribute Others (Snake by NG) - but slightly smarter to balance total NG
    others.sort((a, b) => b.ng - a.ng);
    
    others.forEach((p) => {
        // Find team with lowest total NG
        const teamSums = teams.map(t => t.reduce((sum, player) => sum + Number(player.ng), 0));
        const minNG = Math.min(...teamSums);
        const targetTeamIdx = teamSums.indexOf(minNG);
        teams[targetTeamIdx].push(p);
    });

    // Final Sort: Ensure GKs are first, then the rest by NG
    return teams.map(team => {
        const teamGKs = team.filter(isGK);
        const teamRest = team.filter(p => !isGK(p))
                             .sort((a, b) => b.ng - a.ng);
        return [...teamGKs, ...teamRest];
    });
}

export function calculateTeamStats(team: Player[]) {
    const count = team.length || 1;
    return {
        avgNG: Number(team.reduce((sum, p) => sum + Number(p.ng), 0) / count),
        avgFitness: Number(team.reduce((sum, p) => sum + Number(p.fitness), 0) / count),
        avgDefensive: Number(team.reduce((sum, p) => sum + Number(p.defensive), 0) / count),
        avgStrengths: Number(team.reduce((sum, p) => sum + Number(p.strengths), 0) / count),
    };
}
