// js/render-engine.js - REVISADO v5.2 STABLE

window.RenderEngine = (function() {
  const containerMalla = document.getElementById('contenedor-malla');

  function renderizar(items, areaId, grado, periodo) {
    // 1. Mostrar herramientas (botón impresión)
    document.getElementById('herramientas-resultados').classList.add('mostrar-flex');
    
    // 2. Dibujar Malla
    containerMalla.innerHTML = items.map(item => {
      // Búsqueda DCE (Estructura arreglos Grado 1°)
      const nombreArea = window.APP_CONFIG.AREAS[areaId].nombre;
      const llaveT = `Tareas_DCE_${nombreArea}`;
      const dce = window.MallasData?.[llaveT]?.[grado]?.["4_periodos"];
      const dcePer = dce?.periodos?.find(p => String(p.periodo_id) === String(periodo));
      const infoDCE = dcePer?.componentes?.find(c => c.nombre === (item.componente || item.competencia));

      // Búsqueda ECO
      const socioData = window.MallasData?.["Proyecto Socioemocional"]?.[grado]?.["4_periodos"]?.periodos?.[periodo];
      const infoSocio = socioData?.[0];

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
                  <div class="acordeon-icono-btn dce-color">💡</div>
                  <div class="acordeon-titulo">Orientaciones: ${infoDCE.la_estrategia || 'Ver más'}</div>
                </div>
                <div class="acordeon-panel">
                  <div class="contenido-interno">
                    <div class="campo"><strong>Reto Sugerido:</strong><div>${infoDCE.un_reto_sugerido || ''}</div></div>
                    <div class="campo"><strong>Ruta de Exploración:</strong>
                      <ul>
                        <li>Explorar: ${infoDCE.ruta_de_exploracion?.explorar || ''}</li>
                        <li>Visual: ${infoDCE.ruta_de_exploracion?.visual || ''}</li>
                        <li>Producción: ${infoDCE.ruta_de_exploracion?.produccion || ''}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>` : ''}

            <!-- ACORDEÓN ECO -->
            ${infoSocio ? `
              <div class="contenedor-acordeon">
                <div class="acordeon-header">
                  <div class="acordeon-icono-btn eco-color">🧠</div>
                  <div class="acordeon-titulo">Responsabilidad Socioemocional ECO</div>
                </div>
                <div class="acordeon-panel">
                  <div class="contenido-interno">
                    <div class="campo"><strong>Eje Central:</strong><div>${infoSocio.eje_central || ''}</div></div>
                    <div class="campo"><strong>Habilidades:</strong><div>${infoSocio.Habilidades ? infoSocio.Habilidades.join('<br>') : ''}</div></div>
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

  function setCargando(e) { 
    const loader = document.getElementById('loading-overlay');
    if (loader) loader.classList.toggle('mostrar-flex', e);
  }

  return { renderizar, setCargando };
})();
