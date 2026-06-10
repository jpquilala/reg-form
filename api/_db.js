const { createClient } = require('@supabase/supabase-js');

class SetupError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = 'SetupError';
    this.status = status;
  }
}

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new SetupError('Supabase is not configured in Vercel. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.', 503);
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function parseBody(req) {
  return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
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

function publicError(error, fallbackMessage) {
  if (error instanceof SetupError) {
    return {
      status: error.status,
      message: error.message
    };
  }

  if (error && (error.code === '42P01' || error.code === 'PGRST205')) {
    return {
      status: 503,
      message: 'Supabase players table is missing. Run supabase-schema.sql in the Supabase SQL Editor, then redeploy or retry.'
    };
  }

  if (error && (error.status === 401 || /invalid api key|jwt|permission/i.test(error.message || ''))) {
    return {
      status: 503,
      message: 'Supabase credentials were rejected. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.'
    };
  }

  return {
    status: 500,
    message: fallbackMessage
  };
}

module.exports = {
  cleanString,
  csvCell,
  getSupabase,
  parseBody,
  publicError,
  requireFields
};
