interface Player {
    id: number;
    jugador: string;
    ng: number;
    ef: number;
    co: number;
    cd: number;
    intensidad: number;
    posiciones: string;
}

export function generateTeams(players: Player[], teamCount: number = 2) {
    // Simple algorithm: Sort by NG and distribute in "snake" fashion
    // This can be improved with more complex balancing later
    const sortedPlayers = [...players].sort((a, b) => b.ng - a.ng);

    const teams: Player[][] = Array.from({ length: teamCount }, () => []);

    sortedPlayers.forEach((player, index) => {
        // Snake distribution: 0, 1, 1, 0, 0, 1... for 2 teams
        const cycle = teamCount * 2;
        const posInCycle = index % cycle;
        let teamIndex;

        if (posInCycle < teamCount) {
            teamIndex = posInCycle;
        } else {
            teamIndex = teamCount - 1 - (posInCycle - teamCount);
        }

        teams[teamIndex].push(player);
    });

    return teams;
}

export function calculateTeamStats(team: Player[]) {
    const count = team.length || 1;
    return {
        avgNG: team.reduce((sum, p) => sum + Number(p.ng), 0) / count,
        avgEF: team.reduce((sum, p) => sum + Number(p.ef), 0) / count,
        avgCO: team.reduce((sum, p) => sum + Number(p.co), 0) / count,
        avgCD: team.reduce((sum, p) => sum + Number(p.cd), 0) / count,
    };
}
