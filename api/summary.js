const { getSupabase, publicError } = require('./_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabase();
    const { data, error, count } = await supabase
      .from('players')
      .select('id,registered_at,first_name,last_name,team_name,player_position', { count: 'exact' })
      .order('registered_at', { ascending: false })
      .order('id', { ascending: false });

    if (error) {
      throw error;
    }

    const teamCounts = {};
    (data || []).forEach((player) => {
      const teamName = player.team_name || 'No Team';
      teamCounts[teamName] = (teamCounts[teamName] || 0) + 1;
    });

    return res.status(200).json({
      totalPlayers: count || 0,
      teamCounts: Object.entries(teamCounts)
        .map(([teamName, total]) => ({ teamName, total }))
        .sort((a, b) => b.total - a.total || a.teamName.localeCompare(b.teamName)),
      recentLogs: (data || []).slice(0, 10).map((player) => ({
        id: player.id,
        registeredAt: player.registered_at,
        name: `${player.first_name || ''} ${player.last_name || ''}`.trim(),
        teamName: player.team_name || '',
        position: player.player_position || ''
      }))
    });
  } catch (error) {
    console.error('Summary failed:', error);
    const response = publicError(error, 'Registration summary could not be loaded.');
    return res.status(response.status).json({ error: response.message });
  }
};
