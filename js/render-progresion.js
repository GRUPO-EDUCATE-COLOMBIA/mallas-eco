// js/render-progresion.js

/**
 * Motor de Progresión de Aprendizajes con Puente Pedagógico Blindado.
 * Resuelve el conflicto de nombres de componentes entre Preescolar y Primaria.
 */
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

    const gPrev = calcularGradoRelativo(g, -1);
    const gActual = String(g);
    const gNext = calcularGradoRelativo(g, 1);

    dibujarColumna(contPrev, labelPrev, gPrev);
    dibujarColumna(contActual, labelActual, gActual);
    dibujarColumna(contNext, labelNext, gNext);

    btnPrev.disabled = (g <= -1);
    btnNext.disabled = (g >= 11);
  }

  function dibujarColumna(contenedor, etiqueta, gradoStr) {
    contenedor.innerHTML = '';
    if (gradoStr === null) {
      etiqueta.textContent = "---";
      contenedor.innerHTML = '<p class="texto-vacio">Fin de la secuencia.</p>';
      return;
    }

    etiqueta.textContent = formatearNombreGrado(gradoStr);

    // Determinamos si el grado que estamos dibujando es preescolar
    const esPreescolar = (gradoStr === "0" || gradoStr === "-1");
    const datosAnuales = obtenerDatosAnuales(gradoStr, esPreescolar);

    if (datosAnuales.length === 0) {
      contenedor.innerHTML = '<p class="texto-vacio">No se halló información para este componente.</p>';
    } else {
      datosAnuales.forEach(texto => {
        const item = document.createElement('div');
        item.className = 'prog-estandar-item';
        // Diferenciamos visualmente si es DBA o Estándar
        item.innerHTML = esPreescolar ? `<strong>DBA:</strong> ${texto}` : texto;
        contenedor.appendChild(item);
      });
    }
  }

  function obtenerDatosAnuales(gradoStr, esPreescolar) {
    const malla = window.MallasData?.[estado.area]?.[gradoStr]?.[estado.tipoMalla];
    if (!malla || !malla.periodos) return [];

    let acumulado = [];
    
    // PRIMERA PASADA: Intentar filtrar por componente
    Object.keys(malla.periodos).forEach(pNum => {
      const itemsPeriodo = malla.periodos[pNum];
      itemsPeriodo.forEach(it => {
        if (esPreescolar) {
          // Preescolar siempre es INTEGRAL (ignora el nombre del componente)
          if (it.dba) {
            if (Array.isArray(it.dba)) acumulado.push(...it.dba);
            else acumulado.push(it.dba);
          }
        } else {
          // Primaria/Bachillerato: Intenta filtrar por el componente seleccionado
          if (it.componente === estado.componente && it.estandar) {
            acumulado.push(it.estandar);
          }
        }
      });
    });

    // SEGUNDA PASADA: "EL PUENTE PARA GRADO 1°"
    // Si estamos en Grado 1 y la lista está vacía (porque el componente viene de preescolar),
    // mostramos TODOS los estándares de Grado 1 para que la columna no esté vacía.
    if (gradoStr === "1" && acumulado.length === 0) {
      Object.keys(malla.periodos).forEach(pNum => {
        malla.periodos[pNum].forEach(it => {
          if (it.estandar) acumulado.push(it.estandar);
        });
      });
    }

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
