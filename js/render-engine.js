// js/render-engine.js - v5.8 (Integridad Total y Plantilla ECO Mejorada)

window.RenderEngine = (function() {
  const containerMalla = document.getElementById('contenedor-malla');

  function renderizar(items, areaId, grado, periodo) {
    document.getElementById('herramientas-resultados').classList.add('mostrar-flex');
    const tipo = window.APP_CONFIG.TIPO_MALLA;
    
    containerMalla.innerHTML = items.map(item => {
      if (areaId === "proyecto-socioemocional") {
        return plantillaSocioemocional(item, grado);
      } else {
        return plantillaAcademica(item, areaId, grado, periodo);
      }
    }).join('');

    vincularAcordeones();
  }

  /**
   * PLANTILLA ACADÉMICA (Matemáticas, Lenguaje, etc.)
   */
  function plantillaAcademica(item, areaId, grado, periodo) {
    const tipo = window.APP_CONFIG.TIPO_MALLA;
    const nombreArea = window.APP_CONFIG.AREAS[areaId].nombre;
    const colorArea = window.APP_CONFIG.AREAS[areaId].color;

    // DATA JOINING: DCE
    const llaveT = `Tareas_DCE_${nombreArea}`;
    const dceData = window.MallasData[llaveT]?.[grado]?.[tipo];
    const dcePer = dceData?.periodos?.find(p => String(p.periodo_id) === String(periodo));
    const infoDCE = dcePer?.componentes?.find(c => c.nombre === (item.componente || item.competencia));

    // DATA JOINING: ECO (Transversal)
    const nombreEco = window.APP_CONFIG.AREAS["proyecto-socioemocional"].nombre;
    const ecoData = window.MallasData[nombreEco]?.[grado]?.[tipo];
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

          ${infoDCE ? `
            <div class="contenedor-acordeon">
              <div class="acordeon-header">
                <div class="acordeon-icono-btn" style="background-color:${colorArea};">💡</div>
                <div class="acordeon-titulo" style="color:${colorArea};">Orientaciones: ${infoDCE.la_estrategia || ''}</div>
              </div>
              <div class="acordeon-panel">
                <div class="contenido-interno">
                  <div class="campo"><strong>Reto Sugerido:</strong><div>${infoDCE.un_reto_sugerido || ''}</div></div>
                  <div class="campo"><strong>Ruta de Exploración:</strong>
                    <ul style="margin-left:20px; list-style:square;">
                      <li><strong>Explorar:</strong> ${infoDCE.ruta_de_exploracion?.explorar || ''}</li>
                      <li><strong>Visual:</strong> ${infoDCE.ruta_de_exploracion?.visual || ''}</li>
                      <li><strong>Producción:</strong> ${infoDCE.ruta_de_exploracion?.produccion || ''}</li>
                    </ul>
                  </div>
                  <div class="campo"><strong>Para Pensar:</strong><div>${infoDCE.para_pensar ? infoDCE.para_pensar.join('<br>') : ''}</div></div>
                </div>
              </div>
            </div>` : ''}

          ${infoECO ? `
            <div class="contenedor-acordeon">
              <div class="acordeon-header">
                <div class="acordeon-icono-btn" style="background-color:var(--eco-purple);">🧠</div>
                <div class="acordeon-titulo" style="color:var(--eco-purple);">Responsabilidad Socioemocional ECO</div>
              </div>
              <div class="acordeon-panel">
                <div class="contenido-interno">
                  <div class="campo"><strong>Eje Central:</strong><div>${infoECO.eje_central || ''}</div></div>
                  <div class="campo"><strong>Habilidades:</strong><div>${infoECO.Habilidades ? infoECO.Habilidades.join(' • ') : ''}</div></div>
                </div>
              </div>
            </div>` : ''}

          <a href="eco/diccionario/eco_dic_${grado}.html" target="_blank" class="btn-eco-dic">Consultar Diccionario ECO</a>
        </div>
      </div>
    `;
  }

  /**
   * PLANTILLA MEJORADA CUANDO SE CONSULTA EL ÁREA SOCIOEMOCIONAL
   */
  function plantillaSocioemocional(item, grado) {
    return `
      <div class="item-malla">
        <h3>${item.competencia || 'Competencia Socioemocional'}</h3>
        <div class="item-malla-contenido">
          <div class="campo"><strong>Eje Central del Proceso:</strong> <div>${item.eje_central || ''}</div></div>
          
          <div class="campo"><strong>Habilidades a Fortalecer:</strong> 
            <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; border-left: 5px solid var(--eco-purple);">
              ${item.Habilidades ? item.Habilidades.join(' • ') : ''}
            </div>
          </div>
          
          <div class="campo"><strong>Evidencias de Desempeño ECO:</strong> 
            <div>${item.evidencias_de_desempeno ? item.evidencias_de_desempeno.join('<br>') : ''}</div>
          </div>

          <a href="eco/diccionario/eco_dic_${grado}.html" target="_blank" class="btn-eco-dic">Consultar Diccionario ECO</a>
        </div>
      </div>
    `;
  }

  function vincularAcordeones() {
    document.querySelectorAll('.acordeon-header').forEach(h => {
      h.onclick = function() {
        const panel = this.nextElementSibling;
        const abierto = panel.classList.contains('abierto');
        this.closest('.item-malla-contenido').querySelectorAll('.acordeon-panel').forEach(p => p.classList.remove('abierto'));
        if (!abierto) panel.classList.add('abierto');
      };
    });
  }

  function setCargando(e) { 
    const loader = document.getElementById('loading-overlay');
    if (loader) loader.classList.toggle('mostrar-flex', e);
  }

  return { renderizar, setCargando };
})();
