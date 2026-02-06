// FILE: js/diccionario-controller.js | VERSION: v11.0.0
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const grado = urlParams.get('grado');
  const periodo = parseInt(urlParams.get('periodo'));
  const areaNombre = urlParams.get('area') || "Proyecto Socioemocional";

  if (!grado || isNaN(periodo)) {
    alert('Información incompleta.');
    window.close();
    return;
  }

  const headerInfo = document.getElementById('dic-header-info');
  const dicMenu = document.getElementById('dic-menu');
  const dicContentDisplay = document.getElementById('dic-content-display');
  const btnCerrar = document.getElementById('btn-cerrar-dic');
  const btnImprimir = document.getElementById('btn-imprimir-dic');
  const btnTop = document.getElementById('btn-top-dic');

  let diccionarioData = null;
  let talleresData = null;
  let conceptosColores = {};

  const coloresConceptos = [
    '#F39325', '#D94D15', '#54BBAB', '#521537', '#9B7BB6', '#878721', '#11678B'
  ];
  let colorIndex = 0;

  function getConceptoColor(concepto) {
    const key = concepto.toLowerCase().trim();
    if (!conceptosColores[key]) {
      conceptosColores[key] = coloresConceptos[colorIndex % coloresConceptos.length];
      colorIndex++;
    }
    return conceptosColores[key];
  }

  async function cargarDatos() {
    try {
      const [resDic, resTal] = await Promise.all([
        fetch(`data/diccionario/${grado}_diccionario.json?v=${Date.now()}`),
        fetch(`data/diccionario/${grado}_talleres.json?v=${Date.now()}`)
      ]);
      if (resDic.ok) diccionarioData = await resDic.json();
      if (resTal.ok) talleresData = await resTal.json();
    } catch (e) { console.error("Error cargando datos", e); }
  }

  function renderizarDiccionario() {
    if (!diccionarioData) return;
    const conceptos = diccionarioData[`periodo_${periodo}`] || [];
    
    let html = `
      <div class="dic-header-section">
        <strong>🎯 ESTÁNDAR DEL PERIODO:</strong>
        <p style="font-size:1.5rem; font-weight:700;">Identifico emociones básicas en momentos escolares cotidianos.</p>
        <p>EJE: Reconozco lo que siento | COMPETENCIA: Autonomía emocional</p>
      </div>
      <div class="dic-grid-container">
    `;

    conceptos.forEach(c => {
      const color = getConceptoColor(c.concepto);
      html += `
        <div class="dic-concepto-card" style="--concepto-color: ${color};">
          <h3>${c.concepto}</h3>
          <div class="dic-field"><strong>🧠 Definición Pedagógica:</strong> <p>${c.definicion_pedagogica}</p></div>
          <div class="dic-field"><strong>🎓 Habilidad Técnica:</strong> <p>${c.habilidad_malla}</p></div>
          <div class="dic-field"><strong>🔍 ¿Qué observar? (Evidencia):</strong> <p>${c.evidencia_logro}</p></div>
          <div class="dic-tip">💡 <strong>Tip para el Profe:</strong> ${c.tip_psicologico}</div>
        </div>
      `;
    });
    html += `</div>`;
    dicContentDisplay.innerHTML = html;
  }

  function renderizarTaller(idx) {
    if (!talleresData) return;
    const t = talleresData.periodos.find(p => p.numero_periodo === periodo)?.talleres[idx-1];
    if (!t) { dicContentDisplay.innerHTML = "Taller no disponible."; return; }

    dicContentDisplay.innerHTML = `
      <div class="taller-card">
        <h2 style="font-size: 2.8rem; color: #17334B; margin-bottom: 1.5rem;">TALLER ${idx}: ${t.nombre_taller}</h2>
        
        <div class="taller-section-block">
          <div class="taller-section-header">🏷️ CONCEPTOS VINCULADOS</div>
          <div>${t.conceptos_relacionados.map(c => `<span class="badge-concepto">${c}</span>`).join('')}</div>
        </div>

        <div class="taller-section-block">
          <div class="taller-section-header">🎯 PROPÓSITO</div>
          <p style="font-size:1.3rem;">${t.proposito_experiencia}</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="taller-section-block"><div class="taller-section-header">⚡ INICIO</div><p>${t.momento_inicio_conexion}</p></div>
          <div class="taller-section-block"><div class="taller-section-header">✨ DESARROLLO</div><p>${t.momento_desarrollo_vivencia}</p></div>
        </div>

        <div class="taller-section-block"><div class="taller-section-header">✅ CIERRE</div><p>${t.momento_cierre_integracion}</p></div>

        <div class="taller-section-block" style="background: #fff9e6; border-left: 6px solid #f39325;">
          <div class="taller-section-header">⏱️ RECURSOS Y TIEMPO</div>
          <p><strong>Recursos:</strong> ${t.recursos_eco} | <strong>Tiempo:</strong> ${t.tiempo_application || t.tiempo_aplicacion}</p>
        </div>
      </div>
    `;
  }

  async function init() {
    const gradoTxt = grado === "-1" ? "JARDÍN" : (grado === "0" ? "TRANSICIÓN" : `GRADO ${grado}°`);
    headerInfo.textContent = `GRADO: ${gradoTxt} | PERIODO: ${periodo}`;
    await cargarDatos();
    renderizarDiccionario();

    dicMenu.onclick = (e) => {
      const btn = e.target.closest('.dic-menu-item');
      if (!btn) return;
      document.querySelectorAll('.dic-menu-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const content = btn.dataset.content;
      if (content === 'diccionario') renderizarDiccionario();
      else renderizarTaller(parseInt(content.split('-')[1]));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    btnCerrar.onclick = () => window.close();
    btnImprimir.onclick = () => {
      const f = new Date();
      document.getElementById('print-fecha-txt-dic').innerHTML = `<strong>ÁREA:</strong> ${areaNombre} | <strong>GRADO:</strong> ${gradoTxt} | <strong>PERIODO:</strong> ${periodo}° <br> <strong>CONSULTA:</strong> ${f.toLocaleDateString()} ${f.toLocaleTimeString()}`;
      setTimeout(() => window.print(), 500);
    };
    window.onscroll = () => btnTop.style.display = window.scrollY > 400 ? 'block' : 'none';
    btnTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  init();
});
