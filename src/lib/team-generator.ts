interface Player {
    id: number;
    jugador: string;
    alias?: string;
    ng: number;
    fitness: number;
    defensive: number;
    strengths: number;
    intensity: number;
    status?: string;
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
        avgNG: Number(team.reduce((sum, p) => sum + Number(p.ng), 0) / count),
        avgFitness: Number(team.reduce((sum, p) => sum + Number(p.fitness), 0) / count),
        avgDefensive: Number(team.reduce((sum, p) => sum + Number(p.defensive), 0) / count),
        avgStrengths: Number(team.reduce((sum, p) => sum + Number(p.strengths), 0) / count),
    };
}
