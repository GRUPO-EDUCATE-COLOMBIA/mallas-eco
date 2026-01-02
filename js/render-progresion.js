// js/render-progresion.js

window.ProgresionMotor = (function() {
  
  let estado = {
    area: '',
    gradoCentral: 0,
    componente: '',
    tipoMalla: '4_periodos'
  };

  const overlay = document.getElementById('overlay-progresion');
  const btnCerrar = document.getElementById('btn-cerrar-progresion');
  const btnPrev = document.getElementById('prog-prev');
  const btnNext = document.getElementById('prog-next');
  const txtArea = document.getElementById('prog-area-txt');
  const txtComp = document.getElementById('prog-comp-txt');
  
  const contPrev = document.getElementById('cont-grado-prev');
  const contActual = document.getElementById('cont-grado-actual');
  const contNext = document.getElementById('cont-grado-next');
  
  const colPrev = document.getElementById('col-grado-prev');
  const colActual = document.getElementById('col-grado-actual');
  const colNext = document.getElementById('col-grado-next');

  const labelPrev = document.querySelector('#col-grado-prev .col-header');
  const labelActual = document.querySelector('#col-grado-actual .col-header');
  const labelNext = document.querySelector('#col-grado-next .col-header');

  function abrir(area, grado, componente) {
    estado.area = area;
    estado.gradoCentral = parseInt(grado);
    estado.componente = componente;
    overlay.classList.remove('ocultar');
    renderizar();
  }

  function cerrar() {
    overlay.classList.add('ocultar');
  }

  function renderizar() {
    const g = estado.gradoCentral;
    txtArea.textContent = estado.area;
    txtComp.textContent = estado.componente;

    // --- LÓGICA DE EXCEPCIÓN PARA PREESCOLAR ---
    if (g <= 0) {
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
      btnNext.disabled = true; 
      
      const msg = g === 0 
        ? "Para avanzar a 2°, seleccione un componente en Grado 1°."
        : "Secuencia de Preescolar Integral.";
      document.querySelector('.info-ciclo').textContent = msg;

    } else {
      colNext.style.display = 'flex';
      
      const gPrev = calcularGradoRelativo(g, -1);
      const gActual = String(g);
      const gNext = calcularGradoRelativo(g, 1);

      dibujarColumna(contPrev, labelPrev, gPrev);
      dibujarColumna(contActual, labelActual, gActual);
      dibujarColumna(contNext, labelNext, gNext);

      btnPrev.disabled = false;
      btnNext.disabled = (g >= 11);
      document.querySelector('.info-ciclo').textContent = "Visualizando secuencia de 3 grados";
    }
  }

  function dibujarColumna(contenedor, etiqueta, gradoStr) {
    contenedor.innerHTML = '';
    if (gradoStr === null) {
      etiqueta.textContent = "---";
      return;
    }

    etiqueta.textContent = formatearNombreGrado(gradoStr);

    const esPreescolar = (gradoStr === "0" || gradoStr === "-1");
    const datosAnuales = obtenerDatosAnuales(gradoStr, esPreescolar);

    if (datosAnuales.length === 0) {
      contenedor.innerHTML = `<p class="texto-vacio">No hay datos de ${estado.area} para el grado ${gradoStr}.</p>`;
    } else {
      datosAnuales.forEach(texto => {
        const item = document.createElement('div');
        item.className = 'prog-estandar-item';
        item.innerHTML = esPreescolar ? `<strong>DBA:</strong> ${texto}` : texto;
        contenedor.appendChild(item);
      });
    }
  }

  function obtenerDatosAnuales(gradoStr, esPreescolar) {
    const malla = window.MallasData?.[estado.area]?.[gradoStr]?.[estado.tipoMalla];
    
    // Si la malla no existe en memoria, retornamos vacío (Archivo no cargado)
    if (!malla || !malla.periodos) return [];

    let acumulado = [];
    
    Object.keys(malla.periodos).forEach(pNum => {
      const itemsPeriodo = malla.periodos[pNum];
      itemsPeriodo.forEach(it => {
        if (esPreescolar) {
          // Preescolar toma todos los DBA (Integral)
          if (it.dba) {
            if (Array.isArray(it.dba)) acumulado.push(...it.dba);
            else acumulado.push(it.dba);
          }
        } else {
          // Si el grado central es Transición (0) y estamos dibujando la columna de Grado 1,
          // ignoramos el filtro de componente para mostrar todo el panorama.
          if (estado.gradoCentral === 0 && gradoStr === "1") {
            if (it.estandar) acumulado.push(it.estandar);
          } 
          // Consulta normal: Misma área, mismo componente
          else if (it.componente && it.componente.toLowerCase() === estado.componente.toLowerCase() && it.estandar) {
            acumulado.push(it.estandar);
          }
        }
      });
    });

    return [...new Set(acumulado)];
  }

  function calcularGradoRelativo(gradoActual, desplazamiento) {
    const nuevo = gradoActual + desplazamiento;
    if (nuevo < -1 || nuevo > 11) return null;
    return String(nuevo);
  }

  function formatearNombreGrado(g) {
    if (g === "0") return "Transición (0)";
    if (g === "-1") return "Jardín (-1)";
    return `Grado ${g}°`;
  }

  btnCerrar.addEventListener('click', cerrar);
  btnPrev.addEventListener('click', () => { estado.gradoCentral--; renderizar(); });
  btnNext.addEventListener('click', () => { estado.gradoCentral++; renderizar(); });

  return { abrir: abrir };
})();
