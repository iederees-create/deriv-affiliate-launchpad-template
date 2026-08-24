import { useEffect, useState, type FormEvent } from 'react';
import { Activity, BarChart3, BookOpenCheck, CheckCircle, Clock3, DownloadCloud, ExternalLink, FileSpreadsheet, LineChart, LoaderCircle, Lock, Play, Target } from 'lucide-react';
import { Seo } from '../components/Seo';
import { ManagedStrategy } from '../components/ManagedStrategy';
import { PremiumToolModal, type PremiumTool } from '../components/PremiumTools';
import { affiliateConfig } from '../config/affiliateConfig';
import { downloadText } from '../lib/memberTools';
import { supabase } from '../lib/supabase';

const downloads = [
  { badge:'Download', title:'Crash & Boom Demo Checklist', text:'A responsible pre-trade checklist for testing setups without exact-entry or spike-prediction claims.', icon:BookOpenCheck, label:'Download Guide', file:'apex-demo-checklist.txt', content:'APEX DEMO CHECKLIST\n\n[ ] Demo account selected\n[ ] Instrument specifications checked\n[ ] Maximum risk written down\n[ ] Stop and target planned\n[ ] No trade entered to chase a spike\n\nThere are no exact or guaranteed entries. Test on demo and record outcomes. Educational only; not financial advice.' },
  { badge:'Download', title:'Risk Planning Worksheet', text:'Plan position size and account risk before placing a trade. Calculations and limits remain your responsibility.', icon:FileSpreadsheet, label:'Download CSV', file:'apex-risk-planning.csv', content:'Account balance,Risk percent,Maximum planned risk,Daily loss limit,Notes\n1000,1,10,20,Demo example only\n', mime:'text/csv;charset=utf-8' },
  { badge:'MT5', title:'Indicator Demo Test Plan', text:'A structured way to test indicator alerts on demo. Indicators cannot predict guaranteed spikes or prevent losses.', icon:Activity, label:'Download Test Plan', file:'apex-indicator-test-plan.txt', content:'APEX INDICATOR DEMO TEST PLAN\n\nIndicators cannot reliably predict spikes or prevent losses.\n\n1. Install only trusted files.\n2. Verify compatibility.\n3. Test on demo first.\n4. Record at least 30 alerts.\n5. Measure false alerts and missed moves.\n\nNo indicator guarantees an outcome. Trading involves risk.' },
  { badge:'MT5', title:'Automated EA Demo Test Plan', text:'A safety-first checklist for testing automated bots on demo. Automation can amplify losses and needs monitoring.', icon:Play, label:'Download Test Plan', file:'apex-ea-test-plan.txt', content:'APEX EA DEMO TEST PLAN\n\nBots can malfunction, overtrade or amplify losses. No bot guarantees profit.\n\n[ ] Use demo first\n[ ] Confirm instrument and permissions\n[ ] Set trade and daily loss limits\n[ ] Test disconnections and restarts\n[ ] Compare backtests with forward demo results\n[ ] Monitor every session\n\nEducational only; not financial advice.' }
];

const tools:{badge:string;title:string;text:string;icon:typeof Target;label:string;tool:PremiumTool}[] = [
  {badge:'Planner',title:'Risk-to-Reward Trade Planner',text:'Estimate planned risk, potential reward, reward-to-risk ratio and break-even price before a trade.',icon:Target,label:'Open Planner',tool:'trade-planner'},
  {badge:'Calculator',title:'Drawdown Recovery Calculator',text:'Measure drawdown and the mathematical percentage gain required to return to a previous peak.',icon:LineChart,label:'Open Calculator',tool:'drawdown'},
  {badge:'Tracker',title:'Smart Trading Journal',text:'Store trade records locally, review performance statistics, and import or export CSV data.',icon:BarChart3,label:'Open Journal',tool:'journal'},
  {badge:'Planner',title:'Global Trading Session Planner',text:'View four major sessions in your local timezone with DST-aware conversion.',icon:Clock3,label:'Open Session Planner',tool:'sessions'},
  {badge:'Tracker',title:'30-Trade Demo Practice Challenge',text:'Build a disciplined demo routine across 30 practice trades with a repeatable checklist.',icon:CheckCircle,label:'Start Demo Challenge',tool:'challenge'}
];

const mask=(value:string)=>value.includes('@')?`${value.slice(0,2)}...@${value.split('@')[1]}`:`${value.slice(0,2)}...${value.slice(-2)}`;

export function MembersDashboard(){
  const [userId,setUserId]=useState(''),[derivId,setDerivId]=useState(''),[linked,setLinked]=useState(false),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[message,setMessage]=useState(''),[active,setActive]=useState<PremiumTool|null>(null),[busy,setBusy]=useState('');
  useEffect(()=>{(async()=>{const {data:{user}}=await supabase.auth.getUser(); if(user){setUserId(user.id);const {data}=await supabase.from('profiles').select('deriv_id').eq('user_id',user.id).single();if(data?.deriv_id){setDerivId(data.deriv_id);setLinked(true)}}setLoading(false)})()},[]);
  const save=async(event:FormEvent)=>{event.preventDefault();if(!derivId.trim())return;setSaving(true);setMessage('');try{const {error}=await supabase.from('profiles').update({deriv_id:derivId.trim(),updated_at:new Date().toISOString()}).eq('user_id',userId);if(error)throw error;setLinked(true);setMessage('Account linked successfully.')}catch(reason){setMessage(reason instanceof Error?reason.message:'Failed to link account.')}finally{setSaving(false)}};
  const get=(item:typeof downloads[number])=>{setBusy(item.title);setTimeout(()=>{downloadText(item.file,item.content,item.mime);setBusy('')},250)};
  if(loading)return <div className="member-loading" role="status"><LoaderCircle className="spin"/> Loading VIP access...</div>;
  return <><Seo title={`VIP Dashboard | ${affiliateConfig.brandName}`} description="Protected VIP planning tools, journals and demo-practice resources."/><section className="section members-page"><div className="members-shell">
    <header className="members-header"><div><p className="eyebrow">Apex Trade Network</p><h1>VIP Dashboard</h1></div><span className="privacy-chip"><Lock size={15}/> Protected member area</span></header>
    <div className={`vip-panel ${linked?'is-linked':''}`}><h2>{linked?<CheckCircle/>:<Lock/>} VIP Premium Access</h2>
    {!linked?<><p className="muted">Link your Deriv account to unlock the protected tools and downloads in this member area.</p><ol className="unlock-steps"><li>Create a Deriv account using the disclosed partner route.</li><li>Enter its email address below.</li></ol><a href={affiliateConfig.primaryAffiliateLink} target="_blank" rel="noreferrer" className="cta cta-primary">Create Deriv Account <ExternalLink size={16}/></a><form className="link-account-form" onSubmit={save}><label><span>Deriv account email</span><input type="email" value={derivId} onChange={e=>setDerivId(e.target.value)} placeholder="name@example.com" required/></label><button className="cta" disabled={saving}>{saving?<><LoaderCircle className="spin" size={16}/> Linking...</>:'Unlock'}</button></form>{message&&<p role="status">{message}</p>}</>:<>
      <div className="linked-message"><CheckCircle size={18}/> Member account linked: <strong>{mask(derivId)}</strong></div><p className="muted">The full account identifier is hidden to reduce accidental exposure in screenshots.</p>
      <ManagedStrategy/>
      <div className="vip-resources-heading"><div><p className="eyebrow">Nine member resources</p><h3>Plan, practise and review</h3></div><p>These tools do not place trades or use fabricated live prices.</p></div>
      <div className="vip-resource-grid">
        {downloads.map(item=><article className="vip-resource-card" key={item.title}><div className="resource-meta"><span className="type-badge">{item.badge}</span></div><item.icon className="resource-icon"/><h4>{item.title}</h4><p>{item.text}</p><button className="cta cta-secondary resource-button" disabled={busy===item.title} onClick={()=>get(item)}>{busy===item.title?<><LoaderCircle className="spin" size={16}/> Preparing...</>:<><DownloadCloud size={16}/>{item.label}</>}</button></article>)}
        {tools.map(item=><article className="vip-resource-card new-resource" key={item.title}><div className="resource-meta"><span className="type-badge">{item.badge}</span><span className="new-badge">New</span></div><item.icon className="resource-icon"/><h4>{item.title}</h4><p>{item.text}</p><button className="cta cta-primary resource-button" onClick={()=>setActive(item.tool)}>{item.label}</button></article>)}
      </div><p className="educational-notice">Educational tools only. Calculations are estimates and not financial advice. Trading involves risk. Test strategies using a demo account first.</p>
    </>}</div>
  </div></section>{active&&<PremiumToolModal tool={active} onClose={()=>setActive(null)}/>}</>;
}
