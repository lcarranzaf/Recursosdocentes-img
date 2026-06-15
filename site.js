/* ===========================================================================
   RecursoDocentes — site.js  (fachada completa para Blogger / Contempo)
   Réplica del diseño de Vercel: header claro, hero, niveles, materias,
   cómo funciona, países y footer oscuro. Menú + portada + catálogo + footer.

   Se carga desde el tema con UNA sola línea antes de </body>:
     <script src="https://cdn.jsdelivr.net/gh/lcarranzaf/Recursosdocentes-img@main/site.js" defer></script>
   Cualquier cambio de diseño se hace aquí -> git push -> purgar jsDelivr:
     https://purge.jsdelivr.net/gh/lcarranzaf/Recursosdocentes-img@main/site.js
   =========================================================================== */
(function () {
  "use strict";

  /* ---- CONFIG: grados con contenido (agrega aquí al crecer) ---- */
  var TAX = {
    "Primaria":   ["1° grado", "2° grado", "3° grado", "4° grado", "5° grado"],
    "Secundaria": ["1° grado"]
  };
  var MATERIAS = [
    { name: "Matemáticas", glyph: "M", color: "#2563eb", surface: "#eff6ff", border: "#bfdbfe", desc: "Cálculo, geometría, problemas" },
    { name: "Lengua",      glyph: "L", color: "#16a34a", surface: "#f0fdf4", border: "#bbf7d0", desc: "Comprensión, gramática, escritura" },
    { name: "Inglés",      glyph: "E", color: "#7c3aed", surface: "#f5f3ff", border: "#ddd6fe", desc: "Vocabulario y gramática" },
    { name: "Ciencias",    glyph: "C", color: "#0d9488", surface: "#f0fdfa", border: "#99f6e4", desc: "Naturales y sociales" },
    { name: "Historia",    glyph: "H", color: "#d97706", surface: "#fffbeb", border: "#fde68a", desc: "Historia y geografía" }
  ];
  var MNAMES = MATERIAS.map(function (m) { return m.name; });
  var MCOLOR = {}; MATERIAS.forEach(function (m) { MCOLOR[m.name] = m.color; });

  var PASOS = [
    { n: 1, t: "Elegí nivel y grado", d: "De 1° de primaria a secundaria. Matemáticas, Lengua, Ciencias, Inglés e Historia." },
    { n: 2, t: "Abrí el recurso que necesitás", d: "Fichas de ejercicios, lecturas, evaluaciones y actividades imprimibles." },
    { n: 3, t: "Descargá o imprimí el PDF", d: "Vista previa del contenido y descarga lista para el aula. Sin marca de agua, sin registro." }
  ];
  var PAISES = ["Ecuador", "México", "España", "Colombia", "Argentina"];

  var BLOG = location.origin;
  var PAGE = location.pathname;
  var IS_HOME = (PAGE === "/" || PAGE === "");
  var APP = null;

  function par(k) { return new URLSearchParams(location.search).get(k) || ""; }
  function esc(s) { return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function gradeLink(n, g) { return "/?n=" + encodeURIComponent(n) + "&g=" + encodeURIComponent(g); }
  function materiaLink(m) { return "/?m=" + encodeURIComponent(m); }

  /* ============================== CSS ============================== */
  function injectCSS() {
    if (document.getElementById("rd-css")) return;
    var css = [
      /* --- matar el tema Contempo (fondo atardecer + header/título) --- */
      "html,body,.body-fauxcolumn-outer{background:#fafaf7 !important}",
      "body{background-image:none !important}",
      ".body-fauxcolumn-outer,.header-outer,.Header .titlewrapper,.header-widget{background:none !important;background-image:none !important}",
      /* el atardecer de Contempo = .bg-photo (no es background del body) */
      ".bg-photo,.bg-photo-overlay,.bg-photo-container{display:none !important;background:none !important;background-image:none !important}",
      "#header,header#header,.header-outer,.Header,.header-widget,.cover-image,.page_body .centered-top-container{display:none !important}",
      ".rd-home .blog-posts,.rd-home .blog-pager,.rd-home .post-feeds,.rd-home .no-posts-message,.rd-home .FeaturedPost{display:none !important}",
      /* ocultar barra lateral de Contempo (Archivo / Etiquetas / Denunciar abuso) y ensanchar contenido */
      ".sidebar-container,.column-left-outer,.column-right-outer,.widget.BlogArchive,.widget.Label,.widget.ReportAbuse,#ReportAbuse1,.Attribution{display:none !important}",
      ".main-column,.column-center-outer,.centered-bottom .main-column-wrapper{width:100% !important;max-width:100% !important;float:none !important;margin:0 !important;padding:0 !important}",
      /* enlaces de Contempo no deben pintar de azul nuestras tarjetas */
      "#rd-app a,#rd-foot a,#rd-menu a{text-decoration:none}",

      /* --------------------------- MENÚ --------------------------- */
      "#rd-menu{position:sticky;top:0;z-index:99999;background:rgba(255,255,255,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid #e5e7eb;display:flex;flex-wrap:wrap;align-items:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}",
      "#rd-menu .rd-brand{color:#0f172a !important;font-weight:800;padding:14px 18px;font-size:18px;letter-spacing:-.2px}",
      "#rd-menu .rd-brand b{color:#2563eb}",
      "#rd-menu .rd-spacer{flex:1}",
      "#rd-menu .rd-mi{position:relative}",
      "#rd-menu .rd-mi>a,#rd-menu .rd-mi>button{display:block;padding:10px 14px;margin:7px 2px;border-radius:9px;color:#374151 !important;background:none;border:0;font:inherit;font-weight:600;font-size:14.5px;cursor:pointer}",
      "#rd-menu .rd-mi.has>button::after{content:'\\25BE';font-size:10px;margin-left:6px;opacity:.55}",
      "#rd-menu .rd-mi:hover>a,#rd-menu .rd-mi:hover>button,#rd-menu .rd-mi.open>button{background:rgba(0,0,0,.05)}",
      "#rd-menu .rd-cta{background:#2563eb !important;color:#fff !important;margin:7px 14px 7px 4px;padding:10px 16px}",
      "#rd-menu .rd-cta:hover{background:#1d4ed8 !important}",
      "#rd-menu .rd-sub{position:absolute;left:0;top:100%;min-width:210px;background:#fff;border:1px solid #eef0f3;border-radius:12px;box-shadow:0 14px 34px rgba(0,0,0,.14);display:none;overflow:hidden;padding:6px}",
      "#rd-menu .rd-mi:hover .rd-sub,#rd-menu .rd-mi.open .rd-sub{display:block}",
      "#rd-menu .rd-sub a{display:block;padding:10px 12px;border-radius:8px;color:#1f2937 !important;font-weight:500;font-size:14px}",
      "#rd-menu .rd-sub a:hover{background:#eff6ff;color:#1d4ed8 !important}",
      "@media (max-width:760px){#rd-menu{padding-bottom:4px}#rd-menu .rd-spacer{flex-basis:100%}#rd-menu .rd-sub{position:static;box-shadow:none;border:0;min-width:100%;padding:0 0 6px 10px}}",

      /* ------------------------ CONTENEDOR ------------------------ */
      "#rd-app{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1f2937;max-width:1120px;margin:0 auto;padding:26px 18px 50px}",
      "#rd-app *{box-sizing:border-box}",

      /* ---------------------------- HERO -------------------------- */
      ".rd-hero{display:grid;grid-template-columns:1.1fr .9fr;gap:40px;align-items:center;padding:34px 0 18px}",
      ".rd-kick{font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#2563eb;margin:0 0 14px}",
      ".rd-hero h1{font-size:clamp(30px,4.4vw,50px);line-height:1.06;letter-spacing:-.02em;font-weight:800;color:#0f172a;margin:0 0 18px}",
      ".rd-hero h1 .b{color:#2563eb}.rd-hero h1 .g{color:#16a34a}.rd-hero h1 .m{color:#94a3b8;font-weight:700}",
      ".rd-hero p.lead{font-size:18px;line-height:1.6;color:#475569;max-width:520px;margin:0 0 26px}",
      ".rd-actions{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:22px}",
      ".rd-btn{display:inline-flex;align-items:center;gap:8px;padding:13px 22px;border-radius:13px;font-weight:700;font-size:15px;border:1px solid transparent}",
      ".rd-btn.primary{background:#2563eb;color:#fff !important;box-shadow:0 8px 20px -6px rgba(37,99,235,.45)}",
      ".rd-btn.primary:hover{background:#1d4ed8}",
      ".rd-btn.ghost{background:#fff;color:#1f2937 !important;border-color:#d1d5db}",
      ".rd-btn.ghost:hover{border-color:#9ca3af}",
      ".rd-stats{display:flex;flex-wrap:wrap;gap:8px 18px;font-size:14px;color:#64748b}",
      ".rd-stats b{color:#0f172a}",
      /* hero visual (mock de ficha) */
      ".rd-mock{position:relative;background:#fff;border:1px solid #e8ebef;border-radius:22px;padding:18px;box-shadow:0 24px 60px -24px rgba(15,23,42,.30);transform:rotate(-1.4deg)}",
      ".rd-mock .bar{height:9px;width:46%;background:#e2e8f0;border-radius:6px;margin:0 0 14px}",
      ".rd-mock .pg{background:#f8fafc;border:1px solid #eef2f6;border-radius:12px;padding:16px}",
      ".rd-mock .pg .ttl{height:13px;width:62%;background:#cbd5e1;border-radius:6px;margin-bottom:14px}",
      ".rd-mock .pg .ln{height:8px;background:#e7edf3;border-radius:5px;margin-bottom:10px}",
      ".rd-mock .pg .ln.s{width:88%}.rd-mock .pg .ln.m{width:70%}.rd-mock .pg .ln.l{width:95%}",
      ".rd-mock .pg .row{display:flex;gap:8px;margin-top:16px}",
      ".rd-mock .pg .row span{flex:1;height:34px;border-radius:8px}",
      ".rd-mock .badge{position:absolute;top:-14px;right:18px;background:#16a34a;color:#fff;font-size:12px;font-weight:800;padding:7px 13px;border-radius:999px;box-shadow:0 8px 18px -6px rgba(22,163,74,.6)}",

      /* -------------------------- SECCIÓN ------------------------- */
      ".rd-sec{padding:34px 0}",
      ".rd-sec .sk{font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#94a3b8;margin:0 0 8px}",
      ".rd-sec .sh{font-size:26px;line-height:1.15;font-weight:800;color:#0f172a;letter-spacing:-.01em;margin:0 0 22px}",

      /* NIVELES */
      ".rd-levels{display:grid;grid-template-columns:1fr 1fr;gap:20px}",
      ".rd-lv{position:relative;display:block;border-radius:24px;padding:30px;border:1px solid;overflow:hidden;transition:box-shadow .18s,transform .18s}",
      ".rd-lv:hover{box-shadow:0 16px 38px -16px rgba(15,23,42,.28);transform:translateY(-3px)}",
      ".rd-lv .big{position:absolute;right:-8px;top:-26px;font-size:150px;font-weight:900;line-height:1;letter-spacing:-.06em;color:#fff;opacity:.55;pointer-events:none}",
      ".rd-lv .head{display:block;position:relative}",
      ".rd-lv .k{position:relative;font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;margin:0 0 6px}",
      ".rd-lv h3{position:relative;font-size:32px;font-weight:800;margin:0 0 6px;letter-spacing:-.01em}",
      ".rd-lv .sub{position:relative;font-size:15px;opacity:.8;margin:0 0 18px}",
      ".rd-lv .chips{position:relative;display:flex;flex-wrap:wrap;gap:8px;margin:0 0 20px}",
      ".rd-lv .chips a{font-size:13px;font-weight:700;padding:6px 13px;border-radius:999px;background:#fff;border:1px solid}",
      ".rd-lv .more{position:relative;display:inline-flex;align-items:center;gap:7px;font-weight:700;font-size:14px}",
      ".rd-lv.pri{background:#eff6ff;border-color:#bfdbfe}.rd-lv.pri .k,.rd-lv.pri h3,.rd-lv.pri .more{color:#1e3a8a !important}.rd-lv.pri .sub{color:#1e40af}.rd-lv.pri .chips a{color:#1e3a8a !important;border-color:#bfdbfe}",
      ".rd-lv.sec{background:#f0fdf4;border-color:#bbf7d0}.rd-lv.sec .k,.rd-lv.sec h3,.rd-lv.sec .more{color:#14532d !important}.rd-lv.sec .sub{color:#166534}.rd-lv.sec .chips a{color:#14532d !important;border-color:#bbf7d0}",

      /* MATERIAS */
      ".rd-mats{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px}",
      ".rd-mat{display:flex;align-items:flex-start;gap:14px;padding:18px;border-radius:18px;border:1px solid #eceff3;background:#fff;transition:box-shadow .16s,transform .16s}",
      ".rd-mat:hover{box-shadow:0 12px 28px -14px rgba(15,23,42,.25);transform:translateY(-2px)}",
      ".rd-mat .gl{flex:none;width:46px;height:46px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;border:1px solid}",
      ".rd-mat h4{margin:2px 0 3px;font-size:16px;font-weight:700;color:#0f172a}",
      ".rd-mat p{margin:0;font-size:13.5px;color:#64748b;line-height:1.4}",

      /* CÓMO FUNCIONA */
      ".rd-steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px}",
      ".rd-step{background:#fff;border:1px solid #e8ebef;border-radius:18px;padding:22px}",
      ".rd-step .num{width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-weight:800;background:#eff6ff;color:#1e3a8a;border:1px solid #bfdbfe;margin-bottom:16px}",
      ".rd-step h4{margin:0 0 7px;font-size:17px;font-weight:700;color:#0f172a}",
      ".rd-step p{margin:0;font-size:14px;color:#64748b;line-height:1.55}",

      /* CTA OSCURO */
      ".rd-ctad{position:relative;overflow:hidden;background:#111827;border-radius:24px;padding:42px 30px;color:#fff;margin-top:10px}",
      ".rd-ctad h3{font-size:28px;font-weight:800;letter-spacing:-.01em;margin:0 0 12px;max-width:560px}",
      ".rd-ctad p{font-size:15px;color:#9ca3af;line-height:1.6;max-width:520px;margin:0 0 24px}",
      ".rd-ctad .rd-btn{background:#fff;color:#111827 !important}",

      /* PAÍSES */
      ".rd-countries{text-align:center;padding:38px 0 8px}",
      ".rd-countries .sk{font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#94a3b8;margin:0 0 16px}",
      ".rd-countries .row{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}",
      ".rd-countries .row span{padding:7px 16px;background:#fff;border:1px solid #e5e7eb;border-radius:999px;font-size:14px;font-weight:600;color:#475569}",

      /* ------------------------- LISTADO -------------------------- */
      ".rd-bc{margin:6px 0 18px;font-size:14px;color:#64748b}.rd-bc a{color:#2563eb !important;font-weight:700}",
      ".rd-chips{display:flex;flex-wrap:wrap;gap:9px;margin:0 0 24px}",
      ".rd-chip{font-size:13.5px;padding:8px 16px;border-radius:999px;border:1px solid #d6dce4;color:#334155 !important;font-weight:600;background:#fff}",
      ".rd-chip:hover{border-color:#94a3b8}",
      ".rd-chip.on{background:#2563eb;color:#fff !important;border-color:#2563eb}",
      ".rd-res{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:20px}",
      ".rd-item{display:block;color:#1f2937 !important;border:1px solid #e8ebef;border-radius:18px;overflow:hidden;background:#fff;transition:box-shadow .16s,transform .16s}",
      ".rd-item:hover{box-shadow:0 14px 30px -14px rgba(15,23,42,.28);transform:translateY(-3px)}",
      ".rd-thumb{height:150px;background:#f1f5f9 center/cover no-repeat;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:15px;text-align:center;padding:12px}",
      ".rd-item .b{padding:13px 15px 16px}",
      ".rd-item .t{font-weight:700;font-size:15px;line-height:1.35;margin:0 0 9px;color:#0f172a}",
      ".rd-tag{display:inline-block;font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;background:#eff6ff;color:#1e3a8a !important}",
      ".rd-empty{padding:28px;background:#fff7ed;border:1px solid #fed7aa;border-radius:16px;color:#9a3412}",
      ".rd-loading{padding:40px;text-align:center;color:#94a3b8;font-weight:600}",

      /* -------------------------- FOOTER -------------------------- */
      "#rd-foot{background:#111827;color:#cbd5e1;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;margin-top:40px}",
      "#rd-foot .in{max-width:1120px;margin:0 auto;padding:48px 18px 28px}",
      "#rd-foot .cols{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:32px}",
      "#rd-foot h5{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#fff;margin:0 0 16px}",
      "#rd-foot .brand{font-size:19px;font-weight:800;color:#fff !important;display:inline-block;margin-bottom:12px}",
      "#rd-foot .brand b{color:#f97316}",
      "#rd-foot .desc{font-size:14px;color:#94a3b8;line-height:1.6;max-width:280px;margin:0}",
      "#rd-foot ul{list-style:none;margin:0;padding:0}",
      "#rd-foot li{margin:0 0 10px}",
      "#rd-foot li a{font-size:14px;color:#94a3b8 !important;font-weight:500}",
      "#rd-foot li a:hover{color:#fff !important}",
      "#rd-foot .bottom{border-top:1px solid #374151;margin-top:36px;padding-top:22px;display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;font-size:13px;color:#64748b}",
      "#rd-foot .bottom a{color:#94a3b8 !important}",

      /* RESPONSIVE */
      "@media (max-width:880px){.rd-hero{grid-template-columns:1fr;gap:18px}.rd-mock{display:none}.rd-levels{grid-template-columns:1fr}#rd-foot .cols{grid-template-columns:1fr 1fr}}",
      "@media (max-width:640px){" +
        "#rd-app{padding:18px 14px 40px}" +
        ".rd-hero{padding:18px 0 4px}.rd-hero h1{font-size:30px}.rd-hero p.lead{font-size:16px}" +
        ".rd-actions{gap:10px}.rd-actions .rd-btn{flex:1 1 auto;justify-content:center;padding:13px 16px}" +
        ".rd-sec{padding:24px 0}.rd-sec .sh{font-size:22px}" +
        ".rd-ctad{padding:30px 22px}.rd-ctad h3{font-size:23px}" +
        ".rd-lv{padding:24px}.rd-lv h3{font-size:27px}.rd-lv .big{font-size:120px;top:-16px}" +
        ".rd-res{grid-template-columns:1fr 1fr;gap:13px}.rd-thumb{height:118px}.rd-item .t{font-size:13.5px}.rd-item .b{padding:11px 12px 13px}" +
        ".rd-mats{grid-template-columns:1fr}" +
      "}",
      "@media (max-width:520px){#rd-foot .cols{grid-template-columns:1fr}}",
      "@media (max-width:380px){.rd-res{grid-template-columns:1fr}.rd-thumb{height:150px}}"
    ].join("");
    var st = document.createElement("style");
    st.id = "rd-css";
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ============================== MENÚ ============================== */
  function buildMenu() {
    if (document.getElementById("rd-menu")) return;
    var html = '<a class="rd-brand" href="/">Recurso<b>Docentes</b></a>' +
               '<div class="rd-mi"><a href="/">Inicio</a></div>';
    Object.keys(TAX).forEach(function (nivel) {
      html += '<div class="rd-mi has"><button type="button">' + nivel + '</button><div class="rd-sub">';
      TAX[nivel].forEach(function (g) {
        var num = g.split("°")[0];
        html += '<a href="' + gradeLink(nivel, g) + '">' + num + '° de ' + nivel + '</a>';
      });
      html += '</div></div>';
    });
    html += '<span class="rd-spacer"></span>';
    html += '<a class="rd-mi rd-cta" href="' + gradeLink("Primaria", "1° grado") + '">Explorar recursos</a>';

    var bar = document.createElement("nav");
    bar.id = "rd-menu";
    bar.innerHTML = html;
    document.body.insertBefore(bar, document.body.firstChild);

    bar.addEventListener("click", function (e) {
      var btn = e.target.closest("button"); if (!btn) return;
      var mi = btn.parentNode, was = mi.classList.contains("open");
      bar.querySelectorAll(".rd-mi.open").forEach(function (x) { x.classList.remove("open"); });
      if (!was) mi.classList.add("open");
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest("#rd-menu")) bar.querySelectorAll(".rd-mi.open").forEach(function (x) { x.classList.remove("open"); });
    });
  }

  /* ============================== FOOTER ============================== */
  function buildFooter() {
    if (document.getElementById("rd-foot")) return;
    var recursos = '<li><a href="/">Inicio</a></li>' +
                   '<li><a href="' + gradeLink("Primaria", "1° grado") + '">Recursos de Primaria</a></li>' +
                   '<li><a href="' + gradeLink("Secundaria", "1° grado") + '">Recursos de Secundaria</a></li>';
    var materias = MNAMES.map(function (m) {
      return '<li><a href="' + materiaLink(m) + '">' + m + '</a></li>';
    }).join("");
    var year = new Date().getFullYear();

    var f = document.createElement("footer");
    f.id = "rd-foot";
    f.innerHTML =
      '<div class="in"><div class="cols">' +
        '<div><a class="brand" href="/">Recurso<b>Docentes</b></a>' +
          '<p class="desc">Recursos educativos gratuitos para docentes de primaria y secundaria en Ecuador, México, España, Colombia y Argentina.</p></div>' +
        '<div><h5>Recursos</h5><ul>' + recursos + '</ul></div>' +
        '<div><h5>Materias</h5><ul>' + materias + '</ul></div>' +
        '<div><h5>Información</h5><ul>' +
          '<li><a href="/p/sobre-nosotros.html">Sobre nosotros</a></li>' +
          '<li><a href="/p/contacto.html">Contacto</a></li>' +
          '<li><a href="/p/aviso-legal.html">Aviso legal</a></li>' +
          '<li><a href="/p/politica-de-privacidad.html">Política de privacidad</a></li>' +
        '</ul></div>' +
      '</div>' +
      '<div class="bottom"><span>© ' + year + ' RecursoDocentes. Todos los derechos reservados.</span>' +
        '<span>Contacto: <a href="mailto:recursodocentes@gmail.com">recursodocentes@gmail.com</a></span></div>' +
      '</div>';
    document.body.appendChild(f);
  }

  /* ============================== PORTADA ============================== */
  function renderLanding() {
    var totalGrados = 0; Object.keys(TAX).forEach(function (n) { totalGrados += TAX[n].length; });

    var h = "";

    /* HERO */
    h += '<section class="rd-hero">' +
           '<div>' +
             '<p class="rd-kick">RecursoDocentes · Recursos para docentes</p>' +
             '<h1>Material para el aula, <span class="b">listo</span> <span class="m">para</span> <span class="g">descargar</span>.</h1>' +
             '<p class="lead">Fichas, ejercicios, evaluaciones y guías docentes adaptadas al grado que enseñás. Primaria y Secundaria — en español — sin registro, sin pagar.</p>' +
             '<div class="rd-actions">' +
               '<a class="rd-btn primary" href="' + gradeLink("Primaria", "1° grado") + '">Explorar recursos →</a>' +
               '<a class="rd-btn ghost" href="#rd-niveles">Ver por nivel</a>' +
             '</div>' +
             '<div class="rd-stats"><span><b>' + totalGrados + '</b> grados con material</span><span>·</span>' +
               '<span><b>5</b> materias</span><span>·</span><span>100% gratuito</span><span>·</span><span>Sin registro</span></div>' +
           '</div>' +
           '<div><div class="rd-mock"><span class="badge">PDF listo</span>' +
             '<div class="bar"></div>' +
             '<div class="pg"><div class="ttl"></div>' +
               '<div class="ln l"></div><div class="ln s"></div><div class="ln m"></div><div class="ln l"></div><div class="ln s"></div>' +
               '<div class="row"><span style="background:#dbeafe"></span><span style="background:#dcfce7"></span><span style="background:#fef3c7"></span></div>' +
             '</div>' +
           '</div></div>' +
         '</section>';

    /* NIVELES */
    h += '<section class="rd-sec" id="rd-niveles"><p class="sk">Niveles</p><h2 class="sh">¿Dónde enseñás?</h2><div class="rd-levels">';
    h += levelCard("Primaria", "pri", "De 1° a 6° grado · 6 a 12 años", TAX["Primaria"]);
    h += levelCard("Secundaria", "sec", "Educación secundaria · adolescentes", TAX["Secundaria"]);
    h += '</div></section>';

    /* MATERIAS */
    h += '<section class="rd-sec"><p class="sk">Materias</p><h2 class="sh">Cinco áreas del currículo</h2><div class="rd-mats">';
    MATERIAS.forEach(function (m) {
      h += '<a class="rd-mat" href="' + materiaLink(m.name) + '">' +
             '<span class="gl" style="background:' + m.surface + ';color:' + m.color + ';border-color:' + m.border + '">' + m.glyph + '</span>' +
             '<span><h4>' + m.name + '</h4><p>' + m.desc + '</p></span></a>';
    });
    h += '</div></section>';

    /* CÓMO FUNCIONA */
    h += '<section class="rd-sec"><p class="sk">Cómo funciona</p><h2 class="sh">Tres pasos. Sin cuenta. Sin pagar.</h2><div class="rd-steps">';
    PASOS.forEach(function (p) {
      h += '<div class="rd-step"><div class="num">' + p.n + '</div><h4>' + p.t + '</h4><p>' + p.d + '</p></div>';
    });
    h += '</div></section>';

    /* CTA OSCURO */
    h += '<section class="rd-sec"><div class="rd-ctad">' +
           '<h3>Empezá a usar recursos para tu próxima clase.</h3>' +
           '<p>Sin registro, sin paywall, sin marca de agua. Pensado para docentes de Primaria y Secundaria en toda Latinoamérica.</p>' +
           '<a class="rd-btn" href="' + gradeLink("Primaria", "1° grado") + '">Explorar recursos gratis →</a>' +
         '</div></section>';

    /* PAÍSES */
    h += '<section class="rd-countries"><p class="sk">Adaptado al currículo de</p><div class="row">';
    PAISES.forEach(function (p) { h += '<span>' + p + '</span>'; });
    h += '</div></section>';

    APP.innerHTML = h;
  }

  function levelCard(nivel, cls, sub, grados) {
    var chips = grados.map(function (g) {
      return '<a href="' + gradeLink(nivel, g) + '">' + g.split("°")[0] + '°</a>';
    }).join("");
    // OJO: la tarjeta es un <div>, NO un <a> (no se pueden anidar enlaces dentro de enlaces).
    return '<div class="rd-lv ' + cls + '">' +
             '<span class="big">123</span>' +
             '<a class="head" href="' + gradeLink(nivel, grados[0]) + '">' +
               '<p class="k">Nivel</p><h3>' + nivel + '</h3><p class="sub">' + sub + '</p></a>' +
             '<div class="chips">' + chips + '</div>' +
             '<a class="more" href="' + gradeLink(nivel, grados[0]) + '">Ver recursos del nivel →</a>' +
           '</div>';
  }

  /* ============================== LISTADO ============================== */
  function firstImg(html) { var m = /<img[^>]+src="([^"]+)"/i.exec(html || ""); return m ? m[1] : ""; }
  function materiaOf(cats) {
    if (!cats) return "";
    for (var i = 0; i < cats.length; i++) { if (MNAMES.indexOf(cats[i].term) > -1) return cats[i].term; }
    return "";
  }
  function feedUrl(labels) {
    return BLOG + "/feeds/posts/default/-/" + labels.map(encodeURIComponent).join("/") + "?alt=json&max-results=150";
  }
  function drawItems(entries) {
    var html = '<div class="rd-res">';
    entries.forEach(function (e) {
      var title = e.title.$t, link = "#";
      (e.link || []).forEach(function (l) { if (l.rel === "alternate") link = l.href; });
      var mt = materiaOf(e.category);
      var img = firstImg(e.content ? e.content.$t : (e.summary ? e.summary.$t : ""));
      var thumb = img
        ? '<div class="rd-thumb" style="background-image:url(\'' + img + '\')"></div>'
        : '<div class="rd-thumb" style="background:' + (MCOLOR[mt] || "#64748b") + '">' + esc(mt || "Ficha") + '</div>';
      html += '<a class="rd-item" href="' + link + '">' + thumb + '<div class="b"><p class="t">' + esc(title) + '</p>' +
              (mt ? '<span class="rd-tag">' + esc(mt) + '</span>' : '') + '</div></a>';
    });
    return html + '</div>';
  }

  function renderListing(nivel, grado, materia) {
    var labels = [nivel, grado]; if (materia) labels.push(materia);
    var bc = '<p class="rd-bc"><a href="/">← Inicio</a> &nbsp;›&nbsp; ' + esc(nivel) + ' &nbsp;›&nbsp; ' + esc(grado) + '</p>';
    var chips = '<div class="rd-chips"><a class="rd-chip' + (materia ? "" : " on") + '" href="' +
                gradeLink(nivel, grado) + '">Todas</a>';
    MNAMES.forEach(function (mt) {
      chips += '<a class="rd-chip' + (materia === mt ? " on" : "") + '" href="' +
        gradeLink(nivel, grado) + "&m=" + encodeURIComponent(mt) + '">' + mt + '</a>';
    });
    chips += '</div>';
    APP.innerHTML = '<section class="rd-sec"><p class="sk">' + esc(nivel) + '</p><h2 class="sh">' + esc(grado) +
                    '</h2>' + bc + chips + '<div id="rd-list" class="rd-loading">Cargando fichas…</div></section>';

    fetch(feedUrl(labels)).then(function (r) { return r.json(); }).then(function (d) {
      var entries = (d.feed && d.feed.entry) || [];
      var box = document.getElementById("rd-list");
      box.className = "";
      box.innerHTML = entries.length
        ? drawItems(entries)
        : '<div class="rd-empty">Aún no hay fichas en esta sección. ¡Pronto agregaremos más!</div>';
    }).catch(function () {
      document.getElementById("rd-list").innerHTML = '<div class="rd-empty">No se pudieron cargar las fichas. Recargá la página.</div>';
    });
  }

  function renderMateria(materia) {
    var bc = '<p class="rd-bc"><a href="/">← Inicio</a> &nbsp;›&nbsp; Materia</p>';
    APP.innerHTML = '<section class="rd-sec"><p class="sk">Materia</p><h2 class="sh">' + esc(materia) +
                    '</h2>' + bc + '<div id="rd-list" class="rd-loading">Cargando fichas…</div></section>';
    fetch(feedUrl([materia])).then(function (r) { return r.json(); }).then(function (d) {
      var entries = (d.feed && d.feed.entry) || [];
      var box = document.getElementById("rd-list");
      box.className = "";
      box.innerHTML = entries.length
        ? drawItems(entries)
        : '<div class="rd-empty">Aún no hay fichas de ' + esc(materia) + '. ¡Pronto agregaremos más!</div>';
    }).catch(function () {
      document.getElementById("rd-list").innerHTML = '<div class="rd-empty">No se pudieron cargar las fichas. Recargá la página.</div>';
    });
  }

  function route() {
    var n = par("n"), g = par("g"), m = par("m");
    if (n && g) renderListing(n, g, m);
    else if (m) renderMateria(m);
    else renderLanding();
  }

  /* ---- arranque: crea/halla contenedor (oculta feed en la home) ---- */
  function start() {
    APP = document.getElementById("rd-app");
    if (!APP && IS_HOME) {
      var bp = document.querySelector(".blog-posts");
      var host = document.querySelector("#Blog1") || (bp ? bp.parentNode : null);
      if (!host) return false;
      document.documentElement.classList.add("rd-home");
      APP = document.createElement("div"); APP.id = "rd-app";
      host.insertBefore(APP, host.firstChild);
    }
    if (!APP) return false;
    injectCSS(); route();
    return true;
  }

  injectCSS();
  buildMenu();
  buildFooter();
  if (!start()) { var t = 0, iv = setInterval(function () { t++; if (start() || t > 25) clearInterval(iv); }, 150); }
})();
