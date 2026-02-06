// FILE: js/diccionario-controller.js | VERSION: v11.0.3 (FINAL-ESTABLE)
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const grado = urlParams.get('grado');
    const periodo = parseInt(urlParams.get('periodo'));
    const areaNombre = urlParams.get('area') || "Proyecto Socioemocional";

    if (!grado || isNaN(periodo)) {
        alert('Información de consulta insuficiente.');
        window.close();
        return;
    }

    // Referencias DOM
    const headerInfo = document.getElementById('dic-header-info');
    const dicMenu = document.getElementById('dic-menu');
    const dicContentDisplay = document.getElementById('dic-content-display');
    const btnCerrar = document.getElementById('btn-cerrar-dic');
    const btnImprimir = document.getElementById('btn-imprimir-dic');

    let diccionarioData = null;
    let talleresData = null;

    // Colores corporativos
    const colores = ['#F39325', '#11678B', '#54BBAB', '#9B7BB6', '#D94D15'];

    async function cargarDatos() {
        try {
            const [resDic, resTal] = await Promise.all([
                fetch(`data/diccionario/${grado}_diccionario.json?v=${Date.now()}`),
                fetch(`data/diccionario/${grado}_talleres.json?v=${Date.now()}`)
            ]);
            if (resDic.ok) diccionarioData = await resDic.json();
            if (resTal.ok) talleresData = await resTal.json();
        } catch (e) { 
            console.error("Error al conectar con la base de datos", e);
            dicContentDisplay.innerHTML = "Error al cargar datos pedagógicos.";
        }
    }

    function renderizarDiccionario() {
        if (!diccionarioData) return;
        const conceptos = diccionarioData[`periodo_${periodo}`] || [];
        
        let html = `
            <div class="taller-section-block" style="border-left: 8px solid #11678B;">
                <strong>🎯 ESTÁNDAR DEL PERIODO:</strong>
                <p style="font-size:1.4rem; font-weight:700; margin-top:5px;">Identifico emociones básicas en momentos escolares cotidianos.</p>
                <p style="font-size:1.1rem; opacity:0.8;">EJE: Reconozco lo que siento | COMPETENCIA: Autonomía emocional</p>
            </div>
            <div class="dic-grid-container">
        `;

        conceptos.forEach((c, i) => {
            const color = colores[i % colores.length];
            html += `
                <div class="dic-concepto-card" style="--concepto-color: ${color}">
                    <h3>${c.concepto}</h3>
                    <div class="taller-section-block" style="background:transparent; border:none; padding:0; margin-bottom:10px;">
                        <p style="font-size:0.9rem; color:#11678B; font-weight:800;">DEFINICIÓN PEDAGÓGICA</p>
                        <p style="font-size:1.2rem;">${c.definicion_pedagogica}</p>
                    </div>
                    <div class="taller-section-block" style="background:transparent; border:none; padding:0; margin-bottom:10px;">
                        <p style="font-size:0.9rem; color:#11678B; font-weight:800;">HABILIDAD TÉCNICA</p>
                        <p style="font-size:1.1rem;">${c.habilidad_malla}</p>
                    </div>
                    <div style="background:#fff4e6; padding:10px; border-radius:8px; border-left:4px solid #f39325; font-style:italic;">
                        💡 ${c.tip_psicologico}
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

        if (!t) { dicContentDisplay.innerHTML = "Taller no disponible para este periodo."; return; }

        dicContentDisplay.innerHTML = `
            <div class="taller-card">
                <h2>TALLER ${idx}: ${t.nombre_taller}</h2>
                
                <div class="taller-section-block">
                    <div class="taller-section-header">🏷️ CONCEPTOS VINCULADOS</div>
                    <div>${t.conceptos_relacionados.map(c => `<span class="badge-concepto">${c}</span>`).join('')}</div>
                </div>

                <div class="taller-section-block">
                    <div class="taller-section-header">🎯 PROPÓSITO</div>
                    <p style="font-size:1.3rem;">${t.proposito_experiencia}</p>
                </div>

                <div class="taller-grid-split">
                    <div class="taller-section-block"><div class="taller-section-header">⚡ INICIO</div><p>${t.momento_inicio_conexion}</p></div>
                    <div class="taller-section-block"><div class="taller-section-header">✨ DESARROLLO</div><p>${t.momento_desarrollo_vivencia}</p></div>
                </div>

                <div class="taller-section-block"><div class="taller-section-header">✅ CIERRE</div><p>${t.momento_cierre_integracion}</p></div>

                <div class="taller-section-block" style="background: #fffbeb; border-left: 6px solid #f59e0b;">
                    <div class="taller-section-header">⏱️ LOGÍSTICA</div>
                    <p><strong>Recursos:</strong> ${t.recursos_eco} | <strong>Tiempo:</strong> ${t.tiempo_application || t.tiempo_aplicacion}</p>
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
        btnImprimir.onclick = () => {
            const now = new Date();
            document.getElementById('print-fecha-txt-dic').innerHTML = `<strong>ÁREA:</strong> ${areaNombre} | <strong>GRADO:</strong> ${gTxt} | <strong>PERIODO:</strong> ${periodo}° <br> <strong>CONSULTA:</strong> ${now.toLocaleString()}`;
            setTimeout(() => window.print(), 300);
        };
    }

    init();
});
