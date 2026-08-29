import { useState } from 'react';
import { Activity, BarChart3, BookOpenCheck, CheckCircle, Clock3, DownloadCloud, FileSpreadsheet, LineChart, LoaderCircle, Lock, Play, Target } from 'lucide-react';
import { Seo } from '../components/Seo';
import { ManagedStrategy } from '../components/ManagedStrategy';
import { PremiumToolModal, type PremiumTool } from '../components/PremiumTools';
import { affiliateConfig } from '../config/affiliateConfig';
import { downloadText } from '../lib/memberTools';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';

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


export function MembersDashboard(){
 const [active,setActive]=useState<PremiumTool|null>(null),[busy,setBusy]=useState('');
 const {user,signOut}=useAuth();const navigate=useNavigate();
 const get=(item:typeof downloads[number])=>{setBusy(item.title);setTimeout(()=>{downloadText(item.file,item.content,item.mime);setBusy('')},250)};
 const leave=async()=>{await signOut();navigate('/auth',{replace:true})};
 return <><Seo title={`VIP Dashboard | ${affiliateConfig.brandName}`} description="Protected VIP planning tools, journals and demo-practice resources."/><section className="section members-page"><div className="members-shell">
  <header className="members-header"><div><p className="eyebrow">Apex Trade Network</p><h1>VIP Dashboard</h1></div><div className="member-menu"><span><Lock size={15}/> {user?.user_metadata?.full_name||user?.email}</span><button className="cta cta-secondary" onClick={leave}>Sign Out</button></div></header>
  <div className="vip-panel is-linked"><h2><CheckCircle/> VIP Premium Access</h2><ManagedStrategy/>
   <div className="vip-resources-heading"><div><p className="eyebrow">Nine member resources</p><h3>Plan, practise and review</h3></div><p>These tools do not place trades. Public live quotes live on the beginner desk.</p></div>
   <div className="vip-resource-grid">
    {downloads.map(item=><article className="vip-resource-card" key={item.title}><div className="resource-meta"><span className="type-badge">{item.badge}</span></div><item.icon className="resource-icon"/><h4>{item.title}</h4><p>{item.text}</p><button className="cta cta-secondary resource-button" disabled={busy===item.title} onClick={()=>get(item)}>{busy===item.title?<><LoaderCircle className="spin" size={16}/> Preparing...</>:<><DownloadCloud size={16}/>{item.label}</>}</button></article>)}
    {tools.map(item=><article className="vip-resource-card new-resource" key={item.title}><div className="resource-meta"><span className="type-badge">{item.badge}</span><span className="new-badge">New</span></div><item.icon className="resource-icon"/><h4>{item.title}</h4><p>{item.text}</p><button className="cta cta-primary resource-button" onClick={()=>setActive(item.tool)}>{item.label}</button></article>)}
   </div><p className="educational-notice">Educational tools only. Calculations are estimates and not financial advice. Trading involves risk. Test strategies using a demo account first.</p>
  </div></div></section>{active&&<PremiumToolModal tool={active} onClose={()=>setActive(null)}/>}</>;
}
