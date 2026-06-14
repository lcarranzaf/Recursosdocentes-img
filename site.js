/* ===========================================================================
   RecursoDocentes — site.js  (menú + portada/catálogo para Blogger Contempo)
   Se carga desde el tema con UNA sola línea:
     <script src="https://cdn.jsdelivr.net/gh/lcarranzaf/Recursosdocentes-img@main/site.js" defer></script>
   Cualquier cambio de diseño se hace aquí -> git push -> (purgar jsDelivr).
   =========================================================================== */
(function () {
  "use strict";

  // ---- CONFIG: grados con contenido (agrega aquí al crecer) ----
  var TAX = {
    "Primaria":   ["1° grado", "2° grado", "3° grado", "4° grado", "5° grado"],
    "Secundaria": ["1° grado"]
  };
  var MATERIAS = ["Matemáticas", "Lengua", "Ciencias", "Historia", "Inglés"];
  var GCOLOR = ["#ef4444", "#22c55e", "#a16207", "#f97316", "#a855f7", "#0ea5e9"];
  var MCOLOR = { "Matemáticas":"#2563eb","Lengua":"#16a34a","Ciencias":"#0d9488","Historia":"#d97706","Inglés":"#ea580c" };

  var BLOG = location.origin;
  var PAGE = location.pathname;
  var IS_HOME = (PAGE === "/" || PAGE === "");
  var APP = null;

  function par(k){ return new URLSearchParams(location.search).get(k) || ""; }
  function go(p){ return PAGE + (p ? ("?" + p) : ""); }
  function esc(s){ return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function gradeLink(n,g){ return "/?n=" + encodeURIComponent(n) + "&g=" + encodeURIComponent(g); }

  /* ---------------------------- CSS ---------------------------- */
  function injectCSS(){
    if (document.getElementById("rd-css")) return;
    var css = [
      /* quitar fondo feo de Contempo */
      "html,body,.body-fauxcolumn-outer{background:#f4f6f8 !important}",
      "body{background-image:none !important}",
      ".rd-home .blog-posts,.rd-home .blog-pager,.rd-home .post-feeds,.rd-home .no-posts-message,.rd-home .FeaturedPost{display:none !important}",

      /* MENÚ */
      "#rd-menu{position:sticky;top:0;z-index:99999;background:#16a34a;display:flex;flex-wrap:wrap;align-items:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.18)}",
      "#rd-menu .rd-brand{color:#fff;font-weight:800;padding:13px 18px;font-size:17px;text-decoration:none;letter-spacing:.3px}",
      "#rd-menu .rd-mi{position:relative}",
      "#rd-menu .rd-mi>a,#rd-menu .rd-mi>button{display:block;padding:15px 16px;color:#fff;background:none;border:0;font:inherit;font-weight:600;cursor:pointer;text-decoration:none}",
      "#rd-menu .rd-mi.has>button::after{content:'\\25BE';font-size:11px;margin-left:6px;opacity:.9}",
      "#rd-menu .rd-mi:hover>a,#rd-menu .rd-mi:hover>button,#rd-menu .rd-mi.open>button{background:rgba(0,0,0,.18)}",
      "#rd-menu .rd-sub{position:absolute;left:0;top:100%;min-width:200px;background:#fff;border-radius:0 0 12px 12px;box-shadow:0 12px 30px rgba(0,0,0,.22);display:none;overflow:hidden}",
      "#rd-menu .rd-mi:hover .rd-sub,#rd-menu .rd-mi.open .rd-sub{display:block}",
      "#rd-menu .rd-sub a{display:block;padding:11px 16px;color:#1f2937;text-decoration:none;border-bottom:1px solid #f1f5f9;font-weight:500}",
      "#rd-menu .rd-sub a:hover{background:#f0fdf4;color:#15803d}",
      "@media (max-width:640px){#rd-menu .rd-sub{position:static;box-shadow:none;border-radius:0;min-width:100%}#rd-menu .rd-brand{font-size:15px;padding:12px}}",

      /* CONTENEDOR */
      "#rd-app{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1f2937;max-width:1100px;margin:0 auto;padding:18px 16px 40px}",

      /* HERO */
      ".rd-hero{position:relative;background:linear-gradient(135deg,#16a34a,#0e7a3a);color:#fff;border-radius:20px;padding:46px 26px;text-align:center;margin:8px 0 10px;box-shadow:0 10px 30px rgba(16,163,74,.25);overflow:hidden}",
      ".rd-hero h1{margin:0 0 12px;font-size:34px;line-height:1.15;font-weight:800}",
      ".rd-hero p{margin:0 auto;max-width:640px;font-size:17px;opacity:.96;line-height:1.55}",
      ".rd-hero .rd-pills{margin-top:18px;display:flex;flex-wrap:wrap;gap:8px;justify-content:center}",
      ".rd-hero .rd-pills span{background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);padding:6px 13px;border-radius:999px;font-size:13px;font-weight:600}",

      /* FEATURES */
      ".rd-feat{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin:22px 0}",
      ".rd-feat .c{background:#fff;border:1px solid #e8ebef;border-radius:14px;padding:18px;text-align:center}",
      ".rd-feat .c .i{font-size:30px}",
      ".rd-feat .c h3{margin:8px 0 4px;font-size:16px;color:#0f172a}",
      ".rd-feat .c p{margin:0;font-size:14px;color:#64748b;line-height:1.45}",

      /* SECCIONES */
      ".rd-secTitle{font-size:22px;margin:30px 0 14px;color:#0f172a;border-left:6px solid #16a34a;padding-left:12px;font-weight:800}",
      ".rd-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:16px}",
      ".rd-card{position:relative;display:block;text-decoration:none;border-radius:16px;padding:26px 14px;color:#fff;text-align:center;box-shadow:0 4px 14px rgba(0,0,0,.14);transition:transform .14s,box-shadow .14s}",
      ".rd-card:hover{transform:translateY(-4px);box-shadow:0 10px 24px rgba(0,0,0,.20)}",
      ".rd-card .n{font-size:40px;line-height:1;display:block;font-weight:900;text-shadow:0 2px 6px rgba(0,0,0,.18)}",
      ".rd-card .l{font-size:12px;letter-spacing:1px;text-transform:uppercase;font-weight:800;opacity:.97;display:block;margin-top:6px}",

      /* LISTADO */
      ".rd-res{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:18px}",
      ".rd-item{display:block;text-decoration:none;color:#1f2937;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;background:#fff;transition:box-shadow .14s,transform .14s}",
      ".rd-item:hover{box-shadow:0 8px 22px rgba(0,0,0,.12);transform:translateY(-3px)}",
      ".rd-thumb{height:140px;background:#f1f5f9 center/cover no-repeat;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:15px;text-align:center;padding:10px}",
      ".rd-item .b{padding:11px 13px}",
      ".rd-item .t{font-weight:700;font-size:14.5px;line-height:1.3;margin:0 0 7px;color:#0f172a}",
      ".rd-tag{display:inline-block;font-size:11px;font-weight:700;padding:2px 9px;border-radius:999px;background:#eff6ff;color:#1e3a8a}",
      ".rd-bc{margin:6px 0 16px;font-size:14px;color:#64748b}.rd-bc a{color:#16a34a;text-decoration:none;font-weight:700}",
      ".rd-chips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 20px}",
      ".rd-chip{font-size:13px;padding:7px 14px;border-radius:999px;border:1px solid #cbd5e1;text-decoration:none;color:#334155;font-weight:600}",
      ".rd-chip.on{background:#16a34a;color:#fff;border-color:#16a34a}",
      ".rd-empty{padding:26px;background:#fff7ed;border:1px solid #fed7aa;border-radius:14px;color:#9a3412}"
    ].join("");
    var st = document.createElement("style");
    st.id = "rd-css";
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ---------------------------- MENÚ ---------------------------- */
  function buildMenu(){
    if (document.getElementById("rd-menu")) return;
    var html = '<a class="rd-brand" href="/">📚 RecursoDocentes</a>' +
               '<div class="rd-mi"><a href="/">Inicio</a></div>';
    Object.keys(TAX).forEach(function(nivel){
      html += '<div class="rd-mi has"><button type="button">' + nivel + '</button><div class="rd-sub">';
      TAX[nivel].forEach(function(g){
        var num = g.split("°")[0];
        html += '<a href="' + gradeLink(nivel, g) + '">' + num + '° de ' + nivel + '</a>';
      });
      html += '</div></div>';
    });
    var bar = document.createElement("nav");
    bar.id = "rd-menu";
    bar.innerHTML = html;
    document.body.insertBefore(bar, document.body.firstChild);

    bar.addEventListener("click", function(e){
      var btn = e.target.closest("button"); if(!btn) return;
      var mi = btn.parentNode, was = mi.classList.contains("open");
      bar.querySelectorAll(".rd-mi.open").forEach(function(x){ x.classList.remove("open"); });
      if(!was) mi.classList.add("open");
    });
    document.addEventListener("click", function(e){
      if(!e.target.closest("#rd-menu")) bar.querySelectorAll(".rd-mi.open").forEach(function(x){ x.classList.remove("open"); });
    });
  }

  /* ---------------------------- PORTADA ---------------------------- */
  function renderLanding(){
    var h = '<div class="rd-hero"><h1>Recursos educativos gratis para docentes</h1>' +
            '<p>Fichas, actividades y material listo para imprimir de Primaria y Secundaria. ' +
            'Organizado por grado y materia, con clave de respuestas y descarga en PDF.</p>' +
            '<div class="rd-pills"><span>✅ 100% gratis</span><span>🖨️ Listo para imprimir</span>' +
            '<span>📄 Descarga en PDF</span><span>🎯 Por grado y materia</span></div></div>';

    h += '<div class="rd-feat">' +
         '<div class="c"><div class="i">🧮</div><h3>Todas las materias</h3><p>Matemáticas, Lengua, Ciencias, Historia e Inglés.</p></div>' +
         '<div class="c"><div class="i">📚</div><h3>Por grado</h3><p>Material adaptado a cada grado de Primaria y Secundaria.</p></div>' +
         '<div class="c"><div class="i">⚡</div><h3>Descarga rápida</h3><p>Abre, descarga el PDF e imprime en segundos.</p></div>' +
         '</div>';

    Object.keys(TAX).forEach(function(nivel){
      h += '<h2 class="rd-secTitle">' + nivel + '</h2><div class="rd-grid">';
      TAX[nivel].forEach(function(g,i){
        var color = GCOLOR[i % GCOLOR.length];
        var num = g.split("°")[0];
        h += '<a class="rd-card" style="background:linear-gradient(160deg,' + color + ',' + shade(color) + ')" href="' +
             gradeLink(nivel, g) + '"><span class="n">' + num + '°</span><span class="l">' + nivel + '</span></a>';
      });
      h += '</div>';
    });
    APP.innerHTML = h;
  }
  function shade(hex){ // oscurece un poco el color para el degradado
    var c = hex.replace("#",""); var n = parseInt(c,16);
    var r = Math.max(0,(n>>16)-28), g = Math.max(0,((n>>8)&255)-28), b = Math.max(0,(n&255)-28);
    return "#" + (1<<24 | r<<16 | g<<8 | b).toString(16).slice(1);
  }

  /* ---------------------------- LISTADO ---------------------------- */
  function firstImg(html){ var m=/<img[^>]+src="([^"]+)"/i.exec(html||""); return m?m[1]:""; }
  function materiaOf(cats){
    if(!cats) return "";
    for(var i=0;i<cats.length;i++){ if(MATERIAS.indexOf(cats[i].term)>-1) return cats[i].term; }
    return "";
  }
  function renderListing(nivel, grado, materia){
    var labels=[nivel,grado]; if(materia) labels.push(materia);
    var url = BLOG + "/feeds/posts/default/-/" + labels.map(encodeURIComponent).join("/") + "?alt=json&max-results=150";

    var bc = '<p class="rd-bc"><a href="' + go("") + '">← Inicio</a> &nbsp;›&nbsp; ' + esc(nivel) + ' &nbsp;›&nbsp; ' + esc(grado) + '</p>';
    var chips = '<div class="rd-chips"><a class="rd-chip' + (materia?"":" on") + '" href="' +
                go("n="+encodeURIComponent(nivel)+"&g="+encodeURIComponent(grado)) + '">Todas</a>';
    MATERIAS.forEach(function(mt){
      chips += '<a class="rd-chip' + (materia===mt?" on":"") + '" href="' +
        go("n="+encodeURIComponent(nivel)+"&g="+encodeURIComponent(grado)+"&m="+encodeURIComponent(mt)) + '">' + mt + '</a>';
    });
    chips += '</div>';
    APP.innerHTML = '<h2 class="rd-secTitle">' + esc(grado) + ' · ' + esc(nivel) + '</h2>' + bc + chips + '<div id="rd-list">Cargando fichas…</div>';

    fetch(url).then(function(r){return r.json();}).then(function(d){
      var entries=(d.feed&&d.feed.entry)||[];
      if(!entries.length){
        document.getElementById("rd-list").innerHTML='<div class="rd-empty">Aún no hay fichas en esta sección. ¡Pronto agregaremos más!</div>';
        return;
      }
      var html='<div class="rd-res">';
      entries.forEach(function(e){
        var title=e.title.$t, link="#";
        (e.link||[]).forEach(function(l){ if(l.rel==="alternate") link=l.href; });
        var mt=materiaOf(e.category);
        var img=firstImg(e.content?e.content.$t:(e.summary?e.summary.$t:""));
        var thumb=img
          ? '<div class="rd-thumb" style="background-image:url(\''+img+'\')"></div>'
          : '<div class="rd-thumb" style="background:'+(MCOLOR[mt]||"#64748b")+'">'+esc(mt||"Ficha")+'</div>';
        html += '<a class="rd-item" href="'+link+'">'+thumb+'<div class="b"><p class="t">'+esc(title)+'</p>'+
                (mt?'<span class="rd-tag">'+esc(mt)+'</span>':'')+'</div></a>';
      });
      html+='</div>';
      document.getElementById("rd-list").innerHTML=html;
    }).catch(function(){
      document.getElementById("rd-list").innerHTML='<div class="rd-empty">No se pudieron cargar las fichas. Recarga la página.</div>';
    });
  }

  function route(){
    var n=par("n"), g=par("g"), m=par("m");
    if(n && g) renderListing(n,g,m); else renderLanding();
  }

  /* ---- arranque: crea/halla contenedor (oculta feed en la home) ---- */
  function start(){
    APP = document.getElementById("rd-app");
    if(!APP && IS_HOME){
      var bp = document.querySelector(".blog-posts");
      var host = document.querySelector("#Blog1") || (bp ? bp.parentNode : null);
      if(!host) return false;
      document.documentElement.classList.add("rd-home");
      APP = document.createElement("div"); APP.id = "rd-app";
      host.insertBefore(APP, host.firstChild);
    }
    if(!APP) return false;
    injectCSS(); route();
    return true;
  }

  injectCSS();
  buildMenu();
  if(!start()){ var t=0, iv=setInterval(function(){ t++; if(start()||t>25) clearInterval(iv); }, 150); }
})();
