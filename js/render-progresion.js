// js/render-progresion.js - v5.7 (Motor de Progresión Completo)

window.ProgresionMotor = (function() {
  
  let estado = { areaId: '', areaNombre: '', gradoCentral: 0, componente: '', tipo: '4_periodos' };

  const overlay = document.getElementById('overlay-progresion');
  const btnCerrar = document.getElementById('btn-cerrar-progresion');
  const btnPrev = document.getElementById('prog-prev');
  const btnNext = document.getElementById('prog-next');
  
  const txtArea = document.getElementById('prog-area-txt');
  const contPrev = document.getElementById('cont-grado-prev');
  const contActual = document.getElementById('cont-grado-actual');
  const contNext = document.getElementById('cont-grado-next');
  
  const colNext = contNext.closest('.col-prog');

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

  function renderizar() {
    const g = estado.gradoCentral;
    txtArea.textContent = `${estado.areaNombre.toUpperCase()} - COMPONENTE: ${estado.componente}`;

    if (g <= 0) {
      colNext.style.display = 'none'; 
      if (g === -1) { 
        dibujarColumna(contPrev, "-1");
        dibujarColumna(contActual, "0");
      } else { 
        dibujarColumna(contPrev, "0");
        dibujarColumna(contActual, "1");
        document.querySelector('#col-grado-actual .col-header').textContent = "Grado 1° (Puente)";
      }
      btnPrev.disabled = (g === -1);
      btnNext.disabled = true; 
    } else {
      colNext.style.display = 'flex';
      document.querySelector('#col-grado-actual .col-header').textContent = "Grado Actual";
      
      const gPrev = (g - 1 < -1) ? null : String(g - 1);
      const gActual = String(g);
      const gNext = (g + 1 > 11) ? null : String(g + 1);
      
      dibujarColumna(contPrev, gPrev);
      dibujarColumna(contActual, gActual);
      dibujarColumna(contNext, gNext);
      
      btnPrev.disabled = (g <= 1); // Limitamos para no romper el puente desde aquí
      btnNext.disabled = (g >= 11);
    }
  }

  function dibujarColumna(contenedor, gradoStr) {
    const header = contenedor.previousElementSibling;
    contenedor.innerHTML = '';
    
    if (gradoStr === null) {
      header.textContent = "---";
      contenedor.innerHTML = '<p class="texto-vacio">Fin de la secuencia.</p>';
      return;
    }

    header.textContent = formatearNombre(gradoStr);
    const esPreescolar = (gradoStr === "0" || gradoStr === "-1");
    const datos = obtenerAprendizajesAnuales(gradoStr, esPreescolar);
    
    if (datos.length === 0) {
      contenedor.innerHTML = `<p class="texto-vacio">Cargando datos del grado...</p>`;
    } else {
      datos.forEach(texto => {
        const div = document.createElement('div');
        div.className = 'prog-estandar-item';
        div.innerHTML = esPreescolar ? `<strong>DBA:</strong> ${texto}` : texto;
        contenedor.appendChild(div);
      });
    }
  }

  function obtenerAprendizajesAnuales(gradoStr, esPreescolar) {
    const malla = window.MallasData?.[estado.areaNombre]?.[gradoStr]?.[estado.tipo];
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
          if ((estado.gradoCentral === 0 && gradoStr === "1") || (it.componente === estado.componente)) {
            if (it.estandar) acumulado.push(it.estandar);
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

  btnPrev.onclick = async () => {
    estado.gradoCentral--;
    window.RenderEngine.setCargando(true);
    await asegurarDatosGrado(estado.areaId, String(estado.gradoCentral - 1));
    renderizar();
    window.RenderEngine.setCargando(false);
  };

  btnNext.onclick = async () => {
    estado.gradoCentral++;
    window.RenderEngine.setCargando(true);
    await asegurarDatosGrado(estado.areaId, String(estado.gradoCentral + 1));
    renderizar();
    window.RenderEngine.setCargando(false);
  };

  btnCerrar.onclick = cerrar;

  return { abrir };
})();
