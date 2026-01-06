// js/render-progresion.js

window.ProgresionMotor = (function() {
  
  let estado = { area: '', gradoCentral: 0, componente: '', tipo: '4_periodos' };

  const overlay = document.getElementById('overlay-progresion');
  const btnCerrar = document.getElementById('btn-cerrar-progresion');
  const btnPrev = document.getElementById('prog-prev');
  const btnNext = document.getElementById('prog-next');
  
  const txtArea = document.getElementById('prog-area-txt');
  const txtComp = document.getElementById('prog-comp-txt');
  
  const contPrev = document.getElementById('cont-grado-prev');
  const contActual = document.getElementById('cont-grado-actual');
  const contNext = document.getElementById('cont-grado-next');
  
  const colNext = contNext.closest('.col-prog');

  /**
   * Abre el overlay de progresión
   * Sincronizado con las clases de visibilidad del styles.css v4.1
   */
  function abrir(area, grado, componente) {
    estado.area = area;
    estado.gradoCentral = parseInt(grado);
    estado.componente = componente;
    
    // CORRECCIÓN TÉCNICA: Usamos 'mostrar-flex' para anular el display:none !important
    overlay.classList.add('mostrar-flex');
    renderizar();
  }

  /**
   * Cierra el overlay y limpia el estado visual
   */
  function cerrar() {
    overlay.classList.remove('mostrar-flex');
  }

  /**
   * Renderiza las 3 columnas comparativas
   */
  function renderizar() {
    const g = estado.gradoCentral;
    txtArea.textContent = estado.area;
    txtComp.textContent = `COMPONENTE: ${estado.componente}`;

    // LÓGICA DE PUENTE PEDAGÓGICO (Preescolar a Primaria)
    if (g <= 0) {
      colNext.style.display = 'none'; 
      if (g === -1) { 
        dibujarColumna(contPrev, null, "-1");
        dibujarColumna(contActual, null, "0");
      } else { 
        dibujarColumna(contPrev, null, "0");
        dibujarColumna(contActual, null, "1");
        document.querySelector('#col-grado-actual .col-header').textContent = "Grado 1° (Puente)";
      }
      btnPrev.disabled = (g === -1);
      btnNext.disabled = true; 
      document.querySelector('.info-ciclo').textContent = "Secuencia de Preescolar Integral";
    } else {
      // LÓGICA DE ALINEACIÓN VERTICAL ESTÁNDAR
      colNext.style.display = 'flex';
      const gPrev = (g - 1 < -1) ? null : String(g - 1);
      const gActual = String(g);
      const gNext = (g + 1 > 11) ? null : String(g + 1);
      
      dibujarColumna(contPrev, null, gPrev);
      dibujarColumna(contActual, null, gActual);
      dibujarColumna(contNext, null, gNext);
      
      btnPrev.disabled = (g <= -1);
      btnNext.disabled = (g >= 11);
      document.querySelector('.info-ciclo').textContent = "Visualizando secuencia de 3 grados";
    }
  }

  /**
   * Dibuja el contenido de cada columna individualmente
   */
  function dibujarColumna(contenedor, etiqueta, gradoStr) {
    const header = contenedor.previousElementSibling;
    contenedor.innerHTML = '';
    
    if (gradoStr === null) {
      header.textContent = "---";
      contenedor.innerHTML = '<p class="texto-vacio">Fin de la secuencia.</p>';
      return;
    }

    header.textContent = formatearNombre(gradoStr);
    const esPreescolar = (gradoStr === "0" || gradoStr === "-1");
    const datos = obtenerDatosAnuales(gradoStr, esPreescolar);
    
    if (datos.length === 0) {
      contenedor.innerHTML = `<p class="texto-vacio">No hay datos registrados para este componente.</p>`;
    } else {
      datos.forEach(texto => {
        const div = document.createElement('div');
        div.className = 'prog-estandar-item';
        // En preescolar mostramos DBAs, en primaria Estándares
        div.innerHTML = esPreescolar ? `<strong>DBA:</strong> ${texto}` : texto;
        contenedor.appendChild(div);
      });
    }
  }

  /**
   * Filtra y deduplica los aprendizajes de todo el año
   */
  function obtenerDatosAnuales(gradoStr, esPreescolar) {
    const malla = window.MallasData?.[estado.area]?.[gradoStr]?.[estado.tipo];
    if (!malla || !malla.periodos) return [];
    
    let acumulado = [];
    Object.keys(malla.periodos).forEach(p => {
      malla.periodos[p].forEach(it => {
        if (esPreescolar) {
          if (it.dba) {
            if (Array.isArray(it.dba)) acumulado.push(...it.dba);
            else acumulado.push(it.dba);
          }
        } else {
          // Si estamos viendo el puente desde transición, mostramos todo el estándar de 1°
          if (estado.gradoCentral === 0 && gradoStr === "1") {
            if (it.estandar) acumulado.push(it.estandar);
          } 
          // Si no, filtramos estrictamente por el componente seleccionado
          else if (it.componente === estado.componente && it.estandar) {
            acumulado.push(it.estandar);
          }
        }
      });
    });
    // Deduplicación para evitar ruido visual
    return [...new Set(acumulado)];
  }

  function formatearNombre(g) {
    if (g === "0") return "Transición (0)";
    if (g === "-1") return "Jardín (-1)";
    return `Grado ${g}°`;
  }

  // Vinculación de eventos de control
  btnCerrar.onclick = cerrar;
  btnPrev.onclick = () => { estado.gradoCentral--; renderizar(); };
  btnNext.onclick = () => { estado.gradoCentral++; renderizar(); };

  return { abrir };
})();
