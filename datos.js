/* ===== Datos compartidos (web, catálogo de cursos y portal) =====
   Por ahora se guardan en el navegador (localStorage).
   Cuando conectemos Supabase, solo hay que cambiar este archivo. */
function esc(t){return String(t==null?'':t).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var DB={
  get:function(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
  set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){if(typeof toast==='function')toast('No se pudo guardar (almacenamiento lleno)');return false}}
};
async function sha(t){
  var s='cosmos::'+t;
  if(window.crypto&&crypto.subtle){var b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [].map.call(new Uint8Array(b),function(x){return x.toString(16).padStart(2,'0')}).join('')}
  var h=5381;for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return 'f'+h;
}
var WA='584220433936',IG='https://www.instagram.com/cosmos_agenciacreativa/';
function wa(txt){return 'https://wa.me/'+WA+(txt?'?text='+encodeURIComponent(txt):'')}
var K={users:'cosmos_users',ses:'cosmos_session',courses:'cosmos_cursos',orders:'cosmos_solicitudes',subs:'cosmos_subprefs',q:'cosmos_calidad'};

var TITLES=['Conociendo CapCut en tu teléfono','La línea de tiempo y cortes básicos','Formato y exportación','Audio básico','Texto y títulos','Subtítulos automáticos','Transiciones y animaciones','Velocidad y ritmo','Efectos y filtros','Corrección de color básica','Capas y pistas superpuestas','Fotogramas clave (keyframes)','Herramientas de IA y fondo','Plantillas y sincronización con música','Proyecto final integrador'];
var SUM={1:'En esta primera clase conoceremos CapCut y daremos los primeros pasos para empezar a editar tus videos.',2:'Aprende a usar la línea de tiempo y a hacer los cortes básicos para armar tu video.'};
function vids(n){return [{label:'1080p',url:'video/clase'+n+'-1080.mp4'},{label:'720p',url:'video/clase'+n+'-720.mp4'},{label:'480p',url:'video/clase'+n+'-480.mp4'}]}
var LIVE=[1,2];

/* Aquí se define lo que ve el público en el catálogo si todavía no hay nada guardado.
   price: precio que se muestra (ej: "$25"). Si está vacío se muestra "Consultar precio". */
function defaultCourses(){
  var cl=[];for(var i=1;i<=15;i++)cl.push({n:i,title:'Clase '+i+': '+TITLES[i-1],summary:SUM[i]||'',published:LIVE.indexOf(i)>-1,sources:LIVE.indexOf(i)>-1?vids(i):[],subs:'',subsName:''});
  return [
    {id:'capcut',title:'Curso de CapCut',available:true,price:'',
      summary:'Aprende a editar videos para tus redes desde cero, de forma fácil y creativa.',
      description:'Aprende a editar videos desde tu teléfono con CapCut, paso a paso y desde cero. Un curso práctico de 15 clases con el equipo de Cosmos: conocerás la herramienta, harás tus primeros cortes, agregarás audio, textos y efectos, y terminarás creando tu propio proyecto final.',
      images:['img/curso-capcut-1.jpg','img/curso-capcut-2.jpg','img/curso-capcut-3.jpg'],
      teacher:{name:'Miguelon',role:'CEO de Cosmos',photo:'img/profesor-miguelon.jpg'},classes:cl},
    {id:'creatividad',title:'Curso de Creatividad',available:false,price:'',
      summary:'Aprende a generar ideas originales y convertirlas en contenido que destaque.',description:'',images:[],teacher:{name:'',role:'',photo:''},classes:[]},
    {id:'diseno',title:'Curso de Diseño gráfico',available:false,price:'',
      summary:'Domina las bases del diseño para crear piezas que llamen la atención.',description:'',images:[],teacher:{name:'',role:'',photo:''},classes:[]}
  ];
}
function users(){return DB.get(K.users,[]).map(function(u){if(!u.courses)u.courses=[];return u})}
function courses(){
  var c=DB.get(K.courses,null);
  if(!c){c=defaultCourses();DB.set(K.courses,c);return c}
  /* Completa datos que faltan en lo guardado antes; solo rellena lo que está vacío y respeta lo que editaste */
  var df=defaultCourses(),ch=false;
  c.forEach(function(x){
    var d=df.filter(function(y){return y.id===x.id})[0]||{};
    ['price','description'].forEach(function(f){if(x[f]===undefined){x[f]=d[f]||'';ch=true}});
    if(x.images===undefined){x.images=d.images||[];ch=true}
    if(x.teacher===undefined){x.teacher=d.teacher||{name:'',role:'',photo:''};ch=true}
  });
  var cp=c.filter(function(x){return x.id==='capcut'})[0];
  if(cp)cp.classes.forEach(function(k){
    var d=df[0].classes[k.n-1];if(!d)return;
    if(k.title==='Clase '+k.n){k.title=d.title;ch=true}
    if(!k.summary&&d.summary){k.summary=d.summary;ch=true}
    var known=k.sources.every(function(s){return /^video\/clase\d+-(1080|720|480)\.mp4$/.test(s.url)});
    if(d.published&&!k.published&&!k.sources.length){k.published=true;k.sources=d.sources;ch=true}
    else if(d.sources.length&&known&&k.sources.length<3){k.sources=d.sources;ch=true}
  });
  if(ch)DB.set(K.courses,c);
  return c;
}
function me(){var id=DB.get(K.ses,null);return users().filter(function(u){return u.id===id})[0]||null}
/* ¿Este usuario tiene acceso al curso? (el admin tiene acceso a todos) */
function hasAccess(u,cid){return !!u&&(u.role==='admin'||u.courses.indexOf(cid)>-1)}
function price(c){return c.price?c.price:'Consultar precio'}
/* Foto redonda con inicial de respaldo si no hay imagen */
function avatar(t,size){
  var ini=esc((t&&t.name||'?').trim().charAt(0).toUpperCase());
  return '<span class="av" style="--s:'+(size||56)+'px"><b>'+ini+'</b>'+(t&&t.photo?'<img src="'+esc(t.photo)+'" alt="" onerror="this.remove()">':'')+'</span>';
}
