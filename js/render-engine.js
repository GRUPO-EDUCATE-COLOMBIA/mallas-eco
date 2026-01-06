// js/render-engine.js - FIX TOTAL

window.RenderEngine = (function() {
  const containerMalla = document.getElementById('contenedor-malla');

  function renderizar(items, areaId, grado, periodo) {
    document.getElementById('herramientas-resultados').classList.add('mostrar-flex');
    
    containerMalla.innerHTML = items.map(item => {
      // 1. Obtener Datos DCE (Estructura de Arreglos)
      const nombreArea = window.APP_CONFIG.AREAS[areaId].nombre;
      const llaveT = `Tareas_DCE_${nombreArea}`;
      const dce = window.MallasData?.[llaveT]?.[grado]?.["4_periodos"];
      const dcePer = dce?.periodos?.find(p => String(p.periodo_id) === String(periodo));
      const infoDCE = dcePer?.componentes?.find(c => c.nombre === (item.componente || item.competencia));

      // 2. Obtener Datos ECO
      const socioData = window.MallasData?.["Proyecto Socioemocional"]?.[grado]?.["4_periodos"]?.periodos?.[periodo];
      const infoSocio = socioData?.[0];

      return `
        <div class="item-malla">
          <h3>${item.componente || item.competencia || 'General'}</h3>
          <div class="item-malla-contenido">
            <div class="campo"><strong>Estándar Curricular:</strong><div>${item.estandar || ''}</div></div>
            <div class="campo"><strong>DBA:</strong><div>${Array.isArray(item.dba) ? item.dba.join('<br>') : (item.dba || '')}</div></div>

            <!-- ACORDEÓN DCE -->
            ${infoDCE ? `
              <div class="contenedor-acordeon">
                <div class="acordeon-header">
                  <div class="acordeon-icono-btn dce-color">💡</div>
                  <div class="acordeon-titulo">Orientaciones: ${infoDCE.la_estrategia || ''}</div>
                </div>
                <div class="acordeon-panel">
                  <div class="contenido-interno">
                    <p><strong>Reto:</strong> ${infoDCE.un_reto_sugerido || ''}</p>
                    <p style="margin-top:10px;"><strong>Explorar:</strong> ${infoDCE.ruta_de_exploracion?.explorar || ''}</p>
                  </div>
                </div>
              </div>` : ''}

            <!-- ACORDEÓN ECO -->
            ${infoSocio ? `
              <div class="contenedor-acordeon">
                <div class="acordeon-header">
                  <div class="acordeon-icono-btn eco-color">🧠</div>
                  <div class="acordeon-titulo">Responsabilidad ECO</div>
                </div>
                <div class="acordeon-panel">
                  <div class="contenido-interno">
                    <p><strong>Eje:</strong> ${infoSocio.eje_central || ''}</p>
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
    document.getElementById('loading-overlay').style.display = e ? 'flex' : 'none'; 
  }

  return { renderizar, setCargando };
})();
