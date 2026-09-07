import { describe, expect, it } from 'vitest';
import { isAdminUser } from './admin';
import type { User } from '@supabase/supabase-js';

function user(email: string, role = ''): User {
  return {
    id: '1',
    email,
    app_metadata: { role },
    user_metadata: {},
    aud: 'authenticated',
    created_at: '',
  } as User;
}

describe('admin access', () => {
  it('grants iedereesfrancis@gmail.com oversight without a role flag', () => {
    expect(isAdminUser(user('iedereesfrancis@gmail.com'))).toBe(true);
  });

  it('does not grant ordinary members admin access', () => {
    expect(isAdminUser(user('member@example.com'))).toBe(false);
    expect(isAdminUser(null)).toBe(false);
  });

  it('still honours the strategy_admin role', () => {
    expect(isAdminUser(user('ops@example.com', 'strategy_admin'))).toBe(true);
  });
});
