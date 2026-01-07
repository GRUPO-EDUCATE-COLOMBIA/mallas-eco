// FILE: js/render-engine.js | VERSION: v6.5 Stable

window.RenderEngine = (function() {
  const containerMalla = document.getElementById('contenedor-malla');

  function validarDato(dato) {
    const mensajeRevision = '<em style="color: #999; font-weight: 400; font-size: 1.1rem;">Información en proceso de revisión...</em>';
    if (dato === null || dato === undefined || dato === "") return mensajeRevision;
    if (Array.isArray(dato)) return dato.length > 0 ? dato.join('<br><br>') : mensajeRevision;
    return dato;
  }

  function renderizar(items, areaId, grado, periodo) {
    const herramientas = document.getElementById('herramientas-resultados');
    if (herramientas) herramientas.classList.add('mostrar-flex');
    
    if (!containerMalla) return;

    containerMalla.innerHTML = items.map(item => {
      if (areaId === "proyecto-socioemocional") {
        return plantillaSocioemocional(item, grado);
      } else {
        return plantillaAcademica(item, areaId, grado, periodo);
      }
    }).join('');
  }

  /**
   * PLANTILLA ACADÉMICA CON FRANJAS DE INTEGRACIÓN
   */
  function plantillaAcademica(item, areaId, grado, periodo) {
    const tipo = window.APP_CONFIG.TIPO_MALLA;
    const nombreArea = window.APP_CONFIG.AREAS[areaId].nombre;
    const colorArea = window.APP_CONFIG.AREAS[areaId].color;

    // DATA JOINING: Capa DCE
    const llaveT = `Tareas_DCE_${nombreArea}`;
    const dceData = window.MallasData[llaveT]?.[grado]?.[tipo];
    const dcePer = dceData?.periodos?.find(p => String(p.periodo_id) === String(periodo));
    const infoDCE = dcePer?.componentes?.find(c => c.nombre === (item.componente || item.competencia));

    // DATA JOINING: Capa ECO
    const nombreEco = window.APP_CONFIG.AREAS["proyecto-socioemocional"].nombre;
    const ecoData = window.MallasData[nombreEco]?.[grado]?.[tipo];
    const ecoPer = ecoData?.periodos?.[periodo];
    const infoECO = ecoPer && ecoPer.length > 0 ? ecoPer[0] : null;

    return `
      <div class="item-malla">
        <!-- FRANJA DE TÍTULO PRINCIPAL (ACADÉMICA) -->
        <div class="franja-titulo-principal" style="background-color: ${colorArea};">
            ${item.componente || item.competencia || 'General'}
        </div>
        
        <div class="item-malla-contenido">
          <!-- BLOQUE ACADÉMICO -->
          <div class="campo"><strong>Estándar Curricular:</strong><div>${validarDato(item.estandar)}</div></div>
          <div class="campo"><strong>DBA:</strong><div>${validarDato(item.dba)}</div></div>
          <div class="campo"><strong>Evidencias de Aprendizaje:</strong><div>${validarDato(item.evidencias)}</div></div>
          <div class="campo"><strong>Saberes / Contenidos:</strong><div>${validarDato(item.saberes)}</div></div>

          <!-- FRANJA INTEGRACIÓN DCE -->
          <div class="franja-integracion integracion-dce">
            <span class="franja-icono">💡</span> GUÍA DIDÁCTICA: ${infoDCE ? infoDCE.la_estrategia : 'En proceso'}
          </div>
          <div class="contenedor-integracion" style="border-left: 8px solid #54BBAB;">
            <div class="campo"><strong>Reto Sugerido:</strong><div>${validarDato(infoDCE?.un_reto_sugerido)}</div></div>
            <div class="campo"><strong>Ruta de Exploración:</strong>
                <ul style="margin-left:25px; list-style:square;">
                    <li><strong>Explorar:</strong> ${validarDato(infoDCE?.ruta_de_exploracion?.explorar)}</li>
                    <li><strong>Visual:</strong> ${validarDato(infoDCE?.ruta_de_exploracion?.visual)}</li>
                    <li><strong>Producción:</strong> ${validarDato(infoDCE?.ruta_de_exploracion?.produccion)}</li>
                </ul>
            </div>
            <div class="campo"><strong>Para Pensar:</strong><div>${validarDato(infoDCE?.para_pensar)}</div></div>
            <div class="campo"><strong>Pistas del Éxito:</strong><div>${validarDato(infoDCE?.pistas_del_exito)}</div></div>
            <div class="campo"><strong>Un Refuerzo:</strong><div>${validarDato(infoDCE?.un_refuerzo)}</div></div>
          </div>

          <!-- FRANJA INTEGRACIÓN ECO -->
          <div class="franja-integracion integracion-eco">
            <span class="franja-icono">🧠</span> RESPONSABILIDAD SOCIOEMOCIONAL ECO
          </div>
          <div class="contenedor-integracion" style="border-left: 8px solid #9B7BB6;">
            <div class="campo"><strong>Eje Central:</strong><div>${validarDato(infoECO?.eje_central)}</div></div>
            <div class="campo"><strong>Habilidades a Desarrollar:</strong><div>${validarDato(infoECO?.Habilidades)}</div></div>
            <div class="campo"><strong>Evidencias de Desempeño:</strong><div>${validarDato(infoECO?.evidencias_de_desempeno)}</div></div>
          </div>

          <div style="margin-top: 2rem; text-align: center;">
            <a href="eco/diccionario/eco_dic_${grado}.html" target="_blank" class="btn-eco-dic" 
               style="background:var(--eco-teal); color:white; padding:15px 25px; text-decoration:none; border-radius:8px; font-weight:700;">
               Consultar Diccionario ECO
            </a>
          </div>
        </div>
      </div>
    `;
  }

  function plantillaSocioemocional(item, grado) {
    return `
      <div class="item-malla">
        <div class="franja-titulo-principal" style="background-color: var(--eco-purple);">
            ${item.competencia || 'Competencia Socioemocional'}
        </div>
        <div class="item-malla-contenido">
          <div class="campo"><strong>Estandar de Formación:</strong> <div>${validarDato(item.estandar)}</div></div>
          <div class="campo"><strong>Eje Central:</strong> <div>${validarDato(item.eje_central)}</div></div>
          <div class="campo"><strong>Habilidades:</strong> <div style="background:#f8f4fb; padding:20px; border-radius:10px; border:1px solid #eee;">${validarDato(item.Habilidades)}</div></div>
          <div class="campo"><strong>Evidencias ECO:</strong> <div>${validarDato(item.evidencias_de_desempeno)}</div></div>
          <div style="text-align:center; margin-top:2rem;">
            <a href="eco/diccionario/eco_dic_${grado}.html" target="_blank" class="btn-eco-dic" 
               style="background:var(--eco-teal); color:white; padding:15px 25px; text-decoration:none; border-radius:8px; font-weight:700;">
               Consultar Diccionario ECO
            </a>
          </div>
        </div>
      </div>
    `;
  }

  function setCargando(estado) { 
    const loader = document.getElementById('loading-overlay');
    if (loader) loader.classList.toggle('mostrar-flex', estado);
  }

  return { renderizar, setCargando };
})();
// END OF FILE: js/render-engine.js | VERSION: v6.5 Stable
