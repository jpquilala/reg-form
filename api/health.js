const { getSupabase, publicError } = require('./_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('players')
      .select('id', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      ok: true,
      supabaseConfigured: true,
      playersTableReady: true
    });
  } catch (error) {
    console.error('Health check failed:', error);
    const response = publicError(error, 'Supabase connection failed. Check Vercel function logs for details.');
    return res.status(response.status).json({
      ok: false,
      error: response.message
    });
  }
};
