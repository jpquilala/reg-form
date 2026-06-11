const { getSupabase, parseBody, publicError } = require('./_db');

const adminPassword = 'notsoadmin.*';

const columns = [
  'id',
  'registered_at',
  'first_name',
  'last_name',
  'birth_date',
  'age',
  'contact_number',
  'email',
  'team_name',
  'jersey_number',
  'player_position',
  'height',
  'weight',
  'jersey_size',
  'short_size',
  'work_business',
  'emergency_contact',
  'address'
];

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = parseBody(req);

  if (body.password !== adminPassword) {
    return res.status(401).json({ error: 'Invalid admin password.' });
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('players')
      .select(columns.join(','))
      .order('registered_at', { ascending: false })
      .order('id', { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json({ players: data || [] });
  } catch (error) {
    console.error('Player list failed:', error);
    const response = publicError(error, 'Player list could not be loaded. Check Vercel function logs for details.');
    return res.status(response.status).json({ error: response.message });
  }
};
