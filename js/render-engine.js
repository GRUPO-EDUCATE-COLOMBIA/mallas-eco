// js/render-engine.js

/**
 * MOTOR DE RENDERIZADO UNIFICADO E INTERACTIVO (v3.0)
 * Implementa Acordeones, Cruce de Datos DCE y Animaciones.
 */
window.RenderEngine = (function() {

  // Referencias DOM
  const containerMalla = document.getElementById('contenedor-malla');
  const resPrincipal = document.getElementById('resultados-principal');
  const herramientas = document.getElementById('herramientas-resultados');
  const loading = document.getElementById('loading-overlay');

  // Estado interno
  let contextoActual = { areaId: '', grado: '', periodo: '' };

  /**
   * FUNCIÓN MAESTRA: Renderiza e inicializa interactividad
   */
  function renderizar(items, areaId, grado, periodo) {
    contextoActual = { areaId, grado, periodo };

    resPrincipal.classList.remove('ocultar');
    herramientas.classList.remove('herramientas-ocultas');
    
    dibujarHTML(items);
    vincularAcordeones();
  }

  /**
   * Genera el HTML recorriendo los ítems
   */
  function dibujarHTML(items) {
    containerMalla.innerHTML = '';

    if (!items || items.length === 0) {
      containerMalla.innerHTML = '<p class="sin-resultados">No se hallaron registros.</p>';
      return;
    }

    containerMalla.innerHTML = items.map(item => {
      if (contextoActual.areaId === "proyecto-socioemocional") {
        return plantillaSocioemocional(item);
      } else {
        return plantillaAcademica(item, contextoActual.grado, contextoActual.periodo);
      }
    }).join('');
  }

  /**
   * PLANTILLA: Áreas Académicas con Acordeones DCE y ECO
   */
  function plantillaAcademica(item, grado, periodo) {
    // 1. Obtener Datos Socioemocionales (Cruce Interno)
    const areaSocio = "Proyecto Socioemocional";
    const tipo = window.APP_CONFIG.TIPO_MALLA;
    const socioData = window.MallasData?.[areaSocio]?.[grado]?.[tipo]?.periodos?.[periodo];
    const infoSocio = socioData && socioData.length > 0 ? socioData[0] : null;

    // 2. Obtener Orientación Metodológica DCE (Cruce Externo)
    // Buscamos en el objeto Tareas_DCE_Matematicas que el cargador poblará
    const areaT = `Tareas_DCE_${window.APP_CONFIG.AREAS[contextoActual.areaId].nombre}`;
    const tareasDCE = window.MallasData?.[areaT]?.[grado]?.[tipo]?.periodos?.[periodo];
    // Buscamos la tarea que coincida con el componente actual
    const tareaEspecifica = tareasDCE ? tareasDCE[item.componente] : (item.tareas_dce || null);

    return `
      <div class="item-malla">
        <h3>${item.componente || 'General'}</h3>
        <div class="item-malla-contenido">
          
          <!-- Bloques Académicos (Siempre Visibles) -->
          <div class="campo"><strong>Estándar Curricular:</strong><div>${item.estandar || ''}</div></div>
          <div class="campo"><strong>Derechos Básicos (DBA):</strong><div>${Array.isArray(item.dba) ? item.dba.join('<br><br>') : (item.dba || '')}</div></div>
          <div class="campo"><strong>Evidencias:</strong><div>${Array.isArray(item.evidencias) ? item.evidencias.join('<br><br>') : (item.evidencias || '')}</div></div>
          <div class="campo"><strong>Saberes:</strong><div>${Array.isArray(item.saberes) ? item.saberes.join(' • ') : (item.saberes || '')}</div></div>

          <!-- ACORDEÓN 1: CAJA DE ORIENTACIONES METODOLÓGICAS (DCE) -->
          ${tareaEspecifica ? `
            <div class="contenedor-acordeon">
              <div class="acordeon-header" tabindex="0" role="button">
                <span class="indicador-mano">👉</span>
                <div class="acordeon-icono-btn dce-color">💡</div>
                <div class="acordeon-titulo dce-texto">Caja de Orientaciones Metodológicas</div>
              </div>
              <div class="acordeon-panel">
                <div class="contenido-interno">
                  <div class="campo"><strong>Metodología DCE:</strong><div>${tareaEspecifica}</div></div>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- ACORDEÓN 2: RESPONSABILIDAD SOCIOEMOCIONAL (ECO) -->
          ${infoSocio ? `
            <div class="contenedor-acordeon">
              <div class="acordeon-header" tabindex="0" role="button">
                <span class="indicador-mano">👉</span>
                <div class="acordeon-icono-btn eco-color">🧠</div>
                <div class="acordeon-titulo eco-texto">Responsabilidad Socioemocional Proyecto ECO</div>
              </div>
              <div class="acordeon-panel">
                <div class="contenido-interno">
                  <div class="eco-badge">Cátedra ECO</div>
                  <div class="campo"><strong>Eje Central:</strong><div>${infoSocio.eje_central || ''}</div></div>
                  <div class="campo"><strong>Habilidades:</strong><div>${infoSocio.Habilidades ? infoSocio.Habilidades.join('<br>') : ''}</div></div>
                  <div class="campo"><strong>Evidencias ECO:</strong><div>${infoSocio.evidencias_de_desempeno ? infoSocio.evidencias_de_desempeno.join('<br>') : ''}</div></div>
                </div>
              </div>
            </div>
          ` : ''}

          <div class="dic-link-container">
            <a href="eco/diccionario/eco_dic_${grado}.html" target="_blank" class="btn-eco-dic">Consultar Diccionario ECO</a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * PLANTILLA: Área Socioemocional Pura
   */
  function plantillaSocioemocional(item) {
    return `
      <div class="item-malla">
        <h3>${item.competencia || 'Competencia ECO'}</h3>
        <div class="item-malla-contenido">
          <div class="campo"><strong>Eje Central:</strong><div>${item.eje_central || ''}</div></div>
          <div class="campo"><strong>Estándar:</strong><div>${item.estandar || ''}</div></div>
          <div class="campo"><strong>Habilidades:</strong><div>${item.Habilidades ? item.Habilidades.join('<br>') : ''}</div></div>
          <div class="campo"><strong>Evidencias:</strong><div>${item.evidencias_de_desempeno ? item.evidencias_de_desempeno.join('<br>') : ''}</div></div>
        </div>
      </div>
    `;
  }

  /**
   * LÓGICA DE INTERACCIÓN: Abre y cierra acordeones
   */
  function vincularAcordeones() {
    const headers = document.querySelectorAll('.acordeon-header');
    
    headers.forEach(header => {
      // Función para alternar estado
      const toggle = () => {
        const panel = header.nextElementSibling;
        const mano = header.querySelector('.indicador-mano');
        
        const estaAbierto = panel.classList.contains('abierto');
        
        // Cerrar todos los demás acordeones del mismo bloque para limpieza
        const bloquePadre = header.closest('.item-malla-contenido');
        bloquePadre.querySelectorAll('.acordeon-panel').forEach(p => p.classList.remove('abierto'));
        bloquePadre.querySelectorAll('.indicador-mano').forEach(m => m.style.visibility = 'visible');

        if (!estaAbierto) {
          panel.classList.add('abierto');
          if(mano) mano.style.visibility = 'hidden'; // Ocultar mano al abrir
        }
      };

      header.addEventListener('click', toggle);
      header.addEventListener('keypress', (e) => { if(e.key === 'Enter') toggle(); });
    });
  }

  function setCargando(estado) {
    const loader = document.getElementById('loading-overlay');
    if (!loader) return;
    estado ? loader.classList.remove('loading-oculto') : loader.classList.add('loading-oculto');
  }

  // Evento Impresión
  document.addEventListener('click', e => { if(e.target.id === 'btn-imprimir') window.print(); });

  return { renderizar, setCargando };

})();
