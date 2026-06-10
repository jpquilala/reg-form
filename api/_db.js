const { sql } = require('@vercel/postgres');

async function ensurePlayersTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS players (
      id SERIAL PRIMARY KEY,
      registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      birth_date DATE NOT NULL,
      age INTEGER NOT NULL,
      contact_number TEXT NOT NULL,
      email TEXT,
      team_name TEXT NOT NULL,
      jersey_number TEXT NOT NULL,
      player_position TEXT NOT NULL,
      height TEXT,
      weight TEXT,
      emergency_contact TEXT NOT NULL,
      address TEXT NOT NULL
    )
  `;
}

function cleanString(value) {
  return String(value || '').trim();
}

function requireFields(body, requiredFields) {
  const missing = requiredFields.filter((field) => !cleanString(body[field]));
  if (missing.length) {
    return `Missing required fields: ${missing.join(', ')}`;
  }
  return '';
}

function csvCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

module.exports = {
  cleanString,
  csvCell,
  ensurePlayersTable,
  requireFields,
  sql
};
