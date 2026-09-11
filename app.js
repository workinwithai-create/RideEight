const CDN = "https://cdn.jsdelivr.net/gh/workinwithai-create/PreEight@main/public/samples";
const STEPS = 16;
const POCKET = 8;
const RIDE = 8;
const recipes = [
  { id:"ride-wash", name:"Ride wash", blurb:"Hats become ride. Density stays, volume falls two clicks a bar." },
  { id:"bass-descend", name:"Bass descend", blurb:"Upright walks down a fifth across the eight, lands soft on the tonic." },
  { id:"nylon-thin", name:"Nylon thin", blurb:"One nylon figure every other bar, then space. No new hook." },
  { id:"keys-hold", name:"Keys hold", blurb:"Piano holds the third. No right-hand runs after bar 12." },
  { id:"brass-exit", name:"Brass exit", blurb:"Trumpet answers once on bar 11, then leaves." },
  { id:"kit-unlearn", name:"Kit unlearn", blurb:"Snare every other bar after 12. Kick stays on one." },
  { id:"string-veil", name:"String veil", blurb:"Violin pad on the fifth, no melody." },
  { id:"air-bars", name:"Air bars", blurb:"Bars 15-16 drop kit. Bass and keys only." },
  { id:"half-ride", name:"Half ride", blurb:"Feel halves after bar 12 without changing tempo." },
  { id:"room-leave", name:"Room leave", blurb:"Everything quieter, ride stays, no crash, no button." }
];
function bar(symbol, piano, guitar, bass){ return { symbol, piano, guitar, bass }; }
const grooves = [
  { id:"harbor", name:"Harbor Dusk", bpm:92, key:"G minor",
    pocket:[bar("Gm",[43,46,50,55],[43,50,55],31),bar("Eb",[39,43,46,51],[39,46,51],39),bar("Bb",[34,38,41,46],[34,41,46],34),bar("F",[41,45,48,53],[41,48,53],29),bar("Gm",[43,46,50,55],[43,50,55],31),bar("Eb",[39,43,46,51],[39,46,51],39),bar("Bb",[34,38,41,46],[34,41,46],34),bar("F",[41,45,48,53],[41,48,53],29)],
    ride:[bar("Gm",[43,46,50,55],[43,50,55],31),bar("Eb",[39,43,46,51],[39,46,51],39),bar("Cm",[36,39,43,48],[36,43,48],36),bar("D",[38,42,45,50],[38,45,50],26),bar("Gm",[43,46,50,55],[43,50,55],31),bar("Eb",[39,43,46,51],[39,46,51],39),bar("Bb",[34,38,41,46],[34,41,46],34),bar("Gm",[43,46,50,55],[43,50,55],31)] },
  { id:"lantern", name:"Lantern Major", bpm:88, key:"A major",
    pocket:[bar("A",[33,37,40,45],[33,40,45],33),bar("E",[40,44,47,52],[40,47,52],28),bar("F#m",[42,45,49,54],[42,49,54],30),bar("D",[38,42,45,50],[38,45,50],26),bar("A",[33,37,40,45],[33,40,45],33),bar("E",[40,44,47,52],[40,47,52],28),bar("F#m",[42,45,49,54],[42,49,54],30),bar("D",[38,42,45,50],[38,45,50],26)],
    ride:[bar("A",[33,37,40,45],[33,40,45],33),bar("D",[38,42,45,50],[38,45,50],26),bar("A",[33,37,40,45],[33,40,45],33),bar("E",[40,44,47,52],[40,47,52],28),bar("F#m",[42,45,49,54],[42,49,54],30),bar("D",[38,42,45,50],[38,45,50],26),bar("E",[40,44,47,52],[40,47,52],28),bar("A",[33,37,40,45],[33,40,45],33)] },
  { id:"wire", name:"Wire Night", bpm:100, key:"C minor",
    pocket:[bar("Cm",[36,39,43,48],[36,43,48],24),bar("Ab",[32,36,39,44],[32,39,44],32),bar("Eb",[39,43,46,51],[39,46,51],27),bar("Bb",[34,38,41,46],[34,41,46],22),bar("Cm",[36,39,43,48],[36,43,48],24),bar("Ab",[32,36,39,44],[32,39,44],32),bar("Eb",[39,43,46,51],[39,46,51],27),bar("Bb",[34,38,41,46],[34,41,46],22)],
    ride:[bar("Cm",[36,39,43,48],[36,43,48],24),bar("Ab",[32,36,39,44],[32,39,44],32),bar("Fm",[41,44,48,53],[41,48,53],29),bar("G",[43,47,50,55],[43,47,50],31),bar("Cm",[36,39,43,48],[36,43,48],24),bar("Ab",[32,36,39,44],[32,39,44],32),bar("Bb",[34,38,41,46],[34,41,46],22),bar("Cm",[36,39,43,48],[36,43,48],24)] }
];
const state = { groove: grooves[0], recipe: recipes[0], playing:false, bar:0, mode:null };
let ctx, bus, buffers = {};
async function load() {
  ctx = new AudioContext();
  bus = ctx.createGain(); bus.gain.value = 0.35; bus.connect(ctx.destination);
  const files = [
    ["kick",`${CDN}/drums/kick.mp3`],["snare",`${CDN}/drums/snare.mp3`],["hat",`${CDN}/drums/hihat.mp3`],["crash",`${CDN}/drums/crash.mp3`],
    ["pC3",`${CDN}/piano/C3.mp3`],["pC4",`${CDN}/piano/C4.mp3`],["pA3",`${CDN}/piano/A3.mp3`],
    ["bE1",`${CDN}/bass/E1.mp3`],["bA1",`${CDN}/bass/A1.mp3`],["bC2",`${CDN}/bass/C2.mp3`],
    ["gE2",`${CDN}/guitar/E2.mp3`],["gA2",`${CDN}/guitar/A2.mp3`],["gE3",`${CDN}/guitar/E3.mp3`],
    ["tC4",`${CDN}/trumpet/C4.mp3`],["vA3",`${CDN}/violin/A3.mp3`]
  ];
  let n=0;
  for (const [k,url] of files) {
    try { const r = await fetch(url); buffers[k] = await ctx.decodeAudioData(await r.arrayBuffer()); } catch (e) { console.warn(k, e); }
    n++; document.getElementById("status").textContent = `Seating chairs ${n}/${files.length}`;
  }
  document.getElementById("status").textContent = "Chairs seated · live FluidR3 + kit";
}
function playBuf(name, when, rate=1, gain=0.4) {
  const b = buffers[name]; if (!b || !ctx) return;
  const src = ctx.createBufferSource(); src.buffer = b; src.playbackRate.value = rate;
  const g = ctx.createGain(); g.gain.value = gain; src.connect(g); g.connect(bus); src.start(when);
}
function rateFromMidi(midi, baseMidi){ return Math.pow(2, (midi-baseMidi)/12); }
function chordAt(i){ return i < POCKET ? state.groove.pocket[i] : state.groove.ride[i-POCKET]; }
function scheduleBar(barIndex, t0, stepDur){
  const ch = chordAt(barIndex); const onRide = barIndex >= POCKET; const rec = state.recipe.id;
  const rideBar = barIndex - POCKET;
  const fade = onRide ? Math.max(0.25, 1 - rideBar * 0.09) : 1;
  for (let s=0;s<STEPS;s++){
    const when = t0 + s*stepDur;
    const hushAir = rec==="air-bars" && rideBar >= 6;
    const half = rec==="half-ride" && rideBar >= 4;
    if (s%2===0 && !hushAir) playBuf("hat", when, 1, (onRide ? 0.05 : 0.07) * fade);
    if (s===0 && !hushAir) playBuf("kick", when, 1, 0.62 * fade);
    const snareOk = !(onRide && rec==="kit-unlearn" && rideBar>=4 && barIndex%2===1);
    if (s===8 && !hushAir && !half && snareOk) playBuf("snare", when, 1, 0.4 * fade);
    if (half && s===0 && rideBar%2===0 && !hushAir) playBuf("snare", when, 1, 0.28 * fade);
    if (s===0) {
      const keyGain = (rec==="keys-hold" && onRide && rideBar>=4) ? 0.14 : 0.26;
      playBuf("pC4", when, rateFromMidi(ch.piano[2]||60, 60), keyGain * fade);
      playBuf("pA3", when, rateFromMidi(ch.piano[1]||57, 57), 0.18 * fade);
      let bassMidi = ch.bass;
      if (rec==="bass-descend" && onRide) bassMidi = Math.max(ch.bass - rideBar, ch.bass - 7);
      playBuf("bA1", when, rateFromMidi(bassMidi, 33), 0.48 * fade);
      const gGain = (rec==="nylon-thin" && onRide && rideBar%2===1) ? 0.05 : 0.2;
      playBuf("gA2", when, rateFromMidi(ch.guitar[0]||45, 45), gGain * fade);
    }
    if (onRide && rec==="nylon-thin" && rideBar%2===0 && s===8) playBuf("gE3", when, rateFromMidi(ch.guitar[1]||52, 52), 0.22 * fade);
    if (onRide && rec==="brass-exit" && rideBar===2 && s===0) playBuf("tC4", when, rateFromMidi(ch.piano[3]||69,60), 0.3);
    if (onRide && rec==="string-veil" && s===0) playBuf("vA3", when, rateFromMidi(ch.piano[2]||60,57), 0.16 * fade);
  }
}
let timer=null;
function stop(){ state.playing=false; state.mode=null; if(timer) clearTimeout(timer); timer=null; paintBars(); }
async function play(mode){
  if (!ctx) await load();
  if (ctx.state==="suspended") await ctx.resume();
  stop(); state.playing=true; state.mode=mode;
  const startBar = mode==="eight" ? POCKET : 0;
  const endBar = mode==="loop" ? POCKET : POCKET+RIDE;
  const stepDur = 60/state.groove.bpm/4;
  let barIndex = startBar;
  const tick = () => {
    if (!state.playing) return;
    if (barIndex >= endBar) { if (mode==="loop") barIndex = startBar; else { stop(); return; } }
    state.bar = barIndex; paintBars();
    scheduleBar(barIndex, ctx.currentTime+0.02, stepDur);
    barIndex += 1;
    timer = setTimeout(tick, STEPS*stepDur*1000);
  };
  tick();
}
function punch(){
  const g=state.groove, r=state.recipe;
  return `RideEight punch list\n${g.name} · ${g.bpm} BPM · ${g.key} · ${r.name}\n\nThe problem: the last hook reprints or the file slams a button. Session players ride eight live bars so the room empties without a new hook.\nThe move: ${r.blurb}\n\nPocket (bars 1-8)\n${g.pocket.map((b,i)=>`  ${i+1}. ${b.symbol}`).join("\n")}\n\nRide (bars 9-16) — ${r.name}\n${g.ride.map((b,i)=>`  ${i+9}. ${b.symbol}`).join("\n")}\n\nLive chairs only (FluidR3 + kit via PreEight CDN). Distinct from ButtonFour, FillFour, EndEight, LastHook, TagFour.\nDrop the WAV on bars 9-16. Do not crash-land. Do not loop the ride.`;
}
function paintGrooves(){
  const el=document.getElementById("grooves"); el.innerHTML="";
  grooves.forEach(g=>{ const b=document.createElement("button"); b.className="card"+(state.groove.id===g.id?" on":""); b.innerHTML=`<b>${g.name}</b><span>${g.bpm} BPM · ${g.key}</span>`; b.onclick=()=>{ state.groove=g; render(); }; el.appendChild(b); });
}
function paintRecipes(){
  const el=document.getElementById("recipes"); el.innerHTML="";
  recipes.forEach(r=>{ const b=document.createElement("button"); b.className="card"+(state.recipe.id===r.id?" on":""); b.innerHTML=`<b>${r.name}</b><span>${r.blurb}</span>`; b.onclick=()=>{ state.recipe=r; render(); }; el.appendChild(b); });
}
function paintBars(){
  const el=document.getElementById("bars"); el.innerHTML="";
  for(let i=0;i<16;i++){ const ch=chordAt(i); const d=document.createElement("div"); d.className="bar"+(i>=8?" ride":"")+(state.playing && state.bar===i?" active":""); d.innerHTML=`<div class="n">${i+1} · ${i>=8?"R":"P"}</div><div class="c">${ch.symbol}</div>`; el.appendChild(d); }
}
function render(){ paintGrooves(); paintRecipes(); paintBars(); document.getElementById("punch").textContent = punch(); }
document.getElementById("playA").onclick=()=>play("loop");
document.getElementById("playB").onclick=()=>play("cut");
document.getElementById("play8").onclick=()=>play("eight");
document.getElementById("stop").onclick=stop;
document.getElementById("copy").onclick=()=>navigator.clipboard.writeText(punch());
render();
load();
