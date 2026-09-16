import { createAdminClient } from '@/lib/supabase/server';

/**
 * Checks if a Supabase error indicates that a table is missing from the database.
 */
export function isTableMissingError(error: any): boolean {
  if (!error) return false;
  const msg = (error.message || '').toLowerCase();
  return (
    error.code === 'PGRST205' ||
    error.code === '42P01' ||
    msg.includes('schema cache') ||
    msg.includes('does not exist') ||
    msg.includes('not found in the schema')
  );
}

/**
 * Attempts to auto-create a missing table in Supabase via RPC if available.
 */
export async function tryAutoCreateTable(tableName: string, sqlStatement: string): Promise<boolean> {
  const supabase = createAdminClient();
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: sqlStatement });
    if (!error) {
      console.log(`[AUTO SCHEMA] Successfully auto-created table: public.${tableName}`);
      return true;
    }
  } catch (_) {}

  console.warn(`[SUPABASE NOTICE] Table 'public.${tableName}' is missing. Please run SUPABASE_SETUP.md in Supabase SQL Editor.`);
  return false;
}
