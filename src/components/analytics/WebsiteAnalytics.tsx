'use client';
import {useEffect, useState} from 'react';
import {aggregateTrend, type TrendInterval, type AnalyticsReport, type AnalyticsRow} from '@/lib/analytics/shared';
const number = (n: number) => n.toLocaleString();
function Breakdown({title,rows}: {title:string; rows:AnalyticsRow[]}) {
  const total = rows.reduce((sum,row)=>sum+row.views,0);
  return <section className="traffic-panel"><h3>{title}</h3>{rows.length ? <ul className="traffic-bars">{rows.map(row=><li key={row.label}><div><span>{row.label}</span><strong>{number(row.views)} <small>({total ? Math.round(row.views/total*100) : 0}%)</small></strong></div><div className="traffic-track" aria-hidden="true"><span style={{width:`${total ? row.views/total*100 : 0}%`}}/></div></li>)}</ul> : <p className="traffic-muted">No data in this period.</p>}</section>;
}
export function WebsiteAnalytics() {
  const [interval,setInterval] = useState<TrendInterval>('daily');
  const [days,setDays] = useState(30);
  const [ready,setReady] = useState(false);
  const [report,setReport] = useState<AnalyticsReport|null>(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [attempt,setAttempt] = useState(0);
  useEffect(()=>{try {const saved=Number(sessionStorage.getItem('teams-traffic-range'));if([7,30,90].includes(saved))setDays(saved);const savedInterval=sessionStorage.getItem('teams-traffic-interval');if(['daily','weekly','monthly'].includes(savedInterval || ''))setInterval(savedInterval as TrendInterval);}catch{}setReady(true);},[]);
  useEffect(()=>{
    if(!ready)return;
    const controller = new AbortController();
    setLoading(true);setError('');setReport(null);
    try {sessionStorage.setItem('teams-traffic-range',String(days));}catch{}
    void fetch(`/api/admin/analytics?days=${days}`,{cache:'no-store',signal:controller.signal}).then(async response=>{
      if(!response.ok)throw Error('unavailable');
      const data:AnalyticsReport = await response.json();
      if(!controller.signal.aborted)setReport(data);
    }).catch(()=>{if(!controller.signal.aborted)setError('Website analytics are temporarily unavailable. Your operational data is unaffected.');}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return ()=>controller.abort();
  },[days,attempt,ready]);
  useEffect(()=>{if(ready)try{sessionStorage.setItem('teams-traffic-interval',interval);}catch{}},[interval,ready]);
  const trend = aggregateTrend(report?.daily || [], interval);
  const trendLabel = interval === 'daily' ? 'Daily' : interval === 'weekly' ? 'Weekly' : 'Monthly';
  const peak = Math.max(1,...trend.map(d=>d.views));
  const points = trend.map((row,i)=>`${20+i/Math.max(1,trend.length-1)*760},${170-row.views/peak*140}`).join(' ');
  return <section className="website-traffic" aria-labelledby="website-traffic-title" aria-busy={loading}>
    <header className="traffic-heading"><div><p className="traffic-eyebrow">Website intelligence</p><h2 id="website-traffic-title">Visitor & property interest</h2><p className="traffic-muted">Public website activity · Cloudflare Web Analytics</p></div><label className="traffic-range">Period<select aria-label="Analytics period" value={days} onChange={event=>setDays(Number(event.target.value))}>{[7,30,90].map(value=><option key={value} value={value}>Last {value} days</option>)}</select></label></header>
    {loading ? <div role="status" className="traffic-message">Loading website analytics…</div> : error ? <div role="alert" className="traffic-message"><p>{error}</p><button onClick={()=>setAttempt(a=>a+1)}>Try again</button></div> : report?.state === 'setup' ? <div className="traffic-message"><h3>Website analytics are not connected yet</h3><p>Connect Teams Management’s Cloudflare Web Analytics to see traffic and property interest here. No visitor figures are available yet.</p></div> : report && <>
      <div className="traffic-metrics">{[['Visits',report.totals.visits,'Arrivals from outside the website'],['Page views',report.totals.views,'Recorded public-page views'],['Property views',report.totals.propertyViews,'Residential & retail detail pages']].map(([label,value,note])=><div key={label}><p>{label}</p><strong>{number(Number(value))}</strong><small>{note}</small></div>)}</div>
      {!report.totals.views ? <div className="traffic-message"><h3>No recorded traffic for this period</h3><p>This can mean no visits or collection has not started. Earlier traffic cannot be reconstructed if analytics was not enabled.</p></div> : null}
      <section className="traffic-panel"><div className="traffic-chart-heading"><h3>{trendLabel} page views</h3><label>Group by <select aria-label="Trend grouping" value={interval} onChange={event=>setInterval(event.target.value as TrendInterval)}><option value="daily">Day</option><option value="weekly">Week</option><option value="monthly">Month</option></select></label><span className="traffic-muted">UTC · weeks start Monday · boundary periods may be partial</span></div><svg className="traffic-chart" viewBox="0 0 800 200" role="img" aria-label={`${trendLabel} page views over the last ${days} days. Highest period count: ${number(peak === 1 && !report.totals.views ? 0 : peak)}. Exact figures in the table below.`}><line x1="20" x2="780" y1="170" y2="170" stroke="#cbd5e1"/><line x1="20" x2="780" y1="30" y2="30" stroke="#e2e8f0" strokeDasharray="4 4"/><polyline points={points} fill="none" stroke="#155e63" strokeWidth="3" strokeLinejoin="round"/><text x="20" y="195" fontSize="12" fill="#475569">{trend[0]?.day}</text><text x="780" y="195" textAnchor="end" fontSize="12" fill="#475569">{trend.at(-1)?.day}</text></svg><details><summary>View {interval} figures</summary><div className="traffic-table-wrap"><table><thead><tr><th scope="col">Period starting (UTC)</th><th scope="col">Page views</th><th scope="col">Visits</th></tr></thead><tbody>{trend.map(row=><tr key={row.day}><th scope="row">{row.day}</th><td>{number(row.views)}</td><td>{number(row.visits)}</td></tr>)}</tbody></table></div></details></section>
      <div className="traffic-columns"><Breakdown title="Residential vs. retail" rows={report.segments}/><section className="traffic-panel"><h3>Most-viewed properties</h3><p className="traffic-muted">Detail-page views, not availability or applications.</p>{report.properties.length ? <ol className="traffic-properties">{report.properties.map((row,i)=><li key={row.path}><span className="traffic-rank">{i+1}</span><div><a href={row.path}>{row.name}</a><small>{row.segment === 'retail' ? 'Retail' : 'Residential'}</small></div><strong>{number(row.views)}</strong></li>)}</ol>:<p className="traffic-muted">No property detail views recorded.</p>}</section></div>
      <div className="traffic-columns"><Breakdown title="Device types" rows={report.devices}/><Breakdown title="Page-view referral sources" rows={report.channels}/></div>
      <div className="traffic-columns"><Breakdown title="Visitor countries · page views" rows={report.countries || []}/><section className="traffic-panel"><h3>State / region</h3><p className="traffic-muted">State-level location is not available from the connected analytics source. Country locations are approximate, not visitor addresses.</p></section></div>
      <section className="traffic-panel"><h3>Top public pages</h3><ul className="traffic-page-list">{report.pages.map(row=><li key={row.label}><a href={row.label}>{row.label === '/' ? 'Home' : row.label}</a><strong>{number(row.views)}</strong></li>)}</ul></section>
      <p className="traffic-footnote">Source: {report.host} · Updated {new Date(report.generatedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}. Visits are arrivals, not unique people. Cloudflare may sample data; blockers and privacy settings can reduce recorded traffic. Admin and tenant pages are excluded. Staff visits to public pages may still be counted. Referral sources describe page views, not completed inquiries.</p>
    </>}
  </section>;
}
