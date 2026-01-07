// js/render-progresion.js - v6.0 STABLE (Motor de Progresión Premium)

window.ProgresionMotor = (function() {
  
  // Estado interno del visualizador
  let estado = { 
    areaId: '', 
    areaNombre: '', 
    gradoCentral: 0, 
    componente: '', 
    tipo: '4_periodos' 
  };

  // Referencias a elementos del DOM
  const overlay = document.getElementById('overlay-progresion');
  const btnCerrar = document.getElementById('btn-cerrar-progresion');
  const btnPrev = document.getElementById('prog-prev');
  const btnNext = document.getElementById('prog-next');
  
  const txtArea = document.getElementById('prog-area-txt');
  const contPrev = document.getElementById('cont-grado-prev');
  const contActual = document.getElementById('cont-grado-actual');
  const contNext = document.getElementById('cont-grado-next');
  
  // Contenedores de columnas para aplicar clases de resaltado
  const colPrev = document.getElementById('col-grado-prev');
  const colActual = document.getElementById('col-grado-actual');
  const colNext = document.getElementById('col-grado-next');

  /**
   * Abre el modal de progresión e inicializa la carga
   */
  async function abrir(areaNombre, grado, componente) {
    const areaId = Object.keys(window.APP_CONFIG.AREAS).find(k => window.APP_CONFIG.AREAS[k].nombre === areaNombre);
    
    estado.areaId = areaId;
    estado.areaNombre = areaNombre;
    estado.gradoCentral = parseInt(grado);
    estado.componente = componente;
    estado.tipo = window.APP_CONFIG.TIPO_MALLA;
    
    overlay.style.display = 'flex';
    overlay.classList.add('mostrar-flex');
    
    renderizar();
  }

  function cerrar() {
    overlay.style.display = 'none';
    overlay.classList.remove('mostrar-flex');
  }

  /**
   * Orquesta la distribución de datos en las 3 columnas
   */
  function renderizar() {
    const g = estado.gradoCentral;
    txtArea.textContent = `${estado.areaNombre.toUpperCase()} - COMPONENTE: ${estado.componente}`;

    // Limpiar clases de resaltado
    colPrev.classList.remove('actual');
    colActual.classList.add('actual'); // Siempre resaltamos la columna central
    colNext.classList.remove('actual');

    // LÓGICA ESPECIAL: PUENTE DE PREESCOLAR
    if (g <= 0) {
      // En preescolar (0 o -1), forzamos una vista de 2 o 3 columnas que incluya Grado 1°
      if (g === -1) { // Jardín
        dibujarColumna(contPrev, null); 
        dibujarColumna(contActual, "-1");
        dibujarColumna(contNext, "0");
      } else { // Transición
        dibujarColumna(contPrev, "-1");
        dibujarColumna(contActual, "0");
        dibujarColumna(contNext, "1");
        // Etiqueta especial para el Puente
        colNext.querySelector('.col-header').textContent = "Grado 1° (Puente)";
      }
      btnPrev.disabled = (g === -1);
      btnNext.disabled = false;
    } 
    else {
      // LÓGICA ESTÁNDAR: GRADO ANTERIOR - ACTUAL - SIGUIENTE
      colNext.querySelector('.col-header').textContent = formatearNombre(String(g + 1));
      
      const gPrev = (g - 1 < -1) ? null : String(g - 1);
      const gActual = String(g);
      const gNext = (g + 1 > 11) ? null : String(g + 1);
      
      dibujarColumna(contPrev, gPrev);
      dibujarColumna(contActual, gActual);
      dibujarColumna(contNext, gNext);
      
      btnPrev.disabled = (g <= -1);
      btnNext.disabled = (g >= 11);
    }
  }

  /**
   * Dibuja el contenido de una columna específica
   */
  function dibujarColumna(contenedor, gradoStr) {
    const header = contenedor.previousElementSibling;
    contenedor.innerHTML = '';
    
    if (gradoStr === null) {
      header.textContent = "---";
      contenedor.innerHTML = '<p style="text-align:center; color:#999; margin-top:20px;">Fin de la secuencia.</p>';
      return;
    }

    header.textContent = formatearNombre(gradoStr);
    
    // Determinamos si mostramos DBA o Estándares
    // Regla: Preescolar (-1, 0) siempre muestra DBA. Primaria/Bachillerato muestra Estándares.
    const esPreescolar = (gradoStr === "0" || gradoStr === "-1");
    const datos = obtenerAprendizajesAnuales(gradoStr, esPreescolar);
    
    if (datos.length === 0) {
      contenedor.innerHTML = `<p style="text-align:center; color:#888; padding:20px;">
        <em style="font-size:0.9rem;">Información en proceso de carga o no disponible para este componente.</em>
      </p>`;
    } else {
      datos.forEach(texto => {
        const div = document.createElement('div');
        div.className = 'prog-estandar-item';
        div.innerHTML = esPreescolar ? `<strong>DBA:</strong> ${texto}` : texto;
        contenedor.appendChild(div);
      });
    }
  }

  /**
   * Extrae y filtra los aprendizajes del JSON en memoria
   */
  function obtenerAprendizajesAnuales(gradoStr, esPreescolar) {
    const malla = window.MallasData?.[estado.areaNombre]?.[gradoStr]?.[estado.tipo];
    if (!malla || !malla.periodos) return [];
    
    let acumulado = [];
    Object.keys(malla.periodos).forEach(p => {
      malla.periodos[p].forEach(it => {
        // Filtro por componente (excepto en el puente de transición a primero que es global)
        const mismoComponente = (it.componente === estado.componente || it.competencia === estado.componente);
        
        if (mismoComponente || (estado.gradoCentral === 0 && gradoStr === "1")) {
          if (esPreescolar) {
            // Extraer DBAs
            if (it.dba) {
              if (Array.isArray(it.dba)) acumulado.push(...it.dba);
              else acumulado.push(it.dba);
            }
          } else {
            // Extraer Estándares
            if (it.estandar) acumulado.push(it.estandar);
          }
        }
      });
    });
    
    // Eliminar duplicados y limpiar textos
    return [...new Set(acumulado)].filter(t => t && t.trim() !== "");
  }

  function formatearNombre(g) {
    if (g === "0") return "Transición (0)";
    if (g === "-1") return "Jardín (-1)";
    return `Grado ${g}°`;
  }

  // --- EVENTOS DE NAVEGACIÓN ---

  btnPrev.onclick = async () => {
    if (estado.gradoCentral > -1) {
      estado.gradoCentral--;
      window.RenderEngine.setCargando(true);
      // Aseguramos que los datos del nuevo "vecino" estén cargados
      await asegurarDatosGrado(estado.areaId, String(estado.gradoCentral - 1));
      renderizar();
      window.RenderEngine.setCargando(false);
    }
  };

  btnNext.onclick = async () => {
    if (estado.gradoCentral < 11) {
      estado.gradoCentral++;
      window.RenderEngine.setCargando(true);
      await asegurarDatosGrado(estado.areaId, String(estado.gradoCentral + 1));
      renderizar();
      window.RenderEngine.setCargando(false);
    }
  };

  btnCerrar.onclick = cerrar;

  return { abrir };
})();
