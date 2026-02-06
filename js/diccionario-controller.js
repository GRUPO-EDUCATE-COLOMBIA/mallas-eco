// FILE: js/diccionario-controller.js | VERSION: v11.0.1 (CORREGIDO)
// (Mantengo la carga de datos igual, solo cambio el HTML inyectado en talleres)

  function renderizarTaller(idx) {
    if (!talleresData) return;
    const t = talleresData.periodos.find(p => p.numero_periodo === periodo)?.talleres[idx-1];
    if (!t) { dicContentDisplay.innerHTML = "Taller no disponible."; return; }

    dicContentDisplay.innerHTML = `
      <div class="taller-card">
        <h2>TALLER ${idx}: ${t.nombre_taller}</h2>
        
        <div class="taller-section-block">
          <div class="taller-section-header">🏷️ CONCEPTOS VINCULADOS</div>
          <div>${t.conceptos_relacionados.map(c => `<span class="badge-concepto">${c}</span>`).join('')}</div>
        </div>

        <div class="taller-section-block">
          <div class="taller-section-header">🎯 PROPÓSITO</div>
          <p style="font-size:1.3rem; line-height:1.4;">${t.proposito_experiencia}</p>
        </div>

        <div class="taller-grid-split">
          <div class="taller-section-block"><div class="taller-section-header">⚡ INICIO</div><p>${t.momento_inicio_conexion}</p></div>
          <div class="taller-section-block"><div class="taller-section-header">✨ DESARROLLO</div><p>${t.momento_desarrollo_vivencia}</p></div>
        </div>

        <div class="taller-section-block"><div class="taller-section-header">✅ CIERRE</div><p>${t.momento_cierre_integracion}</p></div>

        <div class="taller-section-block" style="background: #fffbeb; border-left: 6px solid #f59e0b;">
          <div class="taller-section-header">⏱️ RECURSOS Y TIEMPO</div>
          <p><strong>Recursos:</strong> ${t.recursos_eco} | <strong>Tiempo:</strong> ${t.tiempo_application || t.tiempo_aplicacion}</p>
        </div>
      </div>
    `;
  }

// ... (El resto de la función init() y los manejadores de eventos se mantienen igual que en la versión anterior)
