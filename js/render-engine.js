// js/render-engine.js

/**
 * MOTOR DE RENDERIZADO UNIFICADO v4.0
 * Implementa Acordeones con Efecto Pulso e Integración de Datos Espejo.
 */
window.RenderEngine = (function() {

  // Referencias DOM
  const containerMalla = document.getElementById('contenedor-malla');
  const resPrincipal = document.getElementById('resultados-principal');
  const herramientas = document.getElementById('herramientas-resultados');
  const loading = document.getElementById('loading-overlay');

  // Contexto de la consulta actual
  let contextoActual = { areaId: '', grado: '', periodo: '' };

  /**
   * FUNCIÓN MAESTRA: Prepara y dibuja los resultados
   */
  function renderizar(items, areaId, grado, periodo) {
    contextoActual = { areaId, grado, periodo };

    // Mostrar capas de UI
    resPrincipal.classList.remove('ocultar-inicial');
    resPrincipal.classList.add('mostrar');
    herramientas.classList.remove('ocultar-inicial');
    
    dibujarHTML(items);
    vincularAcordeones();
  }

  /**
   * Genera el HTML recorriendo cada componente
   */
  function dibujarHTML(items) {
    containerMalla.innerHTML = '';

    if (!items || items.length === 0) {
      containerMalla.innerHTML = '<p class="sin-resultados">No se hallaron registros coincidentes.</p>';
      return;
    }

    containerMalla.innerHTML = items.map(item => {
      // ¿Es área socioemocional pura o académica?
      if (contextoActual.areaId === "proyecto-socioemocional") {
        return plantillaSocioemocional(item);
      } else {
        return plantillaAcademica(item, contextoActual.grado, contextoActual.periodo);
      }
    }).join('');
  }

  /**
   * PLANTILLA: Áreas del Núcleo Común (Matemáticas, Lenguaje, etc.)
   */
  function plantillaAcademica(item, grado, periodo) {
    // 1. Cruce con Proyecto ECO (Transversalidad)
    const areaSocio = "Proyecto Socioemocional";
    const tipo = window.APP_CONFIG.TIPO_MALLA;
    const socioData = window.MallasData?.[areaSocio]?.[grado]?.[tipo]?.periodos?.[periodo];
    const infoSocio = socioData && socioData.length > 0 ? socioData[0] : null;

    // 2. Cruce con Orientaciones Metodológicas (DCE Espejo)
    const nombreAreaOriginal = window.APP_CONFIG.AREAS[contextoActual.areaId].nombre;
    const areaT = `Tareas_DCE_${nombreAreaOriginal}`;
    const tareasExternas = window.MallasData?.[areaT]?.[grado]?.[tipo]?.periodos?.[periodo];
    
    // Prioridad: Tarea externa del componente > Tarea interna del JSON > null
    const orientacionDCE = tareasExternas ? tareasExternas[item.componente] : (item.tareas_dce || null);

    return `
      <div class="item-malla">
        <h3>${item.componente || 'General'}</h3>
        <div class="item-malla-contenido">
          
          <!-- Bloque Cognitivo (Estándares y DBA) -->
          <div class="campo"><strong>Estándar Curricular:</strong><div>${item.estandar || ''}</div></div>
          <div class="campo"><strong>DBA:</strong><div>${Array.isArray(item.dba) ? item.dba.join('<br><br>') : (item.dba || '')}</div></div>
          <div class="campo"><strong>Evidencias:</strong><div>${Array.isArray(item.evidencias) ? item.evidencias.join('<br><br>') : (item.evidencias || '')}</div></div>
          <div class="campo"><strong>Saberes:</strong><div>${Array.isArray(item.saberes) ? item.saberes.join(' • ') : (item.saberes || '')}</div></div>

          <!-- ACORDEÓN 1: ORIENTACIÓN METODOLÓGICA (DCE) -->
          ${orientacionDCE ? `
            <div class="contenedor-acordeon">
              <div class="acordeon-header" tabindex="0">
                <div class="acordeon-icono-btn dce-color">💡</div>
                <div class="acordeon-titulo dce-texto">Caja de Orientaciones Metodológicas</div>
              </div>
              <div class="acordeon-panel">
                <div class="contenido-interno">
                  ${orientacionDCE}
                </div>
              </div>
            </div>
          ` : ''}

          <!-- ACORDEÓN 2: RESPONSABILIDAD SOCIOEMOCIONAL (ECO) -->
          ${infoSocio ? `
            <div class="contenedor-acordeon">
              <div class="acordeon-header" tabindex="0">
                <div class="acordeon-icono-btn eco-color">🧠</div>
                <div class="acordeon-titulo eco-texto">Responsabilidad Socioemocional Proyecto ECO</div>
              </div>
              <div class="acordeon-panel">
                <div class="contenido-interno">
                  <div class="eco-badge">Cátedra ECO</div>
                  <div class="campo"><strong>Eje Central:</strong><div>${infoSocio.eje_central || ''}</div></div>
                  <div class="campo"><strong>Habilidades:</strong><div>${infoSocio.Habilidades ? infoSocio.Habilidades.join('<br>') : ''}</div></div>
                  <div class="campo"><strong>Evidencias:</strong><div>${infoSocio.evidencias_de_desempeno ? infoSocio.evidencias_de_desempeno.join('<br>') : ''}</div></div>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- BOTÓN DICCIONARIO (RESTAURADO) -->
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
        <h3>${item.competencia || 'Competencia'}</h3>
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
   * LÓGICA DE INTERACCIÓN: Abre acordeones y cierra los otros
   */
  function vincularAcordeones() {
    document.querySelectorAll('.acordeon-header').forEach(header => {
      header.onclick = function() {
        const panel = this.nextElementSibling;
        const estaAbierto = panel.classList.contains('abierto');
        
        // Limpieza: Cerramos todos los acordeones del componente actual antes de abrir uno
        const parentBlock = this.closest('.item-malla-contenido');
        parentBlock.querySelectorAll('.acordeon-panel').forEach(p => p.classList.remove('abierto'));

        if (!estaAbierto) {
          panel.classList.add('abierto');
        }
      };
      
      // Accesibilidad por teclado (Enter)
      header.onkeypress = function(e) { if(e.key === 'Enter') this.onclick(); };
    });
  }

  /**
   * Control del Spinner de Carga
   */
  function setCargando(estado) {
    if (!loading) return;
    if (estado) {
      loading.classList.remove('ocultar-inicial');
      resPrincipal.classList.add('ocultar-inicial');
    } else {
      loading.classList.add('ocultar-inicial');
    }
  }

  // Evento Impresión Global
  document.addEventListener('click', e => {
    if (e.target && e.target.id === 'btn-imprimir') window.print();
  });

  return { renderizar, setCargando };

})();
