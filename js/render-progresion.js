// FILE: js/render-progresion.js | VERSION: v6.4 Stable

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

  async function abrir(areaNombre, grado, componente) {
    const areaId = Object.keys(window.APP_CONFIG.AREAS).find(k => window.APP_CONFIG.AREAS[k].nombre === areaNombre);
    estado.areaId = areaId;
    estado.areaNombre = areaNombre;
    estado.gradoCentral = parseInt(grado);
    estado.componente = componente;
    estado.tipo = window.APP_CONFIG.TIPO_MALLA;
    overlay.style.display = 'flex';
    renderizar();
  }

  function cerrar() { overlay.style.display = 'none'; }

  function renderizar() {
    const g = estado.gradoCentral;
    txtArea.textContent = `${estado.areaNombre.toUpperCase()} - COMPONENTE: ${estado.componente}`;

    const gPrev = (g - 1 < -1) ? null : String(g - 1);
    const gActual = String(g);
    const gNext = (g + 1 > 11) ? null : String(g + 1);
    
    dibujarColumna(contPrev, gPrev);
    dibujarColumna(contActual, gActual);
    dibujarColumna(contNext, gNext);
    
    // DOBLE VERIFICACIÓN: Evitar error si los botones son null
    if (btnPrev) btnPrev.disabled = (g <= -1);
    if (btnNext) btnNext.disabled = (g >= 11);
  }

  function dibujarColumna(contenedor, gradoStr) {
    if (!contenedor) return;
    const header = contenedor.previousElementSibling;
    contenedor.innerHTML = '';
    
    if (gradoStr === null) {
      if (header) header.textContent = "---";
      contenedor.innerHTML = '<p style="text-align:center; color:#999; padding-top:20px;">Fin de secuencia.</p>';
      return;
    }

    if (header) header.textContent = formatearNombre(gradoStr);
    const esPreescolar = (gradoStr === "0" || gradoStr === "-1");
    const datos = obtenerAprendizajesAnuales(gradoStr, esPreescolar);
    
    if (datos.length === 0) {
      contenedor.innerHTML = `<p style="text-align:center; color:#888; padding:20px;"><em>Sin datos para este componente.</em></p>`;
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
        if (it.componente === estado.componente || it.competencia === estado.componente || (estado.gradoCentral === 0 && gradoStr === "1")) {
          const campo = esPreescolar ? it.dba : it.estandar;
          if (campo) {
            if (Array.isArray(campo)) acumulado.push(...campo);
            else acumulado.push(campo);
          }
        }
      });
    });
    return [...new Set(acumulado)].filter(t => t && t.trim() !== "");
  }

  function formatearNombre(g) {
    if (g === "0") return "Transición (0)";
    if (g === "-1") return "Jardín (-1)";
    return `Grado ${g}°`;
  }

  // DOBLE VERIFICACIÓN: Solo asignar si los elementos existen
  if (btnPrev) {
      btnPrev.onclick = async () => {
        estado.gradoCentral--;
        window.RenderEngine.setCargando(true);
        await asegurarDatosGrado(estado.areaId, String(estado.gradoCentral - 1));
        renderizar();
        window.RenderEngine.setCargando(false);
      };
  }

  if (btnNext) {
      btnNext.onclick = async () => {
        estado.gradoCentral++;
        window.RenderEngine.setCargando(true);
        await asegurarDatosGrado(estado.areaId, String(estado.gradoCentral + 1));
        renderizar();
        window.RenderEngine.setCargando(false);
      };
  }

  if (btnCerrar) btnCerrar.onclick = cerrar;

  return { abrir };
})();
// END OF FILE: js/render-progresion.js | VERSION: v6.4 Stable
