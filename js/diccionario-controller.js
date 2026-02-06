// FILE: js/diccionario-controller.js | VERSION: v11.0.5 (TOTAL DATA RENDER)
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const grado = urlParams.get('grado');
    const periodo = parseInt(urlParams.get('periodo'));

    if (!grado || isNaN(periodo)) {
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

    async function cargarDatos() {
        try {
            const [resDic, resTal] = await Promise.all([
                fetch(`data/diccionario/${grado}_diccionario.json?v=${Date.now()}`),
                fetch(`data/diccionario/${grado}_talleres.json?v=${Date.now()}`)
            ]);
            if (resDic.ok) diccionarioData = await resDic.json();
            if (resTal.ok) talleresData = await resTal.json();
        } catch (e) { console.error("Error cargando archivos JSON:", e); }
    }

    function renderizarDiccionario() {
        if (!diccionarioData) return;
        const conceptos = diccionarioData[`periodo_${periodo}`] || [];
        
        let html = `
            <div class="taller-section-block" style="border-left: 8px solid #11678B;">
                <p style="font-size:1.1rem; color:#64748b; font-weight:800; text-transform:uppercase;">Estándar del Periodo</p>
                <p style="font-size:1.8rem; font-weight:800; color:#17334B;">Identifico emociones básicas en momentos escolares cotidianos.</p>
                <p style="font-size:1.1rem; margin-top:5px;">EJE: Reconozco lo que siento | COMPETENCIA: Autonomía emocional</p>
            </div>
            <div class="dic-grid-container">
        `;

        conceptos.forEach(c => {
            html += `
                <div class="dic-concepto-card">
                    <h3>${c.concepto}</h3>
                    
                    <div class="dic-field-group">
                        <span class="dic-field-label">Definición Pedagógica</span>
                        <p class="dic-field-value">${c.definicion_pedagogica || '---'}</p>
                    </div>

                    ${c.definicion_estudiante ? `
                    <div class="dic-field-group">
                        <span class="dic-field-label">Definición para el Estudiante</span>
                        <p class="dic-field-value">${c.definicion_estudiante}</p>
                    </div>` : ''}

                    <div class="dic-field-group">
                        <span class="dic-field-label">Habilidad Técnica / Malla</span>
                        <p class="dic-field-value">${c.habilidad_malla || '---'}</p>
                    </div>

                    ${c.ejemplo_aula ? `
                    <div class="dic-field-group">
                        <span class="dic-field-label">Ejemplo de Aula</span>
                        <p class="dic-field-value">${c.ejemplo_aula}</p>
                    </div>` : ''}

                    <div class="dic-field-group">
                        <span class="dic-field-label">¿Qué observar? (Evidencia)</span>
                        <p class="dic-field-value">${c.evidencia_logro || '---'}</p>
                    </div>

                    <div class="dic-tip-box">
                        <p>💡 <strong>Tip para el Profe:</strong> ${c.tip_psicologico || '---'}</p>
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
                    <span class="dic-field-label" style="color:#11678B;">🏷️ Conceptos Vinculados</span>
                    <div style="margin-top:10px;">
                        ${t.conceptos_relacionados.map(c => `<span class="badge-concepto" style="background:#1e293b; color:white; padding:5px 15px; border-radius:20px; margin-right:5px; font-weight:700;">${c}</span>`).join('')}
                    </div>
                </div>
                <div class="taller-section-block">
                    <span class="dic-field-label" style="color:#11678B;">🎯 Propósito</span>
                    <p style="font-size:1.4rem; margin-top:5px;">${t.proposito_experiencia}</p>
                </div>
                <div class="taller-grid-split">
                    <div class="taller-section-block"><span class="dic-field-label">⚡ Inicio</span><p>${t.momento_inicio_conexion}</p></div>
                    <div class="taller-section-block"><span class="dic-field-label">✨ Desarrollo</span><p>${t.momento_desarrollo_vivencia}</p></div>
                </div>
                <div class="taller-section-block"><span class="dic-field-label">✅ Cierre</span><p>${t.momento_cierre_integracion}</p></div>
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
        };

        btnCerrar.onclick = () => window.close();
        btnImprimir.onclick = () => window.print();
    }
    init();
});
