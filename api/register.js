const { cleanString, ensurePlayersTable, requireFields, sql } = require('./_db');

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
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const validationError = requireFields(body, requiredFields);
    const age = Number(body.age);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    if (!Number.isInteger(age) || age < 40 || age > 90) {
      return res.status(400).json({ error: 'Age must be between 40 and 90.' });
    }

    await ensurePlayersTable();
    await sql`
      INSERT INTO players (
        first_name,
        last_name,
        birth_date,
        age,
        contact_number,
        email,
        team_name,
        jersey_number,
        player_position,
        height,
        weight,
        emergency_contact,
        address
      )
      VALUES (
        ${cleanString(body.firstName)},
        ${cleanString(body.lastName)},
        ${cleanString(body.birthDate)},
        ${age},
        ${cleanString(body.contactNumber)},
        ${cleanString(body.email)},
        ${cleanString(body.teamName)},
        ${cleanString(body.jerseyNumber)},
        ${cleanString(body.position)},
        ${cleanString(body.height)},
        ${cleanString(body.weight)},
        ${cleanString(body.emergencyContact)},
        ${cleanString(body.address)}
      )
    `;

    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Registration could not be saved.' });
  }
};
