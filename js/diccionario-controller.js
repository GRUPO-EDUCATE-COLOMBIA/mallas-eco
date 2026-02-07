// FILE: js/diccionario-controller.js | VERSION: v12.2.1 (Fix SVG Overflow)
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const grado = urlParams.get('grado');
    const periodo = parseInt(urlParams.get('periodo'));

    if (!grado || isNaN(periodo)) {
        alert('Faltan parámetros de consulta.');
        window.close();
        return;
    }

    const headerInfo = document.getElementById('dic-header-info');
    const dicMenu = document.getElementById('dic-menu');
    const dicContentDisplay = document.getElementById('dic-content-display');
    const btnCerrar = document.getElementById('btn-cerrar-dic');
    const btnImprimir = document.getElementById('btn-imprimir-dic');

    let diccionarioData = null;
    let socioData = null;
    let talleresData = null;

    // ICONOS CON DIMENSIONES FIJAS (PREVENCIÓN DE DESBORDE)
    const ICONS = {
        anual: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F39325" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
        periodo: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#11678B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
        estandar: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>`,
        eje: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#54BBAB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
    };

    const coloresConceptos = ['#F39325', '#11678B', '#54BBAB', '#9B7BB6', '#D94D15'];

    function validarCampo(valor) {
        if (!valor || valor === "" || (Array.isArray(valor) && valor.length === 0)) {
            return '<span style="color:#94a3b8; font-weight:400; font-style:italic;">Información en proceso de revisión...</span>';
        }
        return valor;
    }

    function triggerAnimation() {
        dicContentDisplay.classList.remove('animate-fade-in');
        void dicContentDisplay.offsetWidth;
        dicContentDisplay.classList.add('animate-fade-in');
    }

    async function cargarDatos() {
        try {
            const persistencia = sessionStorage.getItem('ECO_PERSISTENCIA_SOCIO');
            if (persistencia) {
                const pData = JSON.parse(persistencia);
                if (String(pData.grado) === String(grado)) socioData = pData.data;
            }

            const [resDic, resTal] = await Promise.all([
                fetch(`data/diccionario/${grado}_diccionario.json?v=${Date.now()}`),
                fetch(`data/diccionario/${grado}_talleres.json?v=${Date.now()}`)
            ]);

            if (resDic.ok) diccionarioData = await resDic.json();
            if (resTal.ok) talleresData = await resTal.json();
        } catch (e) { console.error("Error", e); }
    }

    function renderizarDiccionario() {
        if (!diccionarioData) return;
        triggerAnimation();
        const conceptos = diccionarioData[`periodo_${periodo}`] || [];
        const infoSocio = (socioData && socioData.periodos && socioData.periodos[periodo]) ? socioData.periodos[periodo][0] : null;

        let html = `
            <div class="dic-summary-header">
                <div class="summary-row">${ICONS.anual} <div class="summary-label">Competencia Anual:</div> <div class="summary-value">${validarCampo(infoSocio?.competencia_anual)}</div></div>
                <div class="summary-row">${ICONS.periodo} <div class="summary-label">Competencia del Periodo:</div> <div class="summary-value">${validarCampo(infoSocio?.competencia)}</div></div>
                <div class="summary-row">${ICONS.estandar} <div class="summary-label">Estándar del Periodo:</div> <div class="summary-value destacado">${validarCampo(infoSocio?.estandar)}</div></div>
                <div class="summary-row">${ICONS.eje} <div class="summary-label">Eje Central:</div> <div class="summary-value">${validarCampo(infoSocio?.eje_central)}</div></div>
            </div>
            <div class="dic-grid-container">
        `;

        conceptos.forEach((c, i) => {
            const color = coloresConceptos[i % coloresConceptos.length];
            html += `
                <div class="dic-concepto-card" style="--concepto-color: ${color}">
                    <h3>${c.concepto}</h3>
                    <div class="dic-field"><strong>DEFINICIÓN PEDAGÓGICA</strong><p>${validarCampo(c.definicion_pedagogica)}</p></div>
                    <div class="dic-field"><strong>DEFINICIÓN PARA EL ESTUDIANTE</strong><p>${validarCampo(c.definicion_estudiante)}</p></div>
                    <div class="dic-field"><strong>HABILIDAD TÉCNICA (EN MALLA)</strong><p>${validarCampo(c.habilidad_malla)}</p></div>
                    <div class="dic-field"><strong>EJEMPLO DE APLICACIÓN EN AULA</strong><p>${validarCampo(c.ejemplo_aula)}</p></div>
                    <div class="dic-field"><strong>¿QUÉ OBSERVAR? (EVIDENCIA DE LOGRO)</strong><p>${validarCampo(c.evidencia_logro)}</p></div>
                </div>
            `;
        });
        html += `</div>`;
        dicContentDisplay.innerHTML = html;
    }

    function renderizarTaller(idx) {
        if (!talleresData) return;
        triggerAnimation();
        const p = talleresData.periodos.find(per => per.numero_periodo === periodo);
        const t = p?.talleres[idx-1];
        if (!t) {
            dicContentDisplay.innerHTML = `<div style="padding:40px; text-align:center;"><h3>Taller no disponible.</h3></div>`;
            return;
        }
        dicContentDisplay.innerHTML = `
            <div class="taller-card">
                <h2>TALLER ${idx}: ${t.nombre_taller}</h2>
                <div class="taller-section-block">
                    <div style="font-weight:800; color:#11678B; margin-bottom:10px; font-size:1.1rem; border-bottom:1px solid #eee;">CONCEPTOS VINCULADOS</div>
                    <div style="display:flex; flex-wrap:wrap; gap:8px;">
                        ${t.conceptos_relacionados.map(c => `<span style="background:#1e293b; color:white; padding:5px 15px; border-radius:20px; font-weight:700;">${c}</span>`).join('')}
                    </div>
                </div>
                <div class="taller-section-block">
                    <div style="font-weight:800; color:#11678B; margin-bottom:5px; font-size:1.1rem;">🎯 PROPÓSITO DE LA EXPERIENCIA</div>
                    <p style="font-size:1.4rem; line-height:1.4; font-family:'Inter', sans-serif;">${validarCampo(t.proposito_experiencia)}</p>
                </div>
                <div class="taller-section-block"><strong>⚡ MOMENTO DE INICIO</strong><p style="font-family:'Inter', sans-serif;">${validarCampo(t.momento_inicio_conexion)}</p></div>
                <div class="taller-section-block"><strong>✨ MOMENTO DE DESARROLLO</strong><p style="font-family:'Inter', sans-serif;">${validarCampo(t.momento_desarrollo_vivencia)}</p></div>
                <div class="taller-section-block"><strong>✅ MOMENTO DE CIERRE</strong><p style="font-family:'Inter', sans-serif;">${validarCampo(t.momento_cierre_integracion)}</p></div>
            </div>
        `;
    }

    async function init() {
        const gTxt = (grado === "0") ? "TRANSICIÓN" : (grado === "-1" ? "JARDÍN" : `${grado}°`);
        headerInfo.textContent = `GRADO: ${gTxt} | PERIODO: ${periodo}`;
        await cargarDatos();
        renderizarDiccionario();
        dicMenu.onclick = (e) => {
            const btn = e.target.closest('.dic-menu-item');
            if (!btn || btn.classList.contains('active')) return;
            document.querySelectorAll('.dic-menu-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (btn.dataset.content === 'diccionario') renderizarDiccionario();
            else renderizarTaller(parseInt(btn.dataset.content.split('-')[1]));
            window.scrollTo({top: 0, behavior: 'smooth'});
        };
        btnCerrar.onclick = () => window.close();
        btnImprimir.onclick = () => window.print();
    }
    init();
});
