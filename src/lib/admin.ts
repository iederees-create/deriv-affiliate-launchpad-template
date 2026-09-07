import type { User } from '@supabase/supabase-js';

export const ADMIN_EMAILS = ['iedereesfrancis@gmail.com'];

export function isAdminUser(user: User | null | undefined) {
  if (!user) return false;
  const email = String(user.email || '').trim().toLowerCase();
  const role = String(user.app_metadata?.role || '');
  return ADMIN_EMAILS.includes(email) || role === 'admin' || role === 'strategy_admin';
}
