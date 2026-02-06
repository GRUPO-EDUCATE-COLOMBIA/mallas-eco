// FILE: js/diccionario-controller.js | VERSION: v11.0.4
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const grado = urlParams.get('grado');
    const periodo = parseInt(urlParams.get('periodo'));
    const areaNombre = urlParams.get('area') || "Proyecto Socioemocional";

    if (!grado || isNaN(periodo)) {
        alert('Datos incompletos.');
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
        } catch (e) { console.error(e); }
    }

    function renderizarDiccionario() {
        if (!diccionarioData) return;
        const conceptos = diccionarioData[`periodo_${periodo}`] || [];
        let html = `
            <div class="taller-section-block" style="border-left: 8px solid #11678B;">
                <strong>🎯 ESTÁNDAR DEL PERIODO:</strong>
                <p style="font-size:1.5rem; font-weight:700;">Identifico emociones básicas en momentos escolares cotidianos.</p>
                <p>EJE: Reconozco lo que siento | COMPETENCIA: Autonomía emocional</p>
            </div>
            <div class="dic-grid-container">
        `;
        conceptos.forEach((c, i) => {
            html += `
                <div class="taller-section-block" style="border-top: 5px solid #F39325;">
                    <h3 style="font-size:2rem; color:#17334B; margin-bottom:10px;">${c.concepto}</h3>
                    <p><strong>DEFINICIÓN:</strong> ${c.definicion_pedagogica}</p>
                    <p style="margin-top:10px; font-style:italic; color:#11678B;">💡 ${c.tip_psicologico}</p>
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
                <h2 style="font-size: 2.8rem; color: #17334B; margin-bottom: 1.5rem;">TALLER ${idx}: ${t.nombre_taller}</h2>
                <div class="taller-section-block">
                    <div style="font-weight:800; color:#11678B; margin-bottom:10px;">🏷️ CONCEPTOS VINCULADOS</div>
                    <div>${t.conceptos_relacionados.map(c => `<span class="badge-concepto">${c}</span>`).join('')}</div>
                </div>
                <div class="taller-section-block">
                    <div style="font-weight:800; color:#11678B; margin-bottom:5px;">🎯 PROPÓSITO</div>
                    <p style="font-size:1.3rem;">${t.proposito_experiencia}</p>
                </div>
                <div class="taller-grid-split">
                    <div class="taller-section-block"><strong>⚡ INICIO:</strong><p>${t.momento_inicio_conexion}</p></div>
                    <div class="taller-section-block"><strong>✨ DESARROLLO:</strong><p>${t.momento_desarrollo_vivencia}</p></div>
                </div>
                <div class="taller-section-block"><strong>✅ CIERRE:</strong><p>${t.momento_cierre_integracion}</p></div>
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
