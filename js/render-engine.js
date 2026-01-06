// js/render-engine.js - v5.5 (Motor de Renderizado con Validador de Datos)

window.RenderEngine = (function() {

  const containerMalla = document.getElementById('contenedor-malla');
  const resPrincipal = document.getElementById('resultados-principal');
  const herramientas = document.getElementById('herramientas-resultados');
  const loading = document.getElementById('loading-overlay');

  let contextoActual = { areaId: '', grado: '', periodo: '' };

  /**
   * Helper: Valida el contenido y devuelve el aviso de "En proceso" si es nulo/vacío
   */
  function validarDato(valor) {
    if (!valor || valor === "" || (Array.isArray(valor) && valor.length === 0)) {
      return `<span class="texto-atenuado">Información en proceso de revisión</span>`;
    }
    return valor;
  }

  function renderizar(items, areaId, grado, periodo) {
    contextoActual = { areaId, grado, periodo };
    resPrincipal.classList.add('mostrar-block');
    herramientas.classList.add('mostrar-flex');
    dibujarHTML(items);
    vincularAcordeones();
  }

  function dibujarHTML(items) {
    containerMalla.innerHTML = '';
    if (!items || items.length === 0) {
      containerMalla.innerHTML = '<p class="sin-resultados">No se hallaron registros coincidentes.</p>';
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
   * PLANTILLA ACADÉMICA: Conexión con DCE Estructurado y Validación de Datos
   */
  function plantillaAcademica(item, grado, periodo) {
    const tipo = window.APP_CONFIG.TIPO_MALLA;
    
    // 1. Cruce ECO
    const socioData = window.MallasData?.["Proyecto Socioemocional"]?.[grado]?.[tipo]?.periodos?.[periodo];
    const infoSocio = socioData && socioData.length > 0 ? socioData[0] : null;

    // 2. Cruce DCE (Estructura de Arreglos)
    const nombreArea = window.APP_CONFIG.AREAS[contextoActual.areaId].nombre;
    const llaveT = `Tareas_DCE_${nombreArea}`;
    const dceCompleto = window.MallasData?.[llaveT]?.[grado]?.[tipo];
    const dcePeriodoActual = dceCompleto?.periodos?.find(p => String(p.periodo_id) === String(periodo));
    
    const norm = (t) => String(t).toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const compBuscado = norm(item.componente || '');
    const infoDCE = dcePeriodoActual?.componentes?.find(c => norm(c.nombre) === compBuscado);

    return `
      <div class="item-malla">
        <h3>${item.componente || 'General'}</h3>
        <div class="item-malla-contenido">
          <div class="campo"><strong>Estándar Curricular:</strong><div>${validarDato(item.estandar)}</div></div>
          <div class="campo"><strong>DBA:</strong><div>${Array.isArray(item.dba) ? item.dba.join('<br><br>') : validarDato(item.dba)}</div></div>
          <div class="campo"><strong>Evidencias:</strong><div>${Array.isArray(item.evidencias) ? item.evidencias.join('<br><br>') : validarDato(item.evidencias)}</div></div>
          <div class="campo"><strong>Saberes:</strong><div>${Array.isArray(item.saberes) ? item.saberes.join(' • ') : validarDato(item.saberes)}</div></div>

          <!-- ACORDEÓN DCE CON VALIDACIÓN INTERNA -->
          ${infoDCE ? `
            <div class="contenedor-acordeon">
              <div class="acordeon-header">
                <div class="acordeon-icono-btn dce-color">💡</div>
                <div class="acordeon-titulo dce-texto">Orientaciones: ${validarDato(infoDCE.la_estrategia)}</div>
              </div>
              <div class="acordeon-panel">
                <div class="contenido-interno">
                  <div class="campo"><strong>Reto Sugerido:</strong> <div>${validarDato(infoDCE.un_reto_sugerido)}</div></div>
                  
                  <div class="campo"><strong>Ruta de Exploración:</strong>
                    <ul style="margin-left: 1.5rem; margin-top: 0.5rem; list-style: circle;">
                      <li><strong>Explorar:</strong> ${validarDato(infoDCE.ruta_de_exploracion?.explorar)}</li>
                      <li><strong>Visualizar:</strong> ${validarDato(infoDCE.ruta_de_exploracion?.visual)}</li>
                      <li><strong>Producir:</strong> ${validarDato(infoDCE.ruta_de_exploracion?.produccion)}</li>
                    </ul>
                  </div>

                  <div class="campo"><strong>Para Pensar:</strong>
                    <div style="font-style: italic; color: #555;">
                      ${infoDCE.para_pensar && infoDCE.para_pensar.length > 0 
                        ? infoDCE.para_pensar.map(p => `• ${p}`).join('<br>') 
                        : `<span class="texto-atenuado">Información en proceso de revisión</span>`}
                    </div>
                  </div>

                  <div style="display: flex; gap: 1rem; margin-top: 1rem; border-top: 1px dashed #ccc; padding-top: 1rem;">
                    <div style="flex: 1;"><strong>Pistas del Éxito:</strong><br><small>${validarDato(infoDCE.pistas_del_exito)}</small></div>
                    <div style="flex: 1;"><strong>Refuerzo:</strong><br><small>${validarDato(infoDCE.un_refuerzo)}</small></div>
                  </div>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- ACORDEÓN ECO -->
          ${infoSocio ? `
            <div class="contenedor-acordeon">
              <div class="acordeon-header">
                <div class="acordeon-icono-btn eco-color">🧠</div>
                <div class="acordeon-titulo eco-texto">Responsabilidad ECO</div>
              </div>
              <div class="acordeon-panel">
                <div class="contenido-interno">
                  <div class="eco-badge">Cátedra ECO</div>
                  <div class="campo"><strong>Eje Central:</strong><div>${validarDato(infoSocio.eje_central)}</div></div>
                  <div class="campo"><strong>Habilidades:</strong><div>${infoSocio.Habilidades ? infoSocio.Habilidades.join('<br>') : ''}</div></div>
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

  function plantillaSocioemocional(item) {
    return `
      <div class="item-malla">
        <h3>${item.competencia || 'Competencia ECO'}</h3>
        <div class="item-malla-contenido">
          <div class="campo"><strong>Eje Central:</strong><div>${validarDato(item.eje_central)}</div></div>
          <div class="campo"><strong>Habilidades:</strong><div>${item.Habilidades ? item.Habilidades.join('<br>') : ''}</div></div>
          <div class="campo"><strong>Evidencias:</strong><div>${item.evidencias_de_desempeno ? item.evidencias_de_desempeno.join('<br>') : ''}</div></div>
        </div>
      </div>
    `;
  }

  function vincularAcordeones() {
    document.querySelectorAll('.acordeon-header').forEach(header => {
      header.onclick = function() {
        const panel = this.nextElementSibling;
        const estaAbierto = panel.classList.contains('abierto');
        const padre = this.closest('.item-malla-contenido');
        padre.querySelectorAll('.acordeon-panel').forEach(p => p.classList.remove('abierto'));
        if (!estaAbierto) panel.classList.add('abierto');
      };
    });
  }

  function setCargando(estado) {
    if (!loading) return;
    if (estado) {
      loading.classList.add('mostrar-flex');
      resPrincipal.classList.remove('mostrar-block');
    } else {
      loading.classList.remove('mostrar-flex');
    }
  }

  return { renderizar, setCargando };
})();
