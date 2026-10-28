// Run against the synthetic localhost workflow report, never a hosted load test.
const fs=require('node:fs');
if(!process.argv[2])throw Error('Provide the local workflow JSON report.');
const report=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
if(!/local/i.test(report.environment||''))throw Error('Only local synthetic D1 reports are accepted.');
let failed=false;
for(const workflow of report.results){
 const incomplete=workflow.queries!==workflow.measuredQueries||workflow.failedQueries;
 const runaway=workflow.rowsRead>20000||workflow.queries>60;
 const idle=workflow.name==='Rent Roll idle 65s'&&workflow.requests>0;
 if(incomplete||runaway||idle){failed=true;console.error(`${workflow.name}: usage budget exceeded or metering incomplete (${workflow.rowsRead} reads, ${workflow.queries} queries).`);}
}
if(failed)process.exitCode=1;else console.log('Local D1 workflow budgets and metadata coverage passed.');
