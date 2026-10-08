"use strict";
/* ================= SQL Trainer app ================= */
const LESSONS=[
{ id:1, title:"Your first SELECT", sub:"Pull one column from a table",
  explain:`Every query starts with <code>SELECT</code>. You name the columns you want, then the table they come from with <code>FROM</code>. The <code>lines</code> table holds our three production lines — let's list their names.`,
  task:`List the <b>name</b> of every line in the <b>lines</b> table.`,
  tables:["lines"],
  starter:"-- list the name of every line\nSELECT ",
  expected:"SELECT name FROM lines;",
  orderMatters:false,
  hint:"Shape: SELECT column FROM table. The column is name, the table is lines.",
  solution:"SELECT name FROM lines;" },

{ id:2, title:"Filtering with WHERE", sub:"Find alarms by severity",
  explain:`<code>WHERE</code> keeps only the rows that match a condition. Text values go in single quotes. The <code>alarms</code> table logs every alarm with a severity of <code>Critical</code>, <code>Warning</code>, or <code>Info</code>.`,
  task:`Show <b>id, ts, code, message</b> of every alarm whose severity is <b>'Critical'</b>.`,
  tables:["alarms"],
  starter:"-- critical alarms only\nSELECT ",
  expected:"SELECT id, ts, code, message FROM alarms WHERE severity = 'Critical';",
  orderMatters:false,
  hint:"SELECT id, ts, code, message FROM alarms WHERE severity = 'Critical'; — mind the quotes.",
  solution:"SELECT id, ts, code, message FROM alarms WHERE severity = 'Critical';" },

{ id:3, title:"ORDER BY + LIMIT", sub:"Newest alarms first",
  explain:`<code>ORDER BY ts DESC</code> sorts newest-first, and <code>LIMIT 5</code> keeps just the top 5 rows. On the floor this is how you answer "what just happened?"`,
  task:`Show <b>id, ts, message</b> of the <b>5 most recent</b> alarms, newest first.`,
  tables:["alarms"],
  starter:"-- newest 5 alarms\nSELECT ",
  expected:"SELECT id, ts, message FROM alarms ORDER BY ts DESC LIMIT 5;",
  orderMatters:true,
  hint:"Sort by the ts column descending, then LIMIT 5.",
  solution:"SELECT id, ts, message FROM alarms ORDER BY ts DESC LIMIT 5;" },

{ id:4, title:"GROUP BY aggregates", sub:"Count alarms per line",
  explain:`<code>COUNT(*)</code> counts rows, and <code>GROUP BY</code> splits them into buckets first — here, one bucket per line. <code>AS</code> gives the count a readable name.`,
  task:`Count alarms per line: return <b>line_id</b> and the count as <b>n</b>, one row per line.`,
  tables:["alarms"],
  starter:"-- alarms per line\nSELECT ",
  expected:"SELECT line_id, COUNT(*) AS n FROM alarms GROUP BY line_id;",
  orderMatters:false,
  hint:"SELECT line_id, COUNT(*) AS n FROM alarms GROUP BY line_id;",
  solution:"SELECT line_id, COUNT(*) AS n FROM alarms GROUP BY line_id;" },

{ id:5, title:"JOINs", sub:"Alarms with line names and descriptions",
  explain:`IDs alone don't tell the story. <code>JOIN</code> links tables on a shared key: <code>alarms.line_id = lines.id</code> brings in the line name, and <code>alarms.code = alarm_codes.code</code> brings in the plain-English description. Short aliases (<code>a</code>, <code>l</code>, <code>c</code>) keep it readable.`,
  task:`For <b>Critical</b> alarms, show <b>ts</b>, the <b>line name</b>, and the <b>code description</b>. Join all three tables.`,
  tables:["alarms","lines","alarm_codes"],
  starter:"-- critical alarms, human-readable\nSELECT ",
  expected:"SELECT a.ts, l.name, c.description FROM alarms a JOIN lines l ON a.line_id = l.id JOIN alarm_codes c ON a.code = c.code WHERE a.severity = 'Critical';",
  orderMatters:false,
  hint:"FROM alarms a JOIN lines l ON a.line_id = l.id JOIN alarm_codes c ON a.code = c.code, then WHERE a.severity = 'Critical'.",
  solution:"SELECT a.ts, l.name, c.description FROM alarms a JOIN lines l ON a.line_id = l.id JOIN alarm_codes c ON a.code = c.code WHERE a.severity = 'Critical';" },

{ id:6, title:"Date and time queries", sub:"Top alarm codes this week",
  explain:`Timestamps are text like <code>2026-10-07 14:32:10</code>, and SQLite's <code>date('now','-7 days')</code> means "7 days ago". Combine that with <code>GROUP BY</code> + <code>ORDER BY n DESC</code> + <code>LIMIT</code> to find the most frequent offenders.`,
  task:`On <b>Line 2</b> in the <b>last 7 days</b>: show each <b>code</b> and its count as <b>n</b>, most frequent first, <b>top 3 only</b>.`,
  tables:["alarms"],
  starter:"-- top 3 codes, Line 2, last 7 days\nSELECT ",
  expected:"SELECT code, COUNT(*) AS n FROM alarms WHERE line_id = 2 AND ts >= date('now','-7 days') GROUP BY code ORDER BY n DESC LIMIT 3;",
  orderMatters:true,
  hint:"WHERE line_id = 2 AND ts >= date('now','-7 days'), then GROUP BY code, ORDER BY n DESC, LIMIT 3.",
  solution:"SELECT code, COUNT(*) AS n FROM alarms WHERE line_id = 2 AND ts >= date('now','-7 days') GROUP BY code ORDER BY n DESC LIMIT 3;" },

{ id:7, title:"Capstone: downtime detective", sub:"Which line-shift lost the most time?",
  explain:`Putting it all together: <code>SUM(downtime_min)</code> totals the minutes, <code>GROUP BY</code> splits by line and shift, the <code>JOIN</code> turns IDs into names, and <code>ORDER BY ... DESC LIMIT 1</code> surfaces the worst offender. This is the exact shape of a real downtime report.`,
  task:`Find the single <b>line + shift</b> combination with the <b>highest total downtime</b>: return the <b>line name</b>, <b>shift</b>, and total as <b>total_downtime</b>.`,
  tables:["production_runs","lines"],
  starter:"-- worst line-shift for downtime\nSELECT ",
  expected:"SELECT l.name, p.shift, SUM(p.downtime_min) AS total_downtime FROM production_runs p JOIN lines l ON p.line_id = l.id GROUP BY l.name, p.shift ORDER BY total_downtime DESC LIMIT 1;",
  orderMatters:true,
  hint:"SUM(p.downtime_min) grouped by l.name and p.shift, joined to lines, ordered by the total descending, LIMIT 1.",
  solution:"SELECT l.name, p.shift, SUM(p.downtime_min) AS total_downtime FROM production_runs p JOIN lines l ON p.line_id = l.id GROUP BY l.name, p.shift ORDER BY total_downtime DESC LIMIT 1;" }
];

const SCHEMAS={
  lines:[["id","INTEGER"],["name","TEXT"]],
  alarm_codes:[["code","TEXT"],["description","TEXT"]],
  alarms:[["id","INTEGER"],["ts","TEXT"],["line_id","INTEGER"],["code","TEXT"],["severity","TEXT"],["message","TEXT"]],
  production_runs:[["id","INTEGER"],["line_id","INTEGER"],["shift","TEXT"],["run_date","TEXT"],["units","INTEGER"],["downtime_min","INTEGER"]]
};

/* ---------- state ---------- */
let db=null, SQL=null;
const store={
  load(){ try{return JSON.parse(localStorage.getItem("sqltrainer_progress_v1")||'{"done":[]}');}catch(e){return {done:[]};} },
  save(s){ try{localStorage.setItem("sqltrainer_progress_v1",JSON.stringify(s));}catch(e){} }
};
let progress=store.load();

/* ---------- helpers ---------- */
const $=id=>document.getElementById(id);
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function normCell(v){return v===null||v===undefined?"NULL":String(v);}
function runQuery(sql){
  const trimmed=sql.replace(/--[^\n]*\n?/g,"").trim();
  if(!/^(SELECT|WITH)\b/i.test(trimmed)) throw new Error("Only SELECT queries are allowed here.");
  const res=db.exec(trimmed);
  if(!res.length) return {columns:[],rows:[]};
  return {columns:res[0].columns, rows:res[0].values.map(r=>r.map(normCell))};
}
function renderTable(res){
  if(!res.columns.length) return '<div class="empty">Query ran — no rows returned.</div>';
  let h='<table><thead><tr>'+res.columns.map(c=>'<th>'+esc(c)+'</th>').join('')+'</tr></thead><tbody>';
  res.rows.forEach(r=>{h+='<tr>'+r.map(c=>'<td>'+esc(c)+'</td>').join('')+'</tr>';});
  return h+'</tbody></table>';
}
function rowsEqual(a,b,orderMatters){
  if(a.columns.length!==b.columns.length) return false;
  const key=r=>JSON.stringify(r);
  let ra=a.rows.map(key), rb=b.rows.map(key);
  if(!orderMatters){ra=ra.slice().sort(); rb=rb.slice().sort();}
  return JSON.stringify(ra)===JSON.stringify(rb);
}
function schemaHTML(names){
  return names.map(t=>{
    const rows=SCHEMAS[t].map(c=>'<tr><td>'+esc(c[0])+'</td><td>'+esc(c[1])+'</td></tr>').join('');
    return '<b>'+esc(t)+'</b><table><tr><th>column</th><th>type</th></tr>'+rows+'</table>';
  }).join('<div style="height:8px"></div>');
}
function markDone(id){
  if(!progress.done.includes(id)){progress.done.push(id); store.save(progress);}
}

/* ---------- views ---------- */
function show(name){
  ["lessons","lesson","playground"].forEach(v=>{$("view-"+v).style.display=v===name?"block":"none";});
  $("tab-lessons").classList.toggle("active",name==="lessons"||name==="lesson");
  $("tab-playground").classList.toggle("active",name==="playground");
  window.scrollTo(0,0);
}
function renderLessonList(){
  const el=$("view-lessons");
  const done=progress.done.length;
  let h='<div class="card"><h3 style="margin:0 0 6px">Lessons</h3><div class="explain">'+done+' of '+LESSONS.length+' complete. Work top to bottom — each one builds on the last.</div></div>';
  LESSONS.forEach(L=>{
    const d=progress.done.includes(L.id);
    h+='<button class="lesson-card'+(d?' done':'')+'" data-id="'+L.id+'"><span class="lesson-num">'+(d?'✓':L.id)+
       '</span><span class="t"><b>'+esc(L.title)+'</b><span>'+esc(L.sub)+'</span></span>'+(d?'<span class="badge">done</span>':'')+'</button>';
  });
  el.innerHTML=h;
  el.querySelectorAll(".lesson-card").forEach(b=>b.addEventListener("click",()=>openLesson(+b.dataset.id)));
}
function openLesson(id){
  const L=LESSONS.find(l=>l.id===id);
  const el=$("view-lesson");
  el.innerHTML=
   '<button class="back" id="bk">← All lessons</button>'+
   '<div class="card"><h3 style="margin:0 0 4px">Lesson '+L.id+': '+esc(L.title)+'</h3>'+
   '<div class="explain">'+L.explain+'</div>'+
   '<div class="task"><b>Your task:</b> '+L.task+'</div>'+
   '<details class="schema"><summary>Tables for this lesson</summary>'+schemaHTML(L.tables)+'</details>'+
   '<textarea id="ed" class="editor" spellcheck="false">'+esc(L.starter)+'</textarea>'+
   '<div class="btnrow"><button class="btn btn-run" id="run">Run</button><button class="btn btn-check" id="check">Check answer</button></div>'+
   '<div class="btnrow"><button class="btn btn-ghost" id="hint">Hint</button><button class="btn btn-ghost" id="sol">Show solution</button></div>'+
   '<div class="hint" id="hintbox">'+esc(L.hint)+'</div>'+
   '<pre class="solution" id="solbox">'+esc(L.solution)+'</pre>'+
   '<div class="msg" id="msg"></div>'+
   '<div class="result" id="res"></div></div>';
  $("bk").addEventListener("click",()=>{renderLessonList();show("lessons");});
  $("hint").addEventListener("click",()=>$("hintbox").classList.toggle("show"));
  $("sol").addEventListener("click",()=>$("solbox").classList.toggle("show"));
  $("run").addEventListener("click",()=>{
    const msg=$("msg"),res=$("res"); msg.className="msg"; res.className="result";
    try{ const r=runQuery($("ed").value); res.innerHTML=renderTable(r); res.classList.add("show");
      msg.textContent="Ran OK — "+r.rows.length+" row(s)."; msg.classList.add("show","info");
    }catch(e){ msg.textContent="Error: "+e.message; msg.classList.add("show","err"); }
  });
  $("check").addEventListener("click",()=>{
    const msg=$("msg"),res=$("res"); msg.className="msg"; res.className="result";
    try{
      const user=runQuery($("ed").value), exp=runQuery(L.expected);
      res.innerHTML=renderTable(user); res.classList.add("show");
      if(rowsEqual(user,exp,L.orderMatters)){
        msg.textContent="✓ Correct — nicely done."; msg.classList.add("show","ok"); markDone(L.id);
      }else{
        msg.textContent="Not quite — your query ran, but the result doesn't match yet. Compare with the task and try again.";
        msg.classList.add("show","err");
      }
    }catch(e){ msg.textContent="Error: "+e.message; msg.classList.add("show","err"); }
  });
  show("lesson");
}

/* ---------- boot ---------- */
async function boot(){
  $("tab-lessons").addEventListener("click",()=>{renderLessonList();show("lessons");});
  $("tab-playground").addEventListener("click",()=>show("playground"));
  $("pg-run").addEventListener("click",()=>{
    const msg=$("pg-msg"),res=$("pg-result"); msg.className="msg"; res.className="result";
    try{ const r=runQuery($("pg-editor").value||"SELECT * FROM alarms LIMIT 10;");
      res.innerHTML=renderTable(r); res.classList.add("show");
      msg.textContent="Ran OK — "+r.rows.length+" row(s)."; msg.classList.add("show","info");
    }catch(e){ msg.textContent="Error: "+e.message; msg.classList.add("show","err"); }
  });
  $("pg-clear").addEventListener("click",()=>{$("pg-editor").value="";$("pg-result").className="result";$("pg-msg").className="msg";});
  $("pg-schema").innerHTML=schemaHTML(Object.keys(SCHEMAS));
  try{
    SQL=await initSqlJs({locateFile:f=>f});
    db=new SQL.Database();
    seedStatements().forEach(s=>db.exec(s));
  }catch(e){
    $("view-lessons").innerHTML='<div class="card"><div class="msg show err">Could not start the database engine: '+esc(e.message)+'</div></div>';
    return;
  }
  renderLessonList(); show("lessons");
}
document.addEventListener("DOMContentLoaded",boot);
