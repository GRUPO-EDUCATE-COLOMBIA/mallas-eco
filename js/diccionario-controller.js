// FILE: js/diccionario-controller.js | VERSION: v11.0.5
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const grado = urlParams.get('grado');
    const periodo = parseInt(urlParams.get('periodo'));
    const areaNombre = urlParams.get('area') || "Proyecto Socioemocional";

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
    let talleresData = null;

    // Colores para las franjas laterales de los conceptos
    const colores = ['#F39325', '#11678B', '#54BBAB', '#9B7BB6', '#D94D15'];

    async function cargarDatos() {
        try {
            const [resDic, resTal] = await Promise.all([
                fetch(`data/diccionario/${grado}_diccionario.json?v=${Date.now()}`),
                fetch(`data/diccionario/${grado}_talleres.json?v=${Date.now()}`)
            ]);
            if (resDic.ok) diccionarioData = await resDic.json();
            if (resTal.ok) talleresData = await resTal.json();
        } catch (e) { console.error("Error en la carga de JSON", e); }
    }

    function renderizarDiccionario() {
        if (!diccionarioData) return;
        const conceptos = diccionarioData[`periodo_${periodo}`] || [];
        
        let html = `
            <div class="taller-section-block" style="border-left: 10px solid #11678B; background: #f0f4f8;">
                <strong>🎯 ESTÁNDAR DEL PERIODO:</strong>
                <p style="font-size:1.6rem; font-weight:800; color:#17334B; margin-top:5px;">Identifico emociones básicas en momentos escolares cotidianos.</p>
                <p style="font-size:1.2rem; color:#666;">EJE: Reconozco lo que siento | COMPETENCIA: Autonomía emocional</p>
            </div>
            <div class="dic-grid-container">
        `;

        conceptos.forEach((c, i) => {
            const color = colores[i % colores.length];
            html += `
                <div class="dic-concepto-card" style="--concepto-color: ${color}">
                    <h3>${c.concepto}</h3>
                    
                    <div class="dic-field"><strong>DEFINICIÓN PEDAGÓGICA</strong><p>${c.definicion_pedagogica}</p></div>
                    
                    <div class="dic-field"><strong>DEFINICIÓN PARA EL ESTUDIANTE</strong><p>${c.definicion_estudiante}</p></div>
                    
                    <div class="dic-field"><strong>HABILIDAD TÉCNICA (EN MALLA)</strong><p>${c.habilidad_malla}</p></div>
                    
                    <div class="dic-field"><strong>EJEMPLO DE APLICACIÓN EN AULA</strong><p>${c.ejemplo_aula}</p></div>
                    
                    <div class="dic-field"><strong>¿QUÉ OBSERVAR? (EVIDENCIA DE LOGRO)</strong><p>${c.evidencia_logro}</p></div>
                    
                    <div class="dic-tip-box">
                        <span>💡</span>
                        <p><strong>Tip para el Profe:</strong> ${c.tip_psicologico}</p>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
        dicContentDisplay.innerHTML = html;
    }

    function renderizarTaller(idx) {
        if (!talleresData) return;
        const p = talleresData.periodos.find(per => per.numero_periodo === periodo);
        const t = p?.talleres[idx-1];
        if (!t) return;

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
                    <p style="font-size:1.4rem; line-height:1.4;">${t.proposito_experiencia}</p>
                </div>
                <div class="taller-grid-split">
                    <div class="taller-section-block"><strong>⚡ MOMENTO DE INICIO / CONEXIÓN</strong><p style="font-size:1.15rem; margin-top:8px;">${t.momento_inicio_conexion}</p></div>
                    <div class="taller-section-block"><strong>✨ MOMENTO DE DESARROLLO / VIVENCIA</strong><p style="font-size:1.15rem; margin-top:8px;">${t.momento_desarrollo_vivencia}</p></div>
                </div>
                <div class="taller-section-block"><strong>✅ MOMENTO DE CIERRE / INTEGRACIÓN</strong><p style="font-size:1.15rem; margin-top:8px;">${t.momento_cierre_integracion}</p></div>
                
                <div class="taller-section-block" style="background: #fff9e6; border-left: 8px solid #F39325;">
                    <strong>⏱️ LOGÍSTICA Y RECURSOS</strong>
                    <p style="margin-top:5px;"><strong>TIEMPO:</strong> ${t.tiempo_application || t.tiempo_aplicacion} | <strong>RECURSOS ECO:</strong> ${t.recursos_eco}</p>
                </div>
            </div>
        `;
    }

    async function init() {
        const gTxt = grado === "0" ? "TRANSICIÓN" : (grado === "-1" ? "JARDÍN" : `GRADO ${grado}°`);
        headerInfo.textContent = `GRADO: ${gTxt} | PERIODO: ${periodo}`;
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
            window.scrollTo({top: 0, behavior: 'smooth'});
        };

        btnCerrar.onclick = () => window.close();
        btnImprimir.onclick = () => window.print();
    }
    init();
});
