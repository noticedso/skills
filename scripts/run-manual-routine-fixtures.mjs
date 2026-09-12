/** Synthetic tool simulation. No live noticed/Notion/customer writes. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const runtime = resolve(process.argv[2] ?? '.');
const require = createRequire(resolve(runtime, 'apps/noticed-agent/package.json'));
const lib = async name => import(pathToFileURL(require.resolve(name)));
const {generateText, tool, stepCountIs, gateway} = await lib('ai');
const {z} = await lib('zod');
const {config} = await lib('dotenv');
config({path: resolve(runtime,'apps/noticed-agent/.env'), quiet:true});
const policy = readFileSync(resolve(runtime,'packages/agent-core/src/model-policy.ts'),'utf8');
const modelId = policy.match(/NOTICED_LANGUAGE_MODEL\s*=\s*"([^"]+)"/)[1];
const skillSources = Object.fromEntries(['daily-opportunities/SKILL.md','daily-outreach/SKILL.md','_shared/research-partner-routines.md','_shared/research-partner-notion.md'].map(p=>[p,readFileSync(resolve('skills',p),'utf8')]));
const source = Object.values(skillSources).join('\n\n');
const profiles = ['alpha','beta','connectors'];
const candidates = Object.fromEntries(profiles.map((p,i)=>[p,Array.from({length:25},(_,n)=>({id:`${p}-${n+1}`,rank:n+1,reason:`Synthetic evidence ${i+1}/${n+1}`}))]));
let state = {customer:'synthetic-buyer', reviewer:'synthetic-reviewer', team:'synthetic-team', goal:'Book meetings with logistics software buyers', target:5, profiles, candidates, iterations:{}, lists:{}, outreach:{}, metrics:{}};
const sourceHash=createHash('sha256').update(source).digest('hex');
const mismatchOnly=process.argv.includes('--mismatch-only');
const outreachOnly=process.argv.includes('--outreach-only');
const resumePath=mismatchOnly||outreachOnly?null:process.argv[3];
const previous=resumePath?JSON.parse(readFileSync(resumePath,'utf8')):null;
const retained=new Set(['prepare-three-batches','retry-preparation','independent-learning']);
if(previous){assert.equal(previous.sourceHash,sourceHash,'Cannot retain traces from different skill sources');state=previous.state;}
const trace=previous?previous.trace.filter(t=>retained.has(t.scenario)):[];
let scenario='';
const record=(name,args,result)=>{trace.push({scenario,name,args,result:structuredClone(result)});return result;};
const mk=(name,schema,execute)=>tool({description:`Synthetic adapter for ${name}. All data belongs to the fixture customer.`,inputSchema:z.object(schema),execute:async args=>record(name,args,await execute(args))});
const tools={
 read_workspace:mk('read_workspace',{},()=>structuredClone(state)),
 list_lists:mk('list_lists',{},()=>Object.values(state.lists)),
 create_list:mk('create_list',{name:z.string(),description:z.string(),ai_enabled:z.boolean()},a=>{const id=`list-${Object.keys(state.lists).length+1}`;state.lists[id]={id,...a,members:[],answers:[],config:null};return state.lists[id];}),
 add_to_list:mk('add_to_list',{list_id:z.string(),person_id:z.string()},a=>{const l=state.lists[a.list_id];if(!l.members.includes(a.person_id))l.members.push(a.person_id);return {ok:true};}),
 get_list:mk('get_list',{list_id:z.string()},a=>structuredClone(state.lists[a.list_id])),
 configure_list_review:mk('configure_list_review',{list_id:z.string(),question:z.string(),description:z.string()},a=>{const l=state.lists[a.list_id];if(l.answers.length)return {error:'review_config_locked'};l.config={question:a.question,description:a.description};return structuredClone(l.config);}),
 get_list_reviews:mk('get_list_reviews',{list_id:z.string(),page:z.number().optional()},a=>{const l=state.lists[a.list_id],page=a.page??1;return {config:l.config,total:l.members.length,reviewed:l.answers.length,counts:Object.fromEntries(['yes','no','not_sure'].map(v=>[v,l.answers.filter(r=>r.answer===v).length])),page,pageSize:10,hasMore:page*10<l.answers.length,answers:l.answers.slice((page-1)*10,page*10)};}),
 // These adapters stand in for existing customer Notion schemas/templates, not new product APIs.
 notion_save_iteration:mk('notion_save_iteration',{profile:z.string(),iteration:z.number(),status:z.enum(['Preparing','To review','Complete']),list_id:z.string().optional(),candidate_ids:z.array(z.string()).optional(),yes:z.number().optional(),no:z.number().optional(),not_sure:z.number().optional(),learning:z.string().optional(),candidates:z.array(z.object({id:z.string(),rank:z.number(),reason:z.string()})).optional()},a=>{const key=`${a.profile}:${a.iteration}`;state.iterations[key]={...state.iterations[key],...a};const i=state.iterations[key];i.reviewed=(i.yes??0)+(i.no??0)+(i.not_sure??0);i.yes_rate=i.reviewed===25?i.yes/25:null;return structuredClone(i);}),
 notion_save_outreach:mk('notion_save_outreach',{person_id:z.string(),status:z.enum(['To contact','Contacted','Replied','Booked','Dropped']).optional(),draft:z.string().optional(),approach:z.string().optional(),sender:z.string().optional(),channel:z.string().optional(),next_step:z.string().optional(),activity:z.array(z.string()).describe('Replaces the entire Activity block if supplied. Include every existing entry unchanged before appending new activity. Omit to preserve it.').optional()},a=>{state.outreach[a.person_id]={...state.outreach[a.person_id],...a};return structuredClone(state.outreach[a.person_id]);}),
 notion_update_dashboard:mk('notion_update_dashboard',{reviewed:z.number().optional(),yes_rate:z.number().nullable().optional(),contacted:z.number().optional(),replied:z.number().optional(),booked:z.number().optional(),reply_rate:z.number().nullable().optional(),conversion:z.number().nullable().optional()},a=>{Object.assign(state.metrics,a);return structuredClone(state.metrics);}),
};
const results=previous?previous.results.filter(r=>retained.has(r.id)).map(r=>({...r,retainedFrom:resumePath,sourceHash:previous.sourceHash})):[];
async function run(id,prompt,check){
 if(previous&&retained.has(id))return;
 scenario=id; const start=trace.length;
 const outreach=['drafts-and-withdrawals','retry-outreach','confirmed-activity-metrics'].includes(id);
 const activeSkill=outreach?'daily-outreach':'daily-opportunities';
 const activeSource=[skillSources[`${activeSkill}/SKILL.md`],skillSources['_shared/research-partner-routines.md'],skillSources['_shared/research-partner-notion.md']].join('\n\n');
 const existingDrafts=new Set(Object.entries(state.outreach).filter(([,v])=>v.draft).map(([id])=>id));
 const result=await generateText({model:gateway(modelId),system:`You are executing the attached manual skills against synthetic tools only. These fixture adapters implement noticed list/review operations and a simplified Notion schema. Customer identity and reviewer are verified by read_workspace. All fixture writes for the requested step are authorized; no real messages or schedules exist. Do not run a maintenance loop. You must actually use tools and read back writes. Do not merely propose operations. Rates are decimals. Execute only the named ${activeSkill} skill.\n${activeSource}`,prompt,tools,stopWhen:stepCountIs(35),abortSignal:AbortSignal.timeout(300000),onStepFinish:step=>console.log(JSON.stringify({id,stepTools:step.toolCalls?.length??0})),maxOutputTokens:8000});
 let passed=true,error=null;try{const calls=trace.slice(start);if(outreach){for(const c of calls){if(c.name==='notion_update_dashboard'){assert.ok(!('reviewed' in c.args)&&!('yes_rate' in c.args),'Outreach must not patch opportunity metrics');}if(c.name==='notion_save_outreach'&&existingDrafts.has(c.args.person_id)){assert.ok(!('draft' in c.args),'Existing drafts must be omitted from unrelated patches');}}}check(calls);}catch(e){passed=false;error=e.message;}
 results.push({id,passed,error,activeSkill,activeSourceHash:createHash('sha256').update(activeSource).digest('hex'),sourceHash,executedAt:new Date().toISOString(),toolCalls:trace.length-start,text:result.text});
 console.log(JSON.stringify({id,passed,error,toolCalls:trace.length-start}));
 writeFileSync(mismatchOnly?'manual-mismatch-results.json':outreachOnly?'manual-outreach-results.json':'manual-fixture-results.json',JSON.stringify({modelId,sourceHash,limitation:'Synthetic tool adapters; no live Notion, MCP transport or Codex-client execution. PostgreSQL and MCP contracts are tested separately in the app PR.',results,trace,state},null,2));
 if(!passed) throw new Error(`${id}: ${error}`);
}
if(mismatchOnly){
 const ids=candidates.alpha.map(c=>c.id);
 state={customer:'synthetic-buyer',reviewer:'synthetic-reviewer',team:'synthetic-team',goal:'Book logistics buyer meetings',target:5,profiles:['alpha'],candidates:{alpha:candidates.alpha},iterations:{'alpha:1':{profile:'alpha',iteration:1,status:'To review',list_id:'list-mismatch',candidate_ids:ids,candidates:candidates.alpha}},lists:{'list-mismatch':{id:'list-mismatch',name:'Alpha iteration 1',description:'Fixed batch',ai_enabled:false,members:ids.slice(1),config:{question:'Fit?',description:'Confirmed criteria'},answers:ids.slice(1).map(id=>({relationshipId:id,answer:'yes',notes:'Human approval'}))}},outreach:{},metrics:{}};
 await run('membership-mismatch','Run only learning/reconciliation for the saved iteration. Compare its original batch to the current list; do not assume counters prove membership.',calls=>{assert.notEqual(state.iterations['alpha:1'].status,'Complete');assert.equal(state.iterations['alpha:1'].yes_rate??null,null);assert.deepEqual(state.iterations['alpha:1'].candidate_ids,ids);assert.ok(calls.some(c=>c.name==='get_list'));const lastWrite=calls.findLastIndex(c=>c.name.startsWith('notion_'));assert.ok(lastWrite<0||calls.slice(lastWrite+1).some(c=>c.name==='read_workspace'),'Final reconciliation write must be read back');assert.equal(Object.keys(state.iterations).length,1);assert.equal(state.lists['list-mismatch'].members.length,24);assert.ok(!calls.some(c=>['create_list','add_to_list','configure_list_review'].includes(c.name)));});
 process.exit(0);
}
if(!outreachOnly){
await run('prepare-three-batches','Run daily-opportunities: prepare the first iteration for all three profiles using the ranked candidates in the fixture. Profile definitions and meeting target are confirmed in the fixture. The candidates are already researched and defensible; use their IDs and ranking. Each list must contain exactly its 25 candidates, reviews configured, and its private iteration saved. Stop when all three are ready for review.',()=>{assert.equal(Object.keys(state.lists).length,3);assert.equal(Object.keys(state.iterations).length,3);for(const p of profiles){const i=state.iterations[`${p}:1`];assert.equal(i.status,'To review');assert.equal(i.candidate_ids.length,25);assert.deepEqual(i.candidates,candidates[p]);const l=state.lists[i.list_id];assert.equal(l.ai_enabled,false);assert.deepEqual([...l.members].sort(),candidates[p].map(c=>c.id).sort());assert.ok(l.config.question);}});
await run('retry-preparation','Retry the same preparation step after a lost final response. Reconcile the existing saved iterations and lists; preserve them.',()=>{assert.equal(Object.keys(state.lists).length,3);assert.equal(Object.keys(state.iterations).length,3);});
for(const p of profiles){const l=state.lists[state.iterations[`${p}:1`].list_id];l.answers=l.members.slice(0,p==='beta'?10:25).map((id,n)=>({relationshipId:id,answer:n<10?'yes':n<22?'no':'not_sure',notes:`Human reason ${n}`}));}
await run('independent-learning','Run only the learning/reconciliation step. The fixture human has now answered. Do not prepare new iterations. Refresh current iteration results and opportunity metrics where supported.',()=>{assert.equal(state.iterations['alpha:1'].status,'Complete');assert.equal(state.iterations['alpha:1'].yes_rate,.4);assert.ok(state.iterations['alpha:1'].learning);assert.equal(state.iterations['beta:1'].status,'To review');assert.equal(state.iterations['connectors:1'].status,'Complete');assert.equal(Object.keys(state.iterations).length,3);});
}else{
 state.metrics={reviewed:50,yes_rate:.4}; // Stale opportunity snapshot must survive outreach unchanged.
 for(const p of profiles){const id=`list-${p}`;state.lists[id]={id,ai_enabled:false,members:candidates[p].map(c=>c.id),config:{question:'Fit?',description:'Confirmed criteria'},answers:[]};state.iterations[`${p}:1`]={profile:p,iteration:1,status:'To review',list_id:id,candidate_ids:candidates[p].map(c=>c.id),candidates:candidates[p]};}
}
// Narrow outreach fixture covers stale approvals, duplicates, withdrawal and human edits.
for(const l of Object.values(state.lists))l.answers=[];
const a=state.lists[state.iterations['alpha:1'].list_id], b=state.lists[state.iterations['beta:1'].list_id];
a.answers=[{relationshipId:'alpha-1',answer:'yes',notes:'Missed approval from three days ago'},{relationshipId:'alpha-2',answer:'yes',notes:'Current approval'},{relationshipId:'alpha-3',answer:'no',notes:'Withdrawn'}];
if(!b.members.includes('alpha-1'))b.members.push('alpha-1');b.answers=[{relationshipId:'alpha-1',answer:'yes',notes:'Also approved here'}];
state.outreach={'alpha-2':{person_id:'alpha-2',status:'To contact',draft:'Human-edited draft: keep exactly',activity:['Human edited yesterday']},'alpha-3':{person_id:'alpha-3',status:'To contact',draft:'Preserve withdrawn draft',activity:['Draft prepared yesterday']}};
state.sender_guidance={sender:'Synthetic reviewer',channel:'email',offer:'Learn how logistics teams evaluate routing tools',approach:'direct'};
await run('drafts-and-withdrawals','Run daily-outreach drafting for all current Yeses, including missed older approvals. No messages have been sent. Preserve human edits and reconcile withdrawn approvals. All message context is synthetic and supplied in sender_guidance. Do not advance opportunities.',()=>{assert.equal(Object.keys(state.outreach).length,3);assert.ok(state.outreach['alpha-1'].draft);assert.equal(state.outreach['alpha-1'].status,'To contact');assert.equal(state.outreach['alpha-2'].draft,'Human-edited draft: keep exactly');assert.equal(state.outreach['alpha-3'].status,'Dropped');assert.equal(state.outreach['alpha-3'].draft,'Preserve withdrawn draft');assert.ok(state.outreach['alpha-3'].activity.includes('Draft prepared yesterday'));assert.equal(state.metrics.contacted??0,0);});
const draft=state.outreach['alpha-1'].draft;
await run('retry-outreach','Retry daily-outreach drafting after an uncertain last response. Existing drafts and activity are authoritative. No new human activity exists.',()=>{assert.equal(Object.keys(state.outreach).length,3);assert.equal(state.outreach['alpha-1'].draft,draft);assert.equal(state.outreach['alpha-2'].draft,'Human-edited draft: keep exactly');});
state.confirmed_activity=[{id:'send-1',person_id:'alpha-1',type:'sent',date:'2026-09-10',sender:'Synthetic reviewer',channel:'email'},{id:'reply-1',person_id:'alpha-1',type:'target_reply',date:'2026-09-11'},{id:'booking-1',person_id:'alpha-1',type:'accepted_invite',date:'2026-09-12'},{id:'proposed-2',person_id:'alpha-2',type:'proposed_time',date:'2026-09-12'}];
await run('confirmed-activity-metrics','Run only activity reconciliation and dashboard refresh. The human explicitly confirmed the events in confirmed_activity. Record dates and activity, preserve drafts, and count only qualifying evidence. The proposed time is not an accepted invitation.',()=>{assert.equal(state.outreach['alpha-1'].status,'Booked');assert.equal(state.outreach['alpha-2'].status,'To contact');assert.equal(state.metrics.contacted,1);assert.equal(state.metrics.replied,1);assert.equal(state.metrics.booked,1);assert.equal(state.metrics.reply_rate,1);assert.equal(state.metrics.conversion,1);assert.equal(state.outreach['alpha-1'].draft,draft);});
if(outreachOnly){console.log(`${results.length} synthetic outreach scenarios passed`);process.exit(0);}
state = {customer:'synthetic-investor',reviewer:'synthetic-reviewer',team:'synthetic-team',goal:'Meet angel investors in climate technology',target:3,profiles:['alpha'],candidates:{alpha:candidates.alpha.slice(0,18)},iterations:{},lists:{},outreach:{},metrics:{}};
await run('shortfall-stays-preparing','Run daily-opportunities preparation for alpha only. This contrasting customer seeks climate angel investor meetings. All 18 ranked candidates are defensible; search is exhausted at 18. Do not broaden scope or pad the batch. Record the useful preparation and the shortfall.',()=>{assert.equal(state.iterations['alpha:1'].status,'Preparing');assert.ok(Object.values(state.lists).every(l=>l.members.length<=18));});
console.log(`${results.length} synthetic scenarios passed`);
