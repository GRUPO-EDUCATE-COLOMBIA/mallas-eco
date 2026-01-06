// js/render-engine.js v5.5 - FINAL STABLE
window.RenderEngine = (function() {
  const containerMalla = document.getElementById('contenedor-malla');

  function renderizar(items, areaId, grado, periodo) {
    document.getElementById('herramientas-resultados').classList.add('mostrar-flex');
    const tipo = window.APP_CONFIG.TIPO_MALLA;
    
    containerMalla.innerHTML = items.map(item => {
      // 1. DATA JOINING DCE
      const nombreArea = window.APP_CONFIG.AREAS[areaId].nombre;
      const llaveT = `Tareas_DCE_${nombreArea}`;
      const dceData = window.MallasData[llaveT]?.[grado]?.[tipo];
      const dcePer = dceData?.periodos?.find(p => String(p.periodo_id) === String(periodo));
      const infoDCE = dcePer?.componentes?.find(c => c.nombre === (item.componente || item.competencia));

      // 2. DATA JOINING ECO (CORREGIDO: Busca la llave exacta de config.js)
      const ecoData = window.MallasData["Proyecto Socioemocional"]?.[grado]?.[tipo];
      const ecoPer = ecoData?.periodos?.[periodo];
      const infoECO = ecoPer && ecoPer.length > 0 ? ecoPer[0] : null;

      return `
        <div class="item-malla">
          <h3>${item.componente || item.competencia || 'General'}</h3>
          <div class="item-malla-contenido">
            <div class="campo"><strong>Estándar Curricular:</strong><div>${item.estandar || ''}</div></div>
            <div class="campo"><strong>DBA:</strong><div>${Array.isArray(item.dba) ? item.dba.join('<br><br>') : (item.dba || '')}</div></div>
            <div class="campo"><strong>Evidencias de Aprendizaje:</strong><div>${Array.isArray(item.evidencias) ? item.evidencias.join('<br><br>') : (item.evidencias || '')}</div></div>
            <div class="campo"><strong>Saberes / Contenidos:</strong><div>${Array.isArray(item.saberes) ? item.saberes.join(' • ') : (item.saberes || '')}</div></div>

            <!-- ACORDEÓN DCE -->
            ${infoDCE ? `
              <div class="contenedor-acordeon">
                <div class="acordeon-header">
                  <div class="acordeon-icono-btn" style="background-color:#F07F3C;">💡</div>
                  <div class="acordeon-titulo" style="color:#F07F3C;">Orientaciones: ${infoDCE.la_estrategia || ''}</div>
                </div>
                <div class="acordeon-panel">
                  <div class="contenido-interno">
                    <div class="campo"><strong>Reto Sugerido:</strong><div>${infoDCE.un_reto_sugerido || ''}</div></div>
                    <div class="campo"><strong>Ruta de Exploración:</strong>
                      <ul>
                        <li><strong>Explorar:</strong> ${infoDCE.ruta_de_exploracion?.explorar || ''}</li>
                        <li><strong>Visual:</strong> ${infoDCE.ruta_de_exploracion?.visual || ''}</li>
                        <li><strong>Producción:</strong> ${infoDCE.ruta_de_exploracion?.produccion || ''}</li>
                      </ul>
                    </div>
                    <div class="campo"><strong>Para Pensar:</strong><div>${infoDCE.para_pensar ? infoDCE.para_pensar.join('<br>') : ''}</div></div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; border-top:1px dashed #ccc; padding-top:15px;">
                      <div><strong>Pistas Éxito:</strong><br>${infoDCE.pistas_del_exito || ''}</div>
                      <div><strong>Refuerzo:</strong><br>${infoDCE.un_refuerzo || ''}</div>
                    </div>
                  </div>
                </div>
              </div>` : ''}

            <!-- ACORDEÓN ECO (Socioemocional) -->
            ${infoECO ? `
              <div class="contenedor-acordeon">
                <div class="acordeon-header">
                  <div class="acordeon-icono-btn" style="background-color:#9B7BB6;">🧠</div>
                  <div class="acordeon-titulo" style="color:#9B7BB6;">Responsabilidad Socioemocional ECO</div>
                </div>
                <div class="acordeon-panel">
                  <div class="contenido-interno">
                    <div class="campo"><strong>Eje Central:</strong><div>${infoECO.eje_central || ''}</div></div>
                    <div class="campo"><strong>Habilidades:</strong><div>${infoECO.Habilidades ? infoECO.Habilidades.join(' • ') : ''}</div></div>
                    <div class="campo"><strong>Evidencias ECO:</strong><div>${infoECO.evidencias_de_desempeno ? infoECO.evidencias_de_desempeno.join('<br>') : ''}</div></div>
                  </div>
                </div>
              </div>` : ''}

            <a href="eco/diccionario/eco_dic_${grado}.html" target="_blank" class="btn-eco-dic">Consultar Diccionario ECO</a>
          </div>
        </div>
      `;
    }).join('');

    vincularAcordeones();
  }

  function vincularAcordeones() {
    document.querySelectorAll('.acordeon-header').forEach(h => {
      h.onclick = function() {
        const panel = this.nextElementSibling;
        const estaAbierto = panel.classList.contains('abierto');
        this.closest('.item-malla-contenido').querySelectorAll('.acordeon-panel').forEach(p => p.classList.remove('abierto'));
        if (!estaAbierto) panel.classList.add('abierto');
      };
    });
  }

  return { renderizar, setCargando: (e) => document.getElementById('loading-overlay').classList.toggle('mostrar-flex', e) };
})();
