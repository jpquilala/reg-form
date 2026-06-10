const { cleanString, getSupabase, parseBody, publicError, requireFields } = require('./_db');

const requiredFields = [
  'firstName',
  'lastName',
  'birthDate',
  'age',
  'contactNumber',
  'teamName',
  'jerseyNumber',
  'position',
  'emergencyContact',
  'address'
];

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = parseBody(req);
    const validationError = requireFields(body, requiredFields);
    const age = Number(body.age);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    if (!Number.isInteger(age) || age < 30 || age > 90) {
      return res.status(400).json({ error: 'Age must be between 30 and 90.' });
    }

    const supabase = getSupabase();
    const { error } = await supabase.from('players').insert({
      first_name: cleanString(body.firstName),
      last_name: cleanString(body.lastName),
      birth_date: cleanString(body.birthDate),
      age,
      contact_number: cleanString(body.contactNumber),
      email: cleanString(body.email),
      team_name: cleanString(body.teamName),
      jersey_number: cleanString(body.jerseyNumber),
      player_position: cleanString(body.position),
      height: cleanString(body.height),
      weight: cleanString(body.weight),
      emergency_contact: cleanString(body.emergencyContact),
      address: cleanString(body.address)
    });

    if (error) {
      throw error;
    }

    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Registration save failed:', error);
    const response = publicError(error, 'Registration could not be saved. Check Vercel function logs for details.');
    return res.status(response.status).json({ error: response.message });
  }
};
