const { csvCell, getSupabase, parseBody, publicError } = require('./_db');

const adminPassword = 'notsoadmin.*';

const baseColumns = [
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

const optionalColumns = [
  ['jersey_size', 'Jersey Size'],
  ['short_size', 'Short Size'],
  ['work_business', 'Work/Business']
];

const columns = [
  ...baseColumns.slice(0, 12),
  ...optionalColumns,
  ...baseColumns.slice(12)
];

function isMissingOptionalColumn(error) {
  return error && (error.code === '42703' || error.code === 'PGRST204');
}

async function fetchRows(supabase, selectedColumns) {
  return supabase
    .from('players')
    .select(selectedColumns.map(([key]) => key).join(','))
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
    let { data: rows, error } = await fetchRows(supabase, columns);

    if (isMissingOptionalColumn(error)) {
      const fallback = await fetchRows(supabase, baseColumns);
      rows = fillOptionalColumns(fallback.data);
      error = fallback.error;
    }

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
    console.error('CSV export failed:', error);
    const response = publicError(error, 'CSV could not be generated. Check Vercel function logs for details.');
    return res.status(response.status).json({ error: response.message });
  }
};
