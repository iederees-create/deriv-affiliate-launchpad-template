import { describe,expect,it } from 'vitest';
import { emptyStrategyAccount,maskLogin,statusLabel,validateStrategyAccount } from './managedStrategy';
describe('managed strategy safety helpers',()=>{
 it('masks all but final four login digits',()=>{expect(maskLogin('123456789')).toBe('•••• 6789');expect(maskLogin('12')).toBe('•••• ••12');expect(maskLogin('')).toBe('Not submitted')});
 it('rejects blank, invalid and incompatible submissions',()=>{expect(validateStrategyAccount(emptyStrategyAccount).length).toBeGreaterThan(0);expect(validateStrategyAccount({...emptyStrategyAccount,deriv_account_type:'Other'})).toContain('Nakala onboarding currently requires MT5 Standard.')});
 it('accepts a complete non-secret reference record',()=>expect(validateStrategyAccount({...emptyStrategyAccount,display_name:'Practice account',mt5_server:'Deriv-Demo',mt5_login_id:'12345678',country:'South Africa',referral_confirmation:'member_confirmed',risk_acknowledged:true,controls_acknowledged:true})).toEqual([]));
 it('formats controlled statuses',()=>{expect(statusLabel('more_information_required')).toBe('More Information Required');expect(statusLabel('verified')).toBe('Affiliate Referral Verified')});
});
