const { createClient } = require('@supabase/supabase-js');

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
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
  getSupabase,
  requireFields
};
