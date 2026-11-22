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
var K={users:'cosmos_users',ses:'cosmos_session',courses:'cosmos_cursos',orders:'cosmos_solicitudes',subs:'cosmos_subprefs',q:'cosmos_calidad',acc:'cosmos_acceso',serv:'cosmos_servicios',prog:'cosmos_progreso'};

var TITLES=['Conociendo CapCut en tu teléfono','La línea de tiempo y cortes básicos','Formato y exportación','Audio básico','Texto y títulos','Subtítulos automáticos','Transiciones y animaciones','Velocidad y ritmo','Efectos y filtros','Corrección de color básica','Capas y pistas superpuestas','Fotogramas clave (keyframes)','Herramientas de IA y fondo','Plantillas y sincronización con música','Proyecto final integrador'];
var SUM={1:'En esta primera clase conoceremos CapCut y daremos los primeros pasos para empezar a editar tus videos.',2:'Aprende a usar la línea de tiempo y a hacer los cortes básicos para armar tu video.',3:'Aprende a elegir el formato correcto de tu video y a exportarlo con la mejor calidad.'};
function vids(n){return [{label:'1080p',url:'video/clase'+n+'-1080.mp4'},{label:'720p',url:'video/clase'+n+'-720.mp4'},{label:'480p',url:'video/clase'+n+'-480.mp4'}]}
var LIVE=[1,2,3];
var OLD_DESC='Aprende a editar videos desde tu teléfono con CapCut, paso a paso y desde cero. Un curso práctico de 15 clases con el equipo de Cosmos: conocerás la herramienta, harás tus primeros cortes, agregarás audio, textos y efectos, y terminarás creando tu propio proyecto final.';

/* Lo que ve el público si todavía no hay nada guardado. price = precio que se muestra. */
function defaultCourses(){
  var cl=[];for(var i=1;i<=15;i++)cl.push({n:i,title:'Clase '+i+': '+TITLES[i-1],summary:SUM[i]||'',published:LIVE.indexOf(i)>-1,sources:LIVE.indexOf(i)>-1?vids(i):[],subs:'',subsName:'',resources:[],resNote:'',showRes:false});
  return [
    {id:'capcut',title:'Curso de CapCut',available:true,price:'$10',
      summary:'Aprende a editar videos para tus redes desde cero, de forma fácil y creativa.',
      description:'Aprende a editar videos desde tu teléfono con CapCut, paso a paso y desde cero. Un curso práctico con el equipo de Cosmos para que crees videos creativos y profesionales para tus redes.',
      images:['img/curso-capcut-1.jpg','img/curso-capcut-2.jpg','img/curso-capcut-3.jpg'],
      teacher:{name:'Miguelon',role:'CEO de Cosmos',photo:'img/profesor-miguelon.jpg'},classes:cl},
    {id:'creatividad',title:'Curso de Creatividad',available:false,price:'',
      summary:'Aprende a generar ideas originales y convertirlas en contenido que destaque.',description:'',images:[],teacher:{name:'',role:'',photo:''},classes:[]},
    {id:'diseno',title:'Curso de Diseño gráfico',available:false,price:'',
      summary:'Domina las bases del diseño para crear piezas que llamen la atención.',description:'',images:[],teacher:{name:'',role:'',photo:''},classes:[]}
  ];
}
function defaultServices(){
  return [
    {id:'identidad',title:'Diseño de logos y branding',price:'',images:[],
      summary:'Tu logo y toda la identidad visual de tu marca, para que te veas profesional y coherente.',
      description:'Creamos el logo y toda la identidad visual de tu marca: colores, tipografías y reglas de uso para que te veas profesional y coherente en todos lados.',
      bullets:['Diseño de logo en varias versiones','Paleta de colores y tipografías','Guía de marca lista para usar']},
    {id:'redes',title:'Gestión de redes y creación de contenido',price:'',images:[],
      summary:'Nos encargamos de tus redes cada mes: diseño, video y publicación.',
      description:'Nos encargamos de todo lo que tus redes necesitan cada mes: desde el diseño gráfico y la creación de videos hasta la planificación, la publicación y el seguimiento de tu contenido.',
      bullets:['Diseño gráfico para publicaciones y stories','Producción y edición de videos y reels','Ideas y calendario de contenido','Publicación y seguimiento mensual']},
    {id:'web',title:'Diseño de páginas web',price:'',images:[],
      summary:'La página web de tu negocio: moderna, rápida y lista para celular y computadora.',
      description:'Diseñamos y desarrollamos la página web de tu negocio: moderna, rápida y pensada para que se vea increíble en computadora y celular.',
      bullets:['Diseño personalizado con tu identidad','Adaptada a computadora y celular','Lista para publicar en tu propio dominio']},
    {id:'capacitaciones',title:'Cursos y capacitaciones',price:'',images:[],
      summary:'Cursos y capacitaciones a la medida para estudiantes y equipos de empresas.',
      description:'Además de nuestros cursos disponibles, ofrecemos cursos y capacitaciones a la medida para estudiantes o para los empleados de empresas que lo requieran. Es un servicio más personalizado que nuestros cursos regulares: lo adaptamos a tu grupo y a tus objetivos.',
      bullets:['Capacitaciones para estudiantes','Capacitaciones para equipos de empresas','Contenido adaptado a tus objetivos']}
  ];
}
function users(){return DB.get(K.users,[])}
function courses(){
  var c=DB.get(K.courses,null);
  if(!c){c=defaultCourses();DB.set(K.courses,c);return c}
  /* Completa datos que faltan en lo guardado antes; solo rellena lo que está vacío o por defecto */
  var df=defaultCourses(),ch=false;
  c.forEach(function(x){
    var d=df.filter(function(y){return y.id===x.id})[0]||{};
    ['price','description'].forEach(function(f){if(x[f]===undefined){x[f]=d[f]||'';ch=true}});
    if(x.id==='capcut'&&!x.price){x.price=d.price;ch=true}
    if(x.id==='capcut'&&x.description===OLD_DESC){x.description=d.description;ch=true}
    if(x.images===undefined){x.images=d.images||[];ch=true}
    if(x.teacher===undefined){x.teacher=d.teacher||{name:'',role:'',photo:''};ch=true}
    (x.classes||[]).forEach(function(k){if(k.resources===undefined){k.resources=[];k.resNote='';k.showRes=false;ch=true}});
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
function services(){
  var s=DB.get(K.serv,null);
  if(!s){s=defaultServices();DB.set(K.serv,s)}
  return s;
}
function me(){var id=DB.get(K.ses,null);return users().filter(function(u){return u.id===id})[0]||null}

/* ===== Accesos: quién tiene qué curso o servicio, con fecha límite opcional ===== */
function today(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
function access(){
  var a=DB.get(K.acc,null);
  if(a)return a;
  a=[];users().forEach(function(u){(u.courses||[]).forEach(function(cid){a.push({uid:u.id,type:'curso',id:cid,until:''})})});
  DB.set(K.acc,a);return a;
}
function activeRec(r){return !r.until||r.until>=today()}
function has(u,type,id){return !!u&&(u.role==='admin'||access().some(function(r){return r.uid===u.id&&r.type===type&&r.id===id&&activeRec(r)}))}
function hasAccess(u,cid){return has(u,'curso',cid)}
function hasService(u,sid){return has(u,'servicio',sid)}
function price(c){return c.price?c.price:'Consultar precio'}

/* ===== Progreso del alumno ===== */
function doneList(uid,cid){var p=DB.get(K.prog,{});return (p[uid]&&p[uid][cid])||[]}
function toggleDone(uid,cid,n){
  var p=DB.get(K.prog,{});p[uid]=p[uid]||{};var l=p[uid][cid]||[],i=l.indexOf(n);
  if(i>-1)l.splice(i,1);else l.push(n);p[uid][cid]=l;DB.set(K.prog,p);return i===-1;
}
function pct(uid,c){
  var ns=c.classes.map(function(k){return k.n}),d=doneList(uid,c.id).filter(function(n){return ns.indexOf(n)>-1}).length;
  return ns.length?Math.round(d/ns.length*100):0;
}

/* Foto redonda con inicial de respaldo si no hay imagen */
function avatar(t,size){
  var ini=esc((t&&t.name||'?').trim().charAt(0).toUpperCase());
  return '<span class="av" style="--s:'+(size||56)+'px"><b>'+ini+'</b>'+(t&&t.photo?'<img src="'+esc(t.photo)+'" alt="" onerror="this.remove()">':'')+'</span>';
}
