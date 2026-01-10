// FILE: js/ui-filtros.js | VERSION: v7.9.4 Stable
document.addEventListener('DOMContentLoaded', () => {
  const areaSel = document.getElementById('area');
  const gradoSel = document.getElementById('grado');
  const periodoSel = document.getElementById('periodo');
  const compSel = document.getElementById('componente');
  const btnBuscar = document.getElementById('btn-buscar');
  const btnProg = document.getElementById('btn-progresion');
  const btnTop = document.getElementById('btn-top');
  const modal = document.getElementById('modal-notificacion');
  const modalMsg = document.getElementById('modal-mensaje');
  const btnCerrarModal = document.getElementById('btn-cerrar-modal');

  function mostrarError(mensaje) {
    modalMsg.textContent = mensaje;
    modal.classList.add('mostrar-flex');
    window.RenderEngine.setCargando(false);
  }

  btnCerrarModal.onclick = () => modal.classList.remove('mostrar-flex');

  // LIMPIEZA INSTANTÁNEA AL CAMBIAR SELECTORES (Su propuesta UX)
  function resetResultados() {
    document.getElementById('contenedor-malla').innerHTML = '';
    document.getElementById('resultados-principal').style.display = 'none';
    document.getElementById('indicador-periodo').style.display = 'none';
  }

  areaSel.addEventListener('change', () => {
    resetResultados();
    gradoSel.innerHTML = '<option value="">Seleccionar</option>';
    if (areaSel.value) {
      window.APP_CONFIG.GRADOS.forEach(g => {
        const opt = document.createElement('option'); opt.value = g;
        opt.textContent = g === "0" ? "Transición (0)" : (g === "-1" ? "Jardín (-1)" : g + "°");
        gradoSel.appendChild(opt);
      });
      gradoSel.disabled = false;
    }
  });

  gradoSel.addEventListener('change', resetResultados);

  periodoSel.addEventListener('change', async () => {
    resetResultados(); // Limpia antes de cargar el nuevo periodo
    if (!periodoSel.value) return;
    
    window.RenderEngine.setCargando(true);
    const exito = await asegurarDatosGrado(areaSel.value, gradoSel.value);
    
    if (exito) {
      const configArea = window.APP_CONFIG.AREAS[areaSel.value];
      const llaveNormal = normalizarTexto(configArea.nombre);
      const tipo = window.APP_CONFIG.TIPO_MALLA;
      const dataGrado = window.MallasData[llaveNormal]?.[gradoSel.value]?.[tipo];
      
      if (dataGrado && dataGrado.periodos && dataGrado.periodos[periodoSel.value]) {
        const items = dataGrado.periodos[periodoSel.value];
        compSel.innerHTML = '<option value="todos">Todos</option>';
        const componentesUnicos = [...new Set(items.map(it => it.componente || it.competencia))];
        componentesUnicos.forEach(n => {
          if (n) {
            const opt = document.createElement('option'); opt.value = n; opt.textContent = n;
            compSel.appendChild(opt);
          }
        });
        compSel.disabled = false;
        btnProg.disabled = false;
      }
    }
    window.RenderEngine.setCargando(false);
  });

  btnBuscar.addEventListener('click', () => {
    if (!areaSel.value || !gradoSel.value || !periodoSel.value) {
      mostrarError("Seleccione Área, Grado y Periodo.");
      return;
    }
    const config = window.APP_CONFIG.AREAS[areaSel.value];
    const llaveNormal = normalizarTexto(config.nombre);
    const tipo = window.APP_CONFIG.TIPO_MALLA;
    const malla = window.MallasData[llaveNormal]?.[gradoSel.value]?.[tipo];

    if (!malla) return;

    const items = malla.periodos[periodoSel.value] || [];
    const filtrados = compSel.value === "todos" ? items : items.filter(it => (it.componente || it.competencia) === compSel.value);
    
    window.RenderEngine.renderizar(filtrados, areaSel.value, gradoSel.value, periodoSel.value);
    document.getElementById('resultados-principal').classList.add('mostrar-block');
  });

  btnProg.addEventListener('click', async () => {
    window.RenderEngine.setCargando(true);
    const g = parseInt(gradoSel.value);
    const grados = [String(g)];
    if (g > 1) grados.push(String(g - 1));
    if (g < 11) grados.push(String(g + 1));
    if (g <= 0) grados.push("-1", "0", "1");
    try {
      await Promise.all(grados.map(gr => asegurarDatosGrado(areaSel.value, gr)));
      window.ProgresionMotor.abrir(window.APP_CONFIG.AREAS[areaSel.value].nombre, gradoSel.value, compSel.value);
    } catch { mostrarError("Error en progresión."); }
    window.RenderEngine.setCargando(false);
  });

  // LOGICA BOTON TOP RESTAURADA
  window.onscroll = () => { 
    if (window.scrollY > 400) {
      btnTop.style.display = 'block';
    } else {
      btnTop.style.display = 'none';
    }
  };
  btnTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
});
