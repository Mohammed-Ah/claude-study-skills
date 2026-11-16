/* Lecture Flashcards — app engine.
 * Expects two globals defined before this script:
 *   TOPICS : string[]                       (8–10 topic groups)
 *   CARDS  : Card[]
 *   STATUS_LABELS (optional) : {untried, current, correct, missed}
 * Card = {
 *   type  : "mcq" | "fill" | "short",
 *   calc  : boolean,          // requires working something out
 *   src   : string,           // e.g. "T3 · Slide 26"
 *   topic : number,           // index into TOPICS
 *   q     : string,
 *   code? : string,           // monospace block (formula / given data / code)
 *   opts? : string[4],        // mcq only
 *   ans?  : number | string,  // mcq: option index; fill: canonical answer
 *   accept?: string[],        // fill: extra accepted variants
 *   model?: string,           // short: model answer (newlines kept)
 *   exp   : string            // explanation
 * }
 */
const LABELS = Object.assign(
  {untried:"Not tried", current:"Current", correct:"Correct", missed:"Missed"},
  typeof STATUS_LABELS === "object" ? STATUS_LABELS : {}
);
const TYPE_NAME = {mcq:"MCQ", fill:"Fill-in", short:"Short answer"};
const L = ["A","B","C","D","E","F"];
const state = CARDS.map(() => ({status:"untried", chosen:null, text:"", revealed:false}));
let order = CARDS.map((_, i) => i), view = [], pos = 0;
let typeF = "all", topicF = "all", reviewMode = false;

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]));

/* ---------- fill-in answer matching ---------- */
function norm(s){
  return String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g,"")
    .replace(/[×x]\s*10\^?/g,"e").replace(/[“”"'`]/g,"")
    .replace(/[^a-z0-9.\/\-+e%]+/g," ").replace(/\s+/g," ").trim()
    .replace(/(\w)s\b/g,"$1");             // crude plural fold
}
function num(s){
  const t = String(s).replace(/,/g,"").trim().replace(/\s*%$/,"");
  const f = t.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
  if (f) return +f[1] / +f[2];
  const n = t.match(/^-?\d*\.?\d+(?:e[-+]?\d+)?$/i);
  return n ? parseFloat(t) : null;
}
function matches(input, card){
  const cands = [card.ans, ...(card.accept || [])];
  const a = norm(input), an = num(input);
  return cands.some(c => {
    if (norm(c) === a) return true;
    const cn = num(c);
    return an !== null && cn !== null && Math.abs(an - cn) <= Math.max(1e-9, Math.abs(cn) * 0.005);
  });
}

/* ---------- deck building ---------- */
function rebuild(keepIdx){
  view = order.filter(i => {
    const c = CARDS[i];
    if (typeF === "calc" && !c.calc) return false;
    if (["mcq","fill","short"].includes(typeF) && c.type !== typeF) return false;
    if (topicF !== "all" && c.topic !== +topicF) return false;
    if (reviewMode && state[i].status !== "missed") return false;
    return true;
  });
  if (keepIdx != null){ const p = view.indexOf(keepIdx); pos = p >= 0 ? p : 0; }
  if (pos >= view.length) pos = Math.max(0, view.length - 1);
  render();
}
const isOpen = i => {
  const s = state[i], t = CARDS[i].type;
  return t === "short" ? !(s.revealed && s.status !== "untried" && s.graded) : s.chosen === null;
};
function chipFor(i){
  if (view[pos] === i && isOpen(i)) return {cls:"current", label:LABELS.current};
  const st = state[i].status;
  return {cls:st, label:LABELS[st]};
}

/* ---------- rendering ---------- */
function render(){
  const area = $("#card");
  if (!view.length){
    area.innerHTML = `<div class="empty">${reviewMode ? "No missed cards here — nothing to review." : "No cards match these filters."}</div>`;
    $("#counter").textContent = "0 / 0";
  } else {
    const i = view[pos], c = CARDS[i], s = state[i], chip = chipFor(i);
    let body = "";
    if (c.type === "mcq") body = renderMcq(c, s);
    else if (c.type === "fill") body = renderFill(c, s);
    else body = renderShort(c, s);
    area.innerHTML = `
      <div class="card-head">
        <span class="mono">#${i + 1}</span>
        <span class="mono src">${esc(c.src)}</span>
        <span class="topic">${esc(TOPICS[c.topic])}</span>
        <span class="type mono">${TYPE_NAME[c.type]}${c.calc ? " · Calc" : ""}</span>
        <span class="chip ${chip.cls}">${esc(chip.label)}</span>
      </div>
      <p class="q">${esc(c.q)}</p>
      ${c.code ? `<pre class="code"><code>${esc(c.code)}</code></pre>` : ""}
      ${body}`;
    wire(c, i);
    $("#counter").textContent = `${pos + 1} / ${view.length}`;
  }
  $("#prev").disabled = pos <= 0;
  $("#next").disabled = pos >= view.length - 1;
  $("#review").setAttribute("aria-pressed", reviewMode);
  $("#review").textContent = reviewMode ? "Exit review" : "Review missed";
  renderStats(); renderMap(); renderWeak();
}
function renderMcq(c, s){
  const done = s.chosen !== null;
  const opts = c.opts.map((o, k) => {
    let cls = "opt";
    if (done) cls += k === c.ans ? " right" : k === s.chosen ? " wrong" : " dim";
    return `<button class="${cls}" data-k="${k}" ${done ? "disabled" : ""}><span class="key">${L[k]}</span><span>${esc(o)}</span></button>`;
  }).join("");
  const exp = done ? `<div class="exp ${s.chosen === c.ans ? "ok" : "bad"}"><strong>${s.chosen === c.ans ? "Correct." : "Not quite — answer " + L[c.ans] + "."}</strong> ${esc(c.exp)}</div>` : "";
  return `<div class="opts" role="group" aria-label="Answer options">${opts}</div>${exp}`;
}
function renderFill(c, s){
  const done = s.chosen !== null;
  const ok = s.status === "correct";
  return `<div class="fill">
      <label class="sr" for="fillIn">Your answer</label>
      <input id="fillIn" type="text" autocomplete="off" value="${esc(s.text)}" ${done ? "disabled" : ""} placeholder="Type your answer">
      <button class="btn primary" id="check" ${done ? "disabled" : ""}>Check</button>
    </div>
    ${done ? `<div class="exp ${ok ? "ok" : "bad"}"><strong>${ok ? "Correct." : "Not quite."}</strong>${ok ? "" : ` Accepted answer: <span class="mono">${esc(c.ans)}</span>.`} ${esc(c.exp)}</div>` : ""}`;
}
function renderShort(c, s){
  const graded = s.graded;
  return `<label class="sr" for="shortIn">Your answer</label>
    <textarea id="shortIn" rows="5" placeholder="Write your answer first…" ${s.revealed ? "readonly" : ""}>${esc(s.text)}</textarea>
    ${!s.revealed ? `<button class="btn primary" id="reveal">Show model answer</button>` : `
      <div class="model"><strong>Model answer</strong><div class="model-body">${esc(c.model || "").replace(/\n/g, "<br>")}</div>${c.exp ? `<p class="muted">${esc(c.exp)}</p>` : ""}</div>
      ${graded ? `<div class="exp ${s.status === "correct" ? "ok" : "bad"}"><strong>${s.status === "correct" ? "Marked: I had it." : "Marked: I missed points."}</strong></div>` :
        `<div class="selfgrade"><button class="btn ok" id="had">I had it</button><button class="btn bad" id="missedPts">I missed points</button></div>`}`}`;
}
function wire(c, i){
  if (c.type === "mcq") document.querySelectorAll(".opt").forEach(b => b.addEventListener("click", () => answerMcq(+b.dataset.k)));
  if (c.type === "fill"){
    const inp = $("#fillIn");
    if (inp && !inp.disabled){
      inp.addEventListener("input", e => state[i].text = e.target.value);
      inp.addEventListener("keydown", e => { if (e.key === "Enter"){ e.preventDefault(); checkFill(); } });
      $("#check").addEventListener("click", checkFill);
    }
  }
  if (c.type === "short"){
    const ta = $("#shortIn");
    if (ta) ta.addEventListener("input", e => state[i].text = e.target.value);
    const r = $("#reveal"); if (r) r.addEventListener("click", () => { state[i].revealed = true; render(); });
    const h = $("#had"); if (h) h.addEventListener("click", () => grade(true));
    const m = $("#missedPts"); if (m) m.addEventListener("click", () => grade(false));
  }
}
function answerMcq(k){
  const i = view[pos], c = CARDS[i], s = state[i];
  if (!view.length || c.type !== "mcq" || s.chosen !== null || k >= c.opts.length) return;
  s.chosen = k; s.status = k === c.ans ? "correct" : "missed"; render();
}
function checkFill(){
  const i = view[pos], s = state[i];
  const v = ($("#fillIn") || {}).value || "";
  if (!v.trim()) return;
  s.text = v; s.chosen = v; s.status = matches(v, CARDS[i]) ? "correct" : "missed"; render();
}
function grade(had){
  const i = view[pos], s = state[i];
  s.graded = true; s.status = had ? "correct" : "missed"; render();
}

/* ---------- stats, map, weak topics ---------- */
function renderStats(){
  const per = {mcq:0, fill:0, short:0}; let calc = 0;
  CARDS.forEach(c => { per[c.type]++; if (c.calc) calc++; });
  const cor = state.filter(s => s.status === "correct").length;
  const mis = state.filter(s => s.status === "missed").length, tried = cor + mis;
  const parts = Object.entries(per).filter(([, n]) => n).map(([t, n]) => `<span>${n} ${TYPE_NAME[t]}</span>`);
  if (calc) parts.push(`<span>${calc} calculation</span>`);
  $("#stats").innerHTML = `<span><b>${CARDS.length}</b> cards</span>${parts.join("")}<span class="c-ok">✓ ${cor}</span><span class="c-bad">✗ ${mis}</span><span>score <b>${tried ? Math.round(100 * cor / tried) : 0}%</b> of ${tried} tried</span>`;
}
function renderMap(){
  const m = $("#map");
  m.innerHTML = CARDS.map((c, i) => `<button class="cell ${state[i].status} ${view[pos] === i ? "cur" : ""} ${view.includes(i) ? "" : "out"}" data-i="${i}" title="Card ${i + 1} · ${esc(TOPICS[c.topic])} · ${esc(LABELS[state[i].status])}" aria-label="Go to card ${i + 1}">${i + 1}</button>`).join("");
  m.querySelectorAll(".cell").forEach(b => b.addEventListener("click", () => {
    const i = +b.dataset.i;
    if (!view.includes(i)){ typeF = "all"; topicF = "all"; reviewMode = false; $("#typeF").value = "all"; $("#topicF").value = "all"; }
    rebuild(i);
  }));
}
function renderWeak(){
  const rows = TOPICS.map((t, ti) => {
    const ids = CARDS.map((c, i) => c.topic === ti ? i : -1).filter(i => i >= 0);
    const cor = ids.filter(i => state[i].status === "correct").length;
    const mis = ids.filter(i => state[i].status === "missed").length, tried = cor + mis;
    return {t, ti, n:ids.length, cor, mis, tried, weak: tried >= 2 && cor / tried < 0.7};
  });
  const flagged = rows.filter(r => r.weak);
  $("#weakFlag").innerHTML = flagged.length
    ? `<strong>Weak spots:</strong> ${flagged.map(r => `<button class="linkish" data-t="${r.ti}">${esc(r.t)}</button>`).join(", ")}`
    : `<span class="muted">No weak topics flagged yet (a topic is flagged after 2+ tries below 70%).</span>`;
  $("#weakRows").innerHTML = rows.map(r => `<div class="wrow ${r.weak ? "weak" : ""}">
      <button class="wname linkish" data-t="${r.ti}">${r.weak ? "⚑ " : ""}${esc(r.t)}</button>
      <div class="bar" aria-hidden="true"><span class="b-ok" style="width:${r.n ? 100 * r.cor / r.n : 0}%"></span><span class="b-bad" style="width:${r.n ? 100 * r.mis / r.n : 0}%"></span></div>
      <span class="mono wcount">${r.cor}/${r.tried} · ${r.n}</span></div>`).join("");
  document.querySelectorAll("[data-t]").forEach(b => b.addEventListener("click", () => {
    topicF = b.dataset.t; $("#topicF").value = topicF; reviewMode = false; pos = 0; rebuild();
  }));
}

/* ---------- controls ---------- */
function init(){
  const present = [...new Set(CARDS.map(c => c.type))];
  $("#typeF").innerHTML = `<option value="all">All</option>` +
    present.map(t => `<option value="${t}">${TYPE_NAME[t]}</option>`).join("") +
    (CARDS.some(c => c.calc) ? `<option value="calc">Calculation</option>` : "");
  $("#topicF").innerHTML = `<option value="all">All topics</option>` + TOPICS.map((t, i) => `<option value="${i}">${esc(t)}</option>`).join("");
  const plain = LABELS.untried === "Not tried" && LABELS.current === "Current" && LABELS.correct === "Correct" && LABELS.missed === "Missed";
  $("#legend").textContent = plain ? "" : `Status: ${LABELS.untried} = not tried · ${LABELS.current} = current · ${LABELS.correct} = correct · ${LABELS.missed} = missed`;
  $("#typeF").addEventListener("change", e => { typeF = e.target.value; pos = 0; rebuild(); });
  $("#topicF").addEventListener("change", e => { topicF = e.target.value; pos = 0; rebuild(); });
  $("#prev").addEventListener("click", () => { if (pos > 0){ pos--; render(); } });
  $("#next").addEventListener("click", () => { if (pos < view.length - 1){ pos++; render(); } });
  $("#shuffle").addEventListener("click", () => {
    for (let i = order.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    pos = 0; rebuild();
  });
  $("#review").addEventListener("click", () => {
    reviewMode = !reviewMode;
    if (reviewMode) state.forEach(s => { if (s.status === "missed"){ s.chosen = null; s.text = ""; s.revealed = false; s.graded = false; } });
    pos = 0; rebuild();
  });
  $("#reset").addEventListener("click", () => {
    state.forEach(s => Object.assign(s, {status:"untried", chosen:null, text:"", revealed:false, graded:false}));
    order = CARDS.map((_, i) => i); typeF = "all"; topicF = "all"; reviewMode = false;
    $("#typeF").value = "all"; $("#topicF").value = "all"; pos = 0; rebuild();
  });
  $("#theme").addEventListener("click", () => {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
  });
  document.addEventListener("keydown", e => {
    if (e.target.matches("select, input, textarea") || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (k === "ArrowLeft"){ if (pos > 0){ pos--; render(); } e.preventDefault(); }
    else if (k === "ArrowRight"){ if (pos < view.length - 1){ pos++; render(); } e.preventDefault(); }
    else if (/^[a-dA-D]$/.test(k) && view.length && CARDS[view[pos]].type === "mcq") answerMcq(L.indexOf(k.toUpperCase()));
  });
  rebuild();
}
init();
