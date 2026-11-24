/* Mimo · tabla del resumen semanal.
   La usan Mimo y la página de la terapeuta, así las dos se ven igual.
   Columnas configurables en CFG.week: order [claves], del {k:1} (sacada de la tabla),
   hid {k:1} (Flor no la ve), np {k:1} (la terapeuta no la ve), l {k:"nombre"}. */
(function(){
const EMOS=[["trist","😢","Tristeza"],["verg","😳","Vergüenza"],["enojo","😠","Enojo"],["miedo","😨","Miedo"],["alegria","😊","Alegría"]];
const EC={trist:"55,138,221",verg:"29,158,117",enojo:"226,75,74",miedo:"127,119,221",alegria:"239,140,39"};
const DIAS=["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const pad2=n=>String(n).padStart(2,"0");
const dt=v=>new Date(v+"T12:00:00");
const iso=d=>d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate());
const fmt=v=>{const[y,m,x]=v.split("-");return `${x}/${m}/${y}`};
const short=k=>DIAS[dt(k).getDay()].slice(0,3)+" "+fmt(k).slice(0,5);
const ESC=["No pensé en usarla","Pensé en usarla pero no lo quise","Pensé en hacerlo, no lo hice pero lo deseaba","Me esforcé pero no pude","Me esforcé, la usé pero no me ayudó","Me esforcé, la usé y me ayudó","No me esforcé, la usé, no funcionó","No me esforcé, la usé, funcionó"];
const GROUPS={dia:"",cond:"Conductas · (impulso) acción",psi:"Para mi psicóloga",emo:"Emociones (0-5)",hab:"Habilidades",cuerpo:"Cuerpo"};
const GORDER=["dia","cond","psi","emo","hab","cuerpo"];
const SN=(x,f,good)=>!x||!x[f]?"–":`<b class="${(x[f]==="SÍ")===!!good?"no":"si"}">${x[f]}</b>`;
const IMP=v=>+v>0?`<b class="si">(${+v})</b>`:`(${+v||0})`;
function cond(imp,acc,card,label,det){return {k:card,g:"cond",l:label,cls:"c4",cd:card,c:x=>x?`${IMP(x[imp])} ${SN(x,acc)}`+(det&&x[acc]==="SÍ"&&x.suicDet?`<div class="det">${esc(x.suicDet)}</div>`:""):"–"}}
function base(){return [
 {k:"dia",g:"dia",l:"Lo que hice",cls:"nt",cd:"dia",c:(x,k,R,o)=>{if(x&&x.notas)return `<div class="nn">${esc(x.notas)}</div>`+(o&&o.thoughts?o.thoughts(k):"");const ps=o&&o.pens?o.pens(k)||[]:[];return ps.length?pens(ps,o.who==="me"?k:""):"–"}},
 cond("suicImp","suicAcc","suic","Suicidio/CASIS",1),
 cond("hostImp","hostAcc","host","Comport. hostil"),
 cond("sexImp","sexAcc","sexo","Sexo / hombres"),
 {k:"scroll",g:"cond",l:"Scrollear",cls:"c4",cd:"scroll",c:x=>x?`<span class="sc2">${IMP(x.scrImp)}</span><span class="sc2">${(+x.scrH||0)}:${pad2(+x.scrM||0)} h</span>`:"–"},
 {k:"terapia",g:"cond",l:"Dejar terapia",t:"Impulso de dejar terapia",cls:"c4",cd:"cuerpo",off:1,c:x=>x?IMP(x.terapia):"–"},
 {k:"inex",g:"psi",l:"Inexistencia",cd:"pens",c:x=>SN(x,"inex")},
 {k:"pas",g:"psi",l:"Ideación pasiva",cd:"pens",c:x=>SN(x,"pas")},
 {k:"act",g:"psi",l:"Ideación activa",cd:"pens",c:x=>SN(x,"act")},
 ...EMOS.map(e=>({k:e[0],g:"emo",l:e[1],t:e[2],em:1,cd:"emo",c:x=>x?(+x[e[0]]||0):"–",st:x=>{if(!x)return "";const v=+x[e[0]]||0;return `background:rgba(${EC[e[0]]},${(v/5*.9).toFixed(2)});${v>=4?"color:#fff;font-weight:700":""}`}})),
 {k:"otras",g:"emo",l:"Otras",t:"Otras emociones",cls:"hb",cd:"emo",c:x=>x?((x.otras||[]).filter(o=>o.n).map(o=>`${esc(o.n)} (${o.v})`).join("<br>")||"–"):"–"},
 {k:"habs",g:"hab",l:"Habilidades",cls:"hb",cd:"hab",c:x=>x&&(x.habs||[]).length?x.habs.map(h=>`${esc(h.h)} (${h.p})`).join("<br>"):"–"},
 {k:"sueno",g:"cuerpo",l:"😴",t:"Sueño",em:1,cd:"cuerpo",c:x=>x&&x.sueno!==""&&x.sueno!=null?x.sueno+" h":"–",st:x=>x&&x.sueno!==""&&x.sueno!=null&&+x.sueno<6?"color:var(--mood-mal);font-weight:700":""},
 {k:"agua",g:"cuerpo",l:"💧",t:"Agua",em:1,cd:"cuerpo",c:x=>x&&x.agua!==""&&x.agua!=null?x.agua+" L":"–",st:x=>x&&x.agua!==""&&x.agua!=null&&+x.agua<2?"color:var(--mood-mal);font-weight:700":""},
 {k:"ejer",g:"cuerpo",l:"🏃‍♀️",t:"Ejercicio",em:1,cd:"cuerpo",c:x=>SN(x,"ejer",1)},
 {k:"sol",g:"cuerpo",l:"☀️",t:"Sol",em:1,cd:"cuerpo",c:x=>SN(x,"sol",1)},
 {k:"ciclo",g:"cuerpo",l:"🩸",t:"Día del ciclo",em:1,cd:"cuerpo",c:(x,k,R)=>{const c=cycleDay(R,k);return c===""?"–":c},st:x=>x&&x.mens==="SÍ"?"background:rgba(226,75,74,.28);color:var(--mood-mal);font-weight:700":""},
 {k:"bano",g:"cuerpo",l:"🚽",em:1,t:"Fui al baño",off:1,cd:"cuerpo",c:x=>SN(x,"bano",1)},
 {k:"comi",g:"cuerpo",l:"🍽️",em:1,t:"Comí a horario",off:1,cd:"cuerpo",c:x=>SN(x,"comi",1)},
 {k:"medic",g:"cuerpo",l:"💊",em:1,t:"Tomé la medicación",off:1,cd:"cuerpo",c:x=>SN(x,"medic",1)},
 {k:"alcohol",g:"cuerpo",l:"🍷",em:1,t:"Alcohol / sustancias",off:1,cd:"cuerpo",c:x=>SN(x,"alcohol")},
 {k:"social",g:"cuerpo",l:"👥",em:1,t:"Contacto social",off:1,cd:"cuerpo",c:x=>SN(x,"social",1)}]}
function emo1(t){const m=String(t||"").trim().match(/^(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)/u);return m?m[1]:""}
function cycleDay(R,k){const ks=Object.keys(R).filter(x=>R[x]&&R[x].mens==="SÍ").sort();let s0=null;for(const s of ks){if(s>k)break;const p=dt(s);p.setDate(p.getDate()-1);const pk=iso(p);if(!(R[pk]&&R[pk].mens==="SÍ"))s0=s}if(!s0)return "";const n=Math.round((dt(k)-dt(s0))/864e5)+1;return n>60?"":n}
/* pensamientos desglosados: se muestran cuando el día no tiene resumen («Lo que hice») */
const MH={increible:"#1e8449",bien:"#9ccc65","mas o menos":"#dfb43a",mal:"#e0524f",horrible:"#7a4fc9"};
const ML={increible:"Increíble",bien:"Bien","mas o menos":"Más o menos",mal:"Mal",horrible:"Horrible"};
const mk=m=>String(m||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
function css(){if(typeof document==="undefined"||document.getElementById("sem-pens"))return;const st=document.createElement("style");st.id="sem-pens";
 st.textContent=".wp{display:flex;flex-direction:column;gap:6px;text-align:left}.wp .wpn{border-left:3px solid var(--c,#999);padding:2px 0 2px 7px}.wp .wph{font-size:11px;font-weight:600;opacity:.8}.wp .wpe{font-size:10.5px;opacity:.75}.wp .wpn p{margin:2px 0 0;white-space:pre-wrap;font-style:normal;line-height:1.35}.wp [data-pv]{cursor:pointer}";
 document.head.appendChild(st)}
function emoTxt(e){return (e.emos||[]).filter(y=>y&&y.n&&+y.v).map(y=>`${esc(y.n)} ${+y.v}`).join(" · ")}
function pens(ps,pv){css();return `<div class="rg-pens wp">${ps.map((e,i)=>{const m=mk(e.mood),et=emoTxt(e);
 return `<div class="wpn" style="--c:${MH[m]||"#999"}" ${pv?`data-pv="${pv}|${i}" title="Tocá para verlo completo"`:""}><div class="wph">${esc(e.time||"")}${ML[m]?(e.time?" · ":"")+ML[m]:""}</div>${et?`<div class="wpe">${et}</div>`:""}<p>${esc(e.text||"")}</p></div>`}).join("")}</div>`}
/* todas las columnas posibles con su estado según la configuración */
function all(cfg){cfg=cfg||{};const W=cfg.week||{},B=cfg.body||{};
 const L=base().concat((cfg.extra||[]).filter(x=>!x.del).map(x=>({k:x.k,g:"cuerpo",l:emo1(x.l)||"📌",t:x.l,em:1,off:1,cd:"cuerpo",c:y=>x.t==="yn"?SN(y,x.k,x.g!==0):(y&&y[x.k]!==""&&y[x.k]!=null?esc(y[x.k]):"–")})));
 L.forEach((c,i)=>{c.i=i;if(B[c.k]&&B[c.k].l&&!c.em&&c.g==="cuerpo")c.t=B[c.k].l;
  c.del=W.del&&c.k in W.del?!!W.del[c.k]:!!c.off;c.hid=!!(W.hid&&W.hid[c.k]);c.np=!!(W.np&&W.np[c.k]);
  if(W.l&&W.l[c.k]){c.name=W.l[c.k];if(c.g==="cuerpo")c.l=emo1(W.l[c.k])||c.l;else{c.l=esc(W.l[c.k]);c.em=0}}else c.name=c.t||c.l;
  if(c.k==="suic"&&!(W.l&&W.l.suic))c.l="Suicidio/<wbr>CASIS"});
 const ord=W.order||[],pos=c=>{const j=ord.indexOf(c.k);return j<0?1000+c.i:j};
 return L.sort((a,b)=>GORDER.indexOf(a.g)-GORDER.indexOf(b.g)||pos(a)-pos(b))}
/* opts: {days, REG, cfg, who:'me'|'psi', dayColor(k), dayTitle(k), today, pens(k)→[{time,mood,text,emos:[{n,v}]}], thoughts(k)} */
function render(o){const R=o.REG||{},ds=o.days,reg=ds.filter(k=>R[k]).map(k=>[k,R[k]]);
 const avg=f=>{const v=reg.map(([,x])=>f(x)).filter(v=>v!==""&&v!=null&&!isNaN(v));return v.length?Math.round(v.reduce((a,b)=>a+ +b,0)/v.length*10)/10:"–"};
 const scr=reg.reduce((a,[,x])=>a+(+x.scrH||0)*60+(+x.scrM||0),0),sinSol=reg.filter(([,x])=>x.sol==="NO").length;
 const anyPsi=reg.some(([,x])=>["inex","pas","act"].some(p=>x[p]==="SÍ")),anyHab=reg.some(([,x])=>(x.habs||[]).length);
 const C=all(o.cfg).filter(c=>!c.del&&!(o.who==="psi"?c.np:c.hid)&&(c.g!=="psi"||anyPsi)&&(c.g!=="hab"||anyHab));
 const groups=[];C.forEach(c=>{const t=GROUPS[c.g];if(groups.length&&groups[groups.length-1].g===c.g)groups[groups.length-1].n++;else groups.push({g:c.g,t,n:1})});
 const tod=o.today||iso(new Date());
 const dot=k=>{const c=o.dayColor?o.dayColor(k):"";return `<i class="md" style="${c?"background:"+c:""}" title="${esc(o.dayTitle?o.dayTitle(k):"")}"></i>`};
 const t=`<table class="tt"><thead><tr class="gr"><td></td>${groups.map(x=>`<td colspan="${x.n}">${x.t}</td>`).join("")}</tr><tr><th></th>${C.map(c=>`<th class="${c.em?"em":""} ${c.cls==="c4"?"c4":""}" title="${esc(c.name)}">${c.l}</th>`).join("")}</tr></thead><tbody>${ds.map(k=>`<tr class="${k===tod?"hoy":""}"><th>${dot(k)}${short(k)}</th>${C.map(c=>`<td class="${c.cls||""}" ${o.who==="me"?`data-ed="${c.cd}|${k}"`:`data-cell="${c.k}|${k}"`} style="${c.st?c.st(R[k]):""}">${c.c(R[k],k,R,o)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
 return `<div class="rg-met"><div><b>${avg(x=>x.sueno)}</b>😴 h sueño (prom.)</div><div><b>${avg(x=>x.agua)}</b>💧 litros (prom.)</div><div><b>${Math.floor(scr/60)}:${pad2(scr%60)}</b>📱 h de scroll</div><div><b>${sinSol}</b>☀️ días sin sol</div>${o.tools?`<div class="mt">${o.tools}</div>`:""}</div><div class="tw">${t}</div>`}
/* detalle en grande de una celda (lo usa la página de la terapeuta) */
function detail(o,ck,k){const R=o.REG||{},x=R[k],c=all(o.cfg).find(y=>y.k===ck);if(!c)return null;
 const title=(c.g==="cuerpo"&&c.em?c.l+" ":"")+esc(c.name),when=DIAS[dt(k).getDay()]+" "+fmt(k);let body;
 const ps=o.pens?o.pens(k)||[]:[];
 if(ck==="dia"&&!(x&&x.notas)&&ps.length)body=pens(ps,"");
 else if(!x)body="Sin registro este día.";
 else if(ck==="habs")body=(x.habs||[]).length?x.habs.map(h=>`<div class="hd"><b>${esc(h.h)}</b> · ${h.p} – ${ESC[h.p]||""}${h.c?`<p>${esc(h.c)}</p>`:""}</div>`).join(""):"No usó habilidades este día.";
 else if(ck==="dia")body=x.notas?`<p style="white-space:pre-wrap">${esc(x.notas)}</p>`:"Sin resumen este día.";
 else if(ck==="otras")body=(x.otras||[]).filter(y=>y.n).map(y=>`${esc(y.n)}: <b>${y.v}</b> de 5`).join("<br>")||"Ninguna.";
 else if(c.g==="emo")body=`<b style="font-size:22px">${+x[ck]||0}</b> de 5`;
 else body=`<div class="big">${c.c(x,k,R,o)}</div>`;
 return {title,when,body}}
window.Semana={render,all,detail,ESC,GROUPS,GORDER,pens,VERSION:3};
})();
