// js/render-engine.js

/**
 * MOTOR DE RENDERIZADO UNIFICADO (v2.0)
 * Gestiona la visualización académica, socioemocional, búsqueda e impresión.
 */
window.RenderEngine = (function() {

  // Referencias a elementos del DOM
  const containerMalla = document.getElementById('contenedor-malla');
  const resPrincipal = document.getElementById('resultados-principal');
  const herramientas = document.getElementById('herramientas-resultados');
  const inputBusqueda = document.getElementById('input-busqueda');
  const loading = document.getElementById('loading-overlay');
  const btnImprimir = document.getElementById('btn-imprimir');

  // Estado interno para la búsqueda
  let itemsActuales = [];
  let contextoActual = { areaId: '', grado: '', periodo: '' };

  /**
   * FUNCIÓN MAESTRA: Renderiza cualquier tipo de malla
   */
  function renderizar(items, areaId, grado, periodo) {
    // Guardar para búsqueda posterior
    itemsActuales = items;
    contextoActual = { areaId, grado, periodo };

    // Mostrar contenedor y herramientas
    resPrincipal.classList.remove('ocultar');
    herramientas.classList.remove('herramientas-ocultas');
    
    dibujarHTML(items);
  }

  /**
   * Genera el HTML basado en el tipo de área
   */
  function dibujarHTML(items) {
    containerMalla.innerHTML = '';

    if (!items || items.length === 0) {
      containerMalla.innerHTML = '<p class="sin-resultados">No se hallaron registros coincidentes.</p>';
      return;
    }

    const html = items.map(item => {
      // DECISIÓN: ¿Es área académica o socioemocional pura?
      if (contextoActual.areaId === "proyecto-socioemocional") {
        return plantillaSocioemocional(item);
      } else {
        return plantillaAcademica(item, contextoActual.grado, contextoActual.periodo);
      }
    }).join('');

    containerMalla.innerHTML = html;
  }

  /**
   * PLANTILLA: Áreas del Núcleo Común (Matemáticas, Lenguaje, etc.)
   */
  function plantillaAcademica(item, grado, periodo) {
    // Cruce de datos con la Cátedra ECO (Integración)
    const areaSocioNombre = "Proyecto Socioemocional";
    const tipoMalla = window.APP_CONFIG.TIPO_MALLA;
    const socioData = window.MallasData?.[areaSocioNombre]?.[grado]?.[tipoMalla]?.periodos?.[periodo];
    const infoSocio = socioData && socioData.length > 0 ? socioData[0] : null;

    // Formateo de listas
    const dbaHTML = Array.isArray(item.dba) ? item.dba.join('<br><br>') : (item.dba || '');
    const evidenciasHTML = Array.isArray(item.evidencias) ? item.evidencias.join('<br><br>') : (item.evidencias || '');
    const saberesHTML = Array.isArray(item.saberes) ? item.saberes.join(' • ') : (item.saberes || '');

    // Bloque ECO Integrado
    let bloqueECO = '';
    if (infoSocio) {
      const habs = infoSocio.Habilidades ? infoSocio.Habilidades.map(h => `<div>${h}</div>`).join('') : '';
      const evids = infoSocio.evidencias_de_desempeno ? infoSocio.evidencias_de_desempeno.map(e => `<div>${e}</div>`).join('') : '';
      
      bloqueECO = `
        <div class="fila-separador-eco">Responsabilidad Socioemocional Proyecto ECO</div>
        <div class="seccion-eco-integrada">
          <div class="eco-badge">Cátedra ECO</div>
          <div class="campo"><strong>Eje Central:</strong> ${infoSocio.eje_central || ''}</div>
          <div class="campo"><strong>Habilidades:</strong> ${habs}</div>
          <div class="campo"><strong>Evidencias ECO:</strong> ${evids}</div>
        </div>
      `;
    }

    return `
      <div class="item-malla">
        <h3>${item.componente || 'General'}</h3>
        <div class="item-malla-contenido">
          ${item.estandar ? `<div class="campo"><strong>Estándar:</strong><div>${item.estandar}</div></div>` : ''}
          ${dbaHTML ? `<div class="campo"><strong>DBA:</strong><div>${dbaHTML}</div></div>` : ''}
          ${evidenciasHTML ? `<div class="campo"><strong>Evidencias:</strong><div>${evidenciasHTML}</div></div>` : ''}
          ${saberesHTML ? `<div class="campo"><strong>Saberes:</strong><div>${saberesHTML}</div></div>` : ''}
          ${item.tareas_dce ? `<div class="campo"><strong>Tareas DCE:</strong><div>${item.tareas_dce}</div></div>` : ''}
          ${bloqueECO}
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
    const habs = item.Habilidades ? item.Habilidades.map(h => `<li>${h}</li>`).join('') : '';
    const evids = item.evidencias_de_desempeno ? item.evidencias_de_desempeno.map(e => `<li>${e}</li>`).join('') : '';

    return `
      <div class="item-malla socioemocional">
        <h3>${item.competencia || 'Competencia ECO'}</h3>
        <div class="item-malla-contenido">
          ${item.competencia_anual ? `<div class="campo"><strong>Comp. Anual:</strong><div>${item.competencia_anual}</div></div>` : ''}
          ${item.estandar ? `<div class="campo"><strong>Estándar:</strong><div>${item.estandar}</div></div>` : ''}
          ${item.eje_central ? `<div class="campo"><strong>Eje Central:</strong><div>${item.eje_central}</div></div>` : ''}
          ${habs ? `<div class="campo"><strong>Habilidades:</strong><ul>${habs}</ul></div>` : ''}
          ${evids ? `<div class="campo"><strong>Evidencias:</strong><ul>${evids}</ul></div>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * MEJORA 3: Búsqueda en tiempo real
   */
  inputBusqueda.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    
    const filtrados = itemsActuales.filter(item => {
      const contenido = JSON.stringify(item).toLowerCase();
      return contenido.includes(term);
    });

    dibujarHTML(filtrados);
  });

  /**
   * MEJORA 4: Control del Spinner
   */
  function setCargando(estado) {
    if (estado) {
      loading.classList.remove('loading-oculto');
      resPrincipal.classList.add('ocultar');
      herramientas.classList.add('herramientas-ocultas');
    } else {
      loading.classList.add('loading-oculto');
    }
  }

  /**
   * MEJORA 5: Función de Impresión
   */
  btnImprimir.addEventListener('click', () => {
    window.print();
  });

  // Exportar funciones
  return {
    renderizar,
    setCargando
  };

})();
