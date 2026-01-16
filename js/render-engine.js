// FILE: js/render-engine.js | VERSION: v10.7 Stable
window.RenderEngine = (function() {
  const containerMalla = document.getElementById('contenedor-malla');

  /**
   * VALIDACIÓN Y FORMATEO DE LISTAS (v10.7)
   * Transforma arreglos en listas con viñetas elegantes
   */
  function validarDato(dato) {
    const msg = '<em style="color:#999;font-weight:400;">Información en proceso de revisión...</em>';
    if (!dato || dato === "") return msg;
    if (Array.isArray(dato)) {
      if (dato.length === 0) return msg;
      return `<ul>${dato.map(linea => `<li>${linea}</li>`).join('')}</ul>`;
    }
    return dato;
  }

  /**
   * FORMATEADOR DE BADGES INTELIGENTES
   * Separa códigos técnicos de DBAs y Evidencias para una estética nacional
   */
  function formatearConBadges(dato) {
    if (!dato) return validarDato(dato);
    const lineas = Array.isArray(dato) ? dato : [dato];
    return lineas.map(linea => {
      const parts = linea.split(':');
      // Detecta si la parte izquierda es un código corto (Badge)
      if (parts.length > 1 && parts[0].trim().length < 25) {
        return `
          <div class="badge-container">
            <span class="badge-id">${parts[0].trim()}</span>
            <div class="badge-text">${parts.slice(1).join(':').trim()}</div>
          </div>`;
      }
      return `<div style="margin-bottom:10px;">${linea}</div>`;
    }).join('');
  }

  /**
   * MOTOR PRINCIPAL DE RENDERIZADO
   */
  function renderizar(items, areaId, grado, periodo) {
    const resSec = document.getElementById('resultados-principal');
    const indicador = document.getElementById('indicador-periodo');
    const configArea = window.APP_CONFIG.AREAS[areaId];

    if (resSec) resSec.classList.add('mostrar-block');
    
    // Gestión del Indicador de Periodo con Zoom-In
    if (indicador && configArea) {
      indicador.style.display = 'block';
      indicador.style.backgroundColor = configArea.color || '#9B7BB6';
      indicador.innerHTML = `Periodo Consultado: ${periodo}°`;
      indicador.classList.remove('animar-zoom');
      void indicador.offsetWidth; // Force reflow
      indicador.classList.add('animar-zoom');
    }

    if (!containerMalla) return;

    // Distribución por tipo de área
    containerMalla.innerHTML = items.map(item => {
      if (areaId === "proyecto-socioemocional") return plantillaSocioemocional(item, grado);
      return plantillaAcademica(item, areaId, grado, periodo);
    }).join('');
  }

  /**
   * PLANTILLA ACADÉMICA (TRÍADA: ACADÉMICO + DCE + ECO)
   */
  function plantillaAcademica(item, areaId, grado, periodo) {
    const tipoMalla = window.APP_CONFIG.TIPO_MALLA;
    const config = window.APP_CONFIG.AREAS[areaId];
    const llaveNormal = normalizarTexto(config.nombre);
    
    // 1. CRUCE DCE (Guía Metodológica - Estructura B)
    const llaveDCE = `tareas_dce_${llaveNormal}`;
    const dceData = window.MallasData[llaveDCE]?.[grado]?.[tipoMalla];
    const dcePer = dceData?.periodos?.find(p => String(p.periodo_id) === String(periodo));
    const rawDCE = dcePer?.guias_por_componente?.find(c => normalizarTexto(c.componente) === normalizarTexto(item.componente || item.competencia));
    const infoDCE = rawDCE?.guia_didactica;

    // 2. CRUCE ECO (Cátedra Socioemocional Nativa v10.7)
    // Se lee directamente el periodo correspondiente del archivo ECO ya cargado
    const llaveEco = normalizarTexto(window.APP_CONFIG.AREAS["proyecto-socioemocional"].nombre);
    const ecoData = window.MallasData[llaveEco]?.[grado]?.[tipoMalla]?.periodos?.[periodo];
    const infoECO = (ecoData && Array.isArray(ecoData) && ecoData.length > 0) ? ecoData[0] : null;

    return `
      <div class="item-malla">
        <!-- FRANJA DE TÍTULO PRINCIPAL -->
        <div class="franja-titulo-principal" style="background-color: ${config.color};">
            ${item.componente || item.competencia || 'General'}
        </div>
        
        <div class="item-malla-contenido">
          <!-- BLOQUE ACADÉMICO -->
          <div class="campo"><strong>Estándar Curricular:</strong><div>${validarDato(item.estandar)}</div></div>
          <div class="campo"><strong>DBA:</strong><div>${formatearConBadges(item.dba)}</div></div>
          <div class="campo"><strong>Evidencias de Aprendizaje:</strong><div>${formatearConBadges(item.evidencias)}</div></div>
          <div class="campo"><strong>Saberes / Contenidos:</strong><div>${validarDato(item.saberes)}</div></div>

          <!-- FICHAS DOBLES DE CIERRE -->
          <div class="contenedor-fichas-cierre">
            
            <!-- FICHA 1: GUÍA DIDÁCTICA (DCE) -->
            <div class="ficha-cierre ficha-dce">
              <div class="ficha-header ficha-header-dce">
                <span>💡</span> GUÍA DIDÁCTICA: ${infoDCE ? infoDCE.la_estrategia : 'En proceso'}
              </div>
              <div class="ficha-body">
                <div class="campo"><strong>Reto Sugerido:</strong><div>${validarDato(infoDCE?.un_reto_sugerido)}</div></div>
                <div class="campo"><strong>Ruta de Exploración:</strong>
                  <ul>
                    <li><strong>Explorar:</strong> ${validarDato(infoDCE?.ruta_de_exploracion?.explorar)}</li>
                    <li><strong>Visual:</strong> ${validarDato(infoDCE?.ruta_de_exploracion?.visual)}</li>
                    <li><strong>Producción:</strong> ${validarDato(infoDCE?.ruta_de_exploracion?.produccion)}</li>
                  </ul>
                </div>
                <div class="campo"><strong>Para Pensar:</strong><div>${validarDato(infoDCE?.para_pensar)}</div></div>
                <div class="campo"><strong>Pistas del Éxito:</strong><div>${validarDato(infoDCE?.pistas_del_exito)}</div></div>
                <div class="campo"><strong>Un Refuerzo:</strong><div>${validarDato(infoDCE?.un_refuerzo)}</div></div>
              </div>
            </div>

            <!-- FICHA 2: RESPONSABILIDAD SOCIOEMOCIONAL ECO (Nativa) -->
            <div class="ficha-cierre ficha-eco">
              <div class="ficha-header ficha-header-eco">
                <span>🧠</span> RESPONSABILIDAD SOCIOEMOCIONAL ECO
              </div>
              <div class="ficha-body">
                <div class="campo"><strong>Eje Central:</strong><div>${validarDato(infoECO?.eje_central)}</div></div>
                <div class="campo"><strong>Habilidades:</strong><div>${validarDato(infoECO?.Habilidades)}</div></div>
                <div class="campo"><strong>Evidencias de Desempeño:</strong><div>${validarDato(infoECO?.evidencias_de_desempeno)}</div></div>
              </div>
            </div>

          </div>

          <!-- BOTÓN RECURSOS DICCIONARIO -->
          <div style="text-align:center; margin-top:2rem;">
            <a href="eco/diccionario/eco_dic_${grado}.html" target="_blank" class="btn-eco-dic">Consultar Diccionario ECO</a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * PLANTILLA PARA ÁREA SOCIOEMOCIONAL PURA
   */
  function plantillaSocioemocional(item, grado) {
    return `
      <div class="item-malla">
        <div class="franja-titulo-principal" style="background-color: var(--eco-purple);">
            ${item.competencia || 'Competencia Socioemocional'}
        </div>
        <div class="item-malla-contenido">
          <div class="campo"><strong>Estandar de Formación:</strong> <div>${validarDato(item.estandar)}</div></div>
          <div class="campo"><strong>Eje Central del Proceso:</strong> <div>${validarDato(item.eje_central)}</div></div>
          <div class="campo"><strong>Habilidades a Fortalecer:</strong> <div style="background:white; padding:20px; border-radius:10px; border:1px solid #eee; border-left:5px solid var(--eco-purple);">${validarDato(item.Habilidades)}</div></div>
          <div class="campo"><strong>Evidencias ECO:</strong> <div>${validarDato(item.evidencias_de_desempeno)}</div></div>
          <div style="text-align:center; margin-top:2rem;">
            <a href="eco/diccionario/eco_dic_${grado}.html" target="_blank" class="btn-eco-dic">Consultar Diccionario ECO</a>
          </div>
        </div>
      </div>
    `;
  }

  return { 
    renderizar, 
    setCargando: (estado) => { 
      const loader = document.getElementById('loading-overlay');
      if (loader) loader.classList.toggle('mostrar-flex', estado);
    } 
  };
})();
