// FILE: js/render-engine.js | VERSION: v7.5 Stable
window.RenderEngine = (function() {
  const containerMalla = document.getElementById('contenedor-malla');

  function validarDato(dato) {
    const msg = '<em style="color:#999;font-weight:400;">Información en proceso de revisión...</em>';
    if (!dato || dato === "") return msg;
    if (Array.isArray(dato)) return dato.length > 0 ? dato.join('<br><br>') : msg;
    return dato;
  }

  function renderizar(items, areaId, grado, periodo) {
    const herramientas = document.getElementById('herramientas-resultados');
    if (herramientas) herramientas.classList.add('mostrar-flex');
    if (!containerMalla) return;

    containerMalla.innerHTML = items.map(item => {
      if (areaId === "proyecto-socioemocional") return plantillaSocioemocional(item, grado);
      return plantillaAcademica(item, areaId, grado, periodo);
    }).join('');
  }

  function plantillaAcademica(item, areaId, grado, periodo) {
    const tipo = window.APP_CONFIG.TIPO_MALLA;
    const config = window.APP_CONFIG.AREAS[areaId];
    const llaveNormal = normalizarTexto(config.nombre);
    
    const llaveDCE = `tareas_dce_${llaveNormal}`;
    const dceData = window.MallasData[llaveDCE]?.[grado]?.[tipo];
    const dcePer = dceData?.periodos?.find(p => String(p.periodo_id) === String(periodo));
    const infoDCE = dcePer?.componentes?.find(c => normalizarTexto(c.nombre) === normalizarTexto(item.componente || item.competencia));

    const llaveEco = normalizarTexto(window.APP_CONFIG.AREAS["proyecto-socioemocional"].nombre);
    const ecoPer = window.MallasData[llaveEco]?.[grado]?.[tipo]?.periodos?.[periodo];
    // PRUEBA DE ESCRITORIO: Protección contra acceso a propiedad '0' de undefined
    const infoECO = (ecoPer && Array.isArray(ecoPer) && ecoPer.length > 0) ? ecoPer[0] : null;

    return `
      <div class="item-malla">
        <div class="franja-titulo-principal" style="background-color: ${config.color};">${item.componente || item.competencia || 'General'}</div>
        <div class="item-malla-contenido">
          <div class="campo"><strong>Estándar Curricular:</strong><div>${validarDato(item.estandar)}</div></div>
          <div class="campo"><strong>DBA:</strong><div>${validarDato(item.dba)}</div></div>
          <div class="campo"><strong>Evidencias de Aprendizaje:</strong><div>${validarDato(item.evidencias)}</div></div>
          <div class="campo"><strong>Saberes / Contenidos:</strong><div>${validarDato(item.saberes)}</div></div>

          <div class="franja-integracion integracion-dce"><span style="font-size:1.6rem;margin-right:15px;">💡</span> GUÍA DIDÁCTICA: ${infoDCE ? infoDCE.la_estrategia : 'En proceso'}</div>
          <div class="contenedor-integracion" style="border-left:10px solid var(--eco-green);">
            <div class="campo"><strong>Reto Sugerido:</strong><div>${validarDato(infoDCE?.un_reto_sugerido)}</div></div>
            <div class="campo"><strong>Ruta de Exploración:</strong>
                <ul style="margin-left:25px;list-style:square;">
                    <li><strong>Explorar:</strong> ${validarDato(infoDCE?.ruta_de_exploracion?.explorar)}</li>
                    <li><strong>Visual:</strong> ${validarDato(infoDCE?.ruta_de_exploracion?.visual)}</li>
                    <li><strong>Producción:</strong> ${validarDato(infoDCE?.ruta_de_exploracion?.produccion)}</li>
                </ul>
            </div>
            <div class="campo"><strong>Para Pensar:</strong><div>${validarDato(infoDCE?.para_pensar)}</div></div>
            <div class="campo"><strong>Pistas del Éxito:</strong><div>${validarDato(infoDCE?.pistas_del_exito)}</div></div>
            <div class="campo"><strong>Un Refuerzo:</strong><div>${validarDato(infoDCE?.un_refuerzo)}</div></div>
          </div>

          <div class="franja-integracion integracion-eco"><span style="font-size:1.6rem;margin-right:15px;">🧠</span> RESPONSABILIDAD SOCIOEMOCIONAL ECO</div>
          <div class="contenedor-integracion" style="border-left:10px solid var(--eco-purple);">
            <div class="campo"><strong>Eje Central:</strong><div>${validarDato(infoECO?.eje_central)}</div></div>
            <div class="campo"><strong>Habilidades a Desarrollar:</strong><div>${validarDato(infoECO?.Habilidades)}</div></div>
            <div class="campo"><strong>Evidencias de Desempeño:</strong><div>${validarDato(infoECO?.evidencias_de_desempeno)}</div></div>
          </div>
          <div style="text-align:center;margin-top:2.5rem;"><a href="eco/diccionario/eco_dic_${grado}.html" target="_blank" class="btn-eco-dic">Consultar Diccionario ECO</a></div>
        </div>
      </div>`;
  }

  function plantillaSocioemocional(item, grado) {
    return `<div class="item-malla">
        <div class="franja-titulo-principal" style="background-color: var(--eco-purple);">${item.competencia || 'Competencia'}</div>
        <div class="item-malla-contenido">
          <div class="campo"><strong>Estandar:</strong> <div>${validarDato(item.estandar)}</div></div>
          <div class="campo"><strong>Eje Central:</strong> <div>${validarDato(item.eje_central)}</div></div>
          <div class="campo"><strong>Habilidades:</strong> <div style="background:#f9f6fc;padding:20px;border-radius:12px;border:1px solid #eee;">${validarDato(item.Habilidades)}</div></div>
          <div class="campo"><strong>Evidencias:</strong> <div>${validarDato(item.evidencias_de_desempeno)}</div></div>
          <div style="text-align:center;margin-top:2.5rem;"><a href="eco/diccionario/eco_dic_${grado}.html" target="_blank" class="btn-eco-dic">Consultar Diccionario ECO</a></div>
        </div>
      </div>`;
  }

  function setCargando(e) { 
    const l = document.getElementById('loading-overlay');
    if (l) l.classList.toggle('mostrar-flex', e);
  }

  return { renderizar, setCargando };
})();
// END OF FILE: js/render-engine.js | VERSION: v7.5 Stable
