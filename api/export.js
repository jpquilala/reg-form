const { csvCell, getSupabase } = require('./_db');

const adminPassword = process.env.ADMIN_PASSWORD || 'iamanadmin.*';

const columns = [
  ['registered_at', 'Registered At'],
  ['first_name', 'First Name'],
  ['last_name', 'Last Name'],
  ['birth_date', 'Birth Date'],
  ['age', 'Age'],
  ['contact_number', 'Contact Number'],
  ['email', 'Email'],
  ['team_name', 'Team Name'],
  ['jersey_number', 'Jersey Number'],
  ['player_position', 'Position'],
  ['height', 'Height'],
  ['weight', 'Weight'],
  ['emergency_contact', 'Emergency Contact'],
  ['address', 'Address']
];

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

  if (body.password !== adminPassword) {
    return res.status(401).json({ error: 'Invalid admin password.' });
  }

  try {
    const supabase = getSupabase();
    const { data: rows, error } = await supabase
      .from('players')
      .select(columns.map(([key]) => key).join(','))
      .order('registered_at', { ascending: false })
      .order('id', { ascending: false });

    if (error) {
      throw error;
    }

    const header = columns.map(([, label]) => csvCell(label)).join(',');
    const lines = (rows || []).map((row) => columns.map(([key]) => csvCell(row[key])).join(','));
    const csv = [header, ...lines].join('\r\n');
    const date = new Date().toISOString().slice(0, 10);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="velvet-masters-registration-${date}.csv"`);
    return res.status(200).send(csv);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'CSV could not be generated.' });
  }
};
