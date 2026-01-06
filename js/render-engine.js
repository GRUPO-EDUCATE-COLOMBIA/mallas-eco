// js/render-engine.js - v5.6 (FIX INTEGRIDAD)
window.RenderEngine = (function() {
  const containerMalla = document.getElementById('contenedor-malla');

  function renderizar(items, areaId, grado, periodo) {
    document.getElementById('herramientas-resultados').classList.add('mostrar-flex');
    const tipo = window.APP_CONFIG.TIPO_MALLA;
    
    containerMalla.innerHTML = items.map(item => {
      // Búsqueda DCE
      const nombreArea = window.APP_CONFIG.AREAS[areaId].nombre;
      const dceData = window.MallasData[`Tareas_DCE_${nombreArea}`]?.[grado]?.[tipo];
      const dcePer = dceData?.periodos?.find(p => String(p.periodo_id) === String(periodo));
      const infoDCE = dcePer?.componentes?.find(c => c.nombre === (item.componente || item.competencia));

      // Búsqueda ECO (Proyecto Socioemocional)
      const infoECO_Data = window.MallasData["Proyecto Socioemocional"]?.[grado]?.[tipo];
      const infoECO = infoECO_Data?.periodos?.[periodo] ? infoECO_Data.periodos[periodo][0] : null;

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
                  <div class="acordeon-icono-btn" style="background-color:#F07F3C;">💡</div>
                  <div class="acordeon-titulo" style="color:#F07F3C;">Orientaciones: ${infoDCE.la_estrategia || ''}</div>
                </div>
                <div class="acordeon-panel">
                  <div class="contenido-interno">
                    <p><strong>Reto:</strong> ${infoDCE.un_reto_sugerido || ''}</p>
                    <p><strong>Explorar:</strong> ${infoDCE.ruta_de_exploracion?.explorar || ''}</p>
                    <p><strong>Visual:</strong> ${infoDCE.ruta_de_exploracion?.visual || ''}</p>
                    <p><strong>Producción:</strong> ${infoDCE.ruta_de_exploracion?.produccion || ''}</p>
                    <p><strong>Para pensar:</strong> ${infoDCE.para_pensar ? infoDCE.para_pensar.join('<br>') : ''}</p>
                  </div>
                </div>
              </div>` : ''}

            ${infoECO ? `
              <div class="contenedor-acordeon">
                <div class="acordeon-header">
                  <div class="acordeon-icono-btn" style="background-color:#9B7BB6;">🧠</div>
                  <div class="acordeon-titulo" style="color:#9B7BB6;">Responsabilidad Socioemocional ECO</div>
                </div>
                <div class="acordeon-panel">
                  <div class="contenido-interno">
                    <p><strong>Eje:</strong> ${infoECO.eje_central || ''}</p>
                    <p><strong>Habilidades:</strong> ${infoECO.Habilidades ? infoECO.Habilidades.join(' • ') : ''}</p>
                    <p><strong>Evidencias ECO:</strong> ${infoECO.evidencias_de_desempeno ? infoECO.evidencias_de_desempeno.join('<br>') : ''}</p>
                  </div>
                </div>
              </div>` : ''}
              
            <a href="eco/diccionario/eco_dic_${grado}.html" target="_blank" class="btn-eco-dic">Consultar Diccionario ECO</a>
          </div>
        </div>`;
    }).join('');
    vincularAcordeones();
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

  return { renderizar, setCargando: (e) => document.getElementById('loading-overlay').classList.toggle('mostrar-flex', e) };
})();
