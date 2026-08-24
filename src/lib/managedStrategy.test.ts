import {describe,expect,it} from 'vitest';
import {emptyStrategyAccount,maskLogin,statusLabel,validateStrategyAccount} from './managedStrategy';
describe('managed strategy safety helpers',()=>{
 it('masks all but final four login digits',()=>expect(maskLogin('0012345678')).toBe('•••• 5678'));
 it('rejects incomplete and non-real submissions',()=>{const errors=validateStrategyAccount(emptyStrategyAccount);expect(errors).toContain('Confirm this is a real Deriv MT5 account.');expect(errors).toContain('Confirm the account belongs to you.')});
 it('accepts a real account reference with leading zero login',()=>expect(validateStrategyAccount({...emptyStrategyAccount,broker_entity:'Deriv',mt5_server:'DerivSVG-Server',mt5_login_id:'00123456',real_account_confirmed:true,ownership_confirmed:true,risk_acknowledged:true})).toEqual([]));
 it('formats controlled statuses',()=>{expect(statusLabel('pending')).toBe('Affiliate verification pending');expect(statusLabel('strategy_active')).toBe('Strategy active')});
});
