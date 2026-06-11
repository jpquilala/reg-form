const { getSupabase, parseBody, publicError } = require('./_db');

const adminPassword = 'notsoadmin.*';

const baseColumns = [
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
  'emergency_contact',
  'address'
];

const optionalColumns = [
  'jersey_size',
  'short_size',
  'work_business'
];

const columns = [
  ...baseColumns.slice(0, 13),
  ...optionalColumns,
  ...baseColumns.slice(13)
];

function isMissingOptionalColumn(error) {
  return error && (error.code === '42703' || error.code === 'PGRST204');
}

async function fetchPlayers(supabase, selectedColumns) {
  return supabase
    .from('players')
    .select(selectedColumns.join(','))
    .order('registered_at', { ascending: false })
    .order('id', { ascending: false });
}

function fillOptionalColumns(rows) {
  return (rows || []).map((row) => ({
    jersey_size: '',
    short_size: '',
    work_business: '',
    ...row
  }));
}

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
    let { data, error } = await fetchPlayers(supabase, columns);
    let warning = '';

    if (isMissingOptionalColumn(error)) {
      const fallback = await fetchPlayers(supabase, baseColumns);
      data = fillOptionalColumns(fallback.data);
      error = fallback.error;
      warning = 'Some new optional columns are not in Supabase yet. Run the latest supabase-schema.sql to enable Jersey Size, Short Size, and Work/Business.';
    }

    if (error) {
      throw error;
    }

    return res.status(200).json({ players: data || [], warning });
  } catch (error) {
    console.error('Player list failed:', error);
    const response = publicError(error, 'Player list could not be loaded. Check Vercel function logs for details.');
    return res.status(response.status).json({ error: response.message });
  }
};
