// js/render-progresion.js

/**
 * MOTOR DE PROGRESIÓN v4.0
 * Gestiona la alineación vertical de aprendizajes (3 grados simultáneos).
 */
window.ProgresionMotor = (function() {
  
  let estado = { area: '', gradoCentral: 0, componente: '', tipo: '4_periodos' };

  // Referencias DOM
  const overlay = document.getElementById('overlay-progresion');
  const btnCerrar = document.getElementById('btn-cerrar-progresion');
  const btnPrev = document.getElementById('prog-prev');
  const btnNext = document.getElementById('prog-next');
  
  const txtArea = document.getElementById('prog-area-txt');
  const txtComp = document.getElementById('prog-comp-txt');
  
  const contPrev = document.getElementById('cont-grado-prev');
  const contActual = document.getElementById('cont-grado-actual');
  const contNext = document.getElementById('cont-grado-next');
  
  const colNext = contNext.closest('.col-prog'); // Columna Siguiente

  const labelPrev = contPrev.previousElementSibling;
  const labelActual = contActual.previousElementSibling;
  const labelNext = contNext.previousElementSibling;

  /**
   * Abre la vista de progresión
   */
  function abrir(area, grado, componente) {
    estado.area = area;
    estado.gradoCentral = parseInt(grado);
    estado.componente = componente;
    
    // Asegurar limpieza de clases previas
    overlay.classList.remove('ocultar'); 
    overlay.classList.add('mostrar'); // Activa display: flex !important
    
    renderizar();
  }

  function cerrar() {
    overlay.classList.remove('mostrar');
  }

  /**
   * Procesa y dibuja la comparativa
   */
  function renderizar() {
    const g = estado.gradoCentral;
    txtArea.textContent = estado.area;
    txtComp.textContent = `COMPONENTE: ${estado.componente}`;

    // --- LÓGICA DE PUENTE PEDAGÓGICO (Preescolar vs Primaria) ---
    if (g <= 0) {
      // Modo Preescolar Integral: 2 Columnas
      colNext.style.display = 'none'; 
      
      if (g === -1) { // JARDÍN
        dibujarColumna(contPrev, labelPrev, "-1");
        dibujarColumna(contActual, labelActual, "0");
      } else { // TRANSICIÓN
        dibujarColumna(contPrev, labelPrev, "0");
        dibujarColumna(contActual, labelActual, "1");
        labelActual.textContent = "Grado 1° (Puente)";
      }
      
      btnPrev.disabled = (g === -1);
      btnNext.disabled = true; // Bloqueo para forzar selección en 1°
      document.querySelector('.info-ciclo').textContent = "Secuencia de Preescolar Integral";

    } else {
      // Modo Primaria/Bachillerato: 3 Columnas Normales
      colNext.style.display = 'flex';
      
      const gPrev = (g - 1 < -1) ? null : String(g - 1);
      const gActual = String(g);
      const gNext = (g + 1 > 11) ? null : String(g + 1);

      dibujarColumna(contPrev, labelPrev, gPrev);
      dibujarColumna(contActual, labelActual, gActual);
      dibujarColumna(contNext, labelNext, gNext);

      btnPrev.disabled = (g <= -1);
      btnNext.disabled = (g >= 11);
      document.querySelector('.info-ciclo').textContent = "Visualizando secuencia de 3 grados";
    }
  }

  /**
   * Dibuja los estándares o DBA en cada columna
   */
  function dibujarColumna(contenedor, etiqueta, gradoStr) {
    contenedor.innerHTML = '';
    if (gradoStr === null) {
      etiqueta.textContent = "---";
      contenedor.innerHTML = '<p class="texto-vacio">Fin de la secuencia curricular.</p>';
      return;
    }

    etiqueta.textContent = formatearNombre(gradoStr);

    const esPreescolar = (gradoStr === "0" || gradoStr === "-1");
    const datos = obtenerDatosAnuales(gradoStr, esPreescolar);

    if (datos.length === 0) {
      contenedor.innerHTML = `<p class="texto-vacio">No hay datos registrados.</p>`;
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
   * Cruce de datos anual (Barrer 4 períodos)
   */
  function obtenerDatosAnuales(gradoStr, esPreescolar) {
    const malla = window.MallasData?.[estado.area]?.[gradoStr]?.[estado.tipo];
    if (!malla || !malla.periodos) return [];

    let acumulado = [];
    Object.keys(malla.periodos).forEach(p => {
      malla.periodos[p].forEach(it => {
        if (esPreescolar) {
          // Preescolar: DBA Integrales
          if (it.dba) {
            if (Array.isArray(it.dba)) acumulado.push(...it.dba);
            else acumulado.push(it.dba);
          }
        } else {
          // Primaria: Estándares por componente
          // PUENTE: Si venimos de Transición hacia 1°, traemos todo.
          if (estado.gradoCentral === 0 && gradoStr === "1") {
            if (it.estandar) acumulado.push(it.estandar);
          } 
          else if (it.componente === estado.componente && it.estandar) {
            acumulado.push(it.estandar);
          }
        }
      });
    });
    return [...new Set(acumulado)];
  }

  function formatearNombre(g) {
    if (g === "0") return "Transición (0)";
    if (g === "-1") return "Jardín (-1)";
    return `Grado ${g}°`;
  }

  // LISTENERS
  btnCerrar.onclick = cerrar;
  btnPrev.onclick = () => { estado.gradoCentral--; renderizar(); };
  btnNext.onclick = () => { estado.gradoCentral++; renderizar(); };

  return { abrir };

})();
