// FILE: js/ui-filtros.js | VERSION: v10.3 Stable
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
  
  // Captura de los botones de radio (3 P. / 4 P.)
  const radiosPeriodos = document.querySelectorAll('input[name="periodos"]');

  function mostrarError(mensaje) {
    if (modalMsg) modalMsg.textContent = mensaje;
    if (modal) modal.classList.add('mostrar-flex');
    window.RenderEngine.setCargando(false);
  }

  if (btnCerrarModal) btnCerrarModal.onclick = () => modal.classList.remove('mostrar-flex');

  // LIMPIEZA DE INTERFAZ (UX Propuesta por el usuario)
  function resetResultados() {
    const contMalla = document.getElementById('contenedor-malla');
    const resPrincipal = document.getElementById('resultados-principal');
    const indPeriodo = document.getElementById('indicador-periodo');
    if (contMalla) contMalla.innerHTML = '';
    if (resPrincipal) resPrincipal.classList.remove('mostrar-block');
    if (indPeriodo) indPeriodo.style.display = 'none';
  }

  // --- LÓGICA DE ALTERNANCIA 3P / 4P ---
  radiosPeriodos.forEach(radio => {
    radio.addEventListener('change', (e) => {
      // Actualiza la modalidad en la configuración global
      const seleccion = e.target.value; // "3" o "4"
      window.APP_CONFIG.TIPO_MALLA = window.APP_CONFIG.MODALIDADES_TIEMPO[seleccion];
      
      // Reset de selectores para obligar a una nueva carga limpia
      resetResultados();
      areaSel.value = "";
      gradoSel.innerHTML = '<option value="">Seleccionar</option>';
      gradoSel.disabled = true;
      periodoSel.innerHTML = '<option value="">Seleccionar</option>';
      periodoSel.disabled = true;
      compSel.innerHTML = '<option value="todos">Todos</option>';
      compSel.disabled = true;
      btnProg.disabled = true;
    });
  });

  areaSel.addEventListener('change', () => {
    resetResultados();
    gradoSel.innerHTML = '<option value="">Seleccionar</option>';
    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    periodoSel.disabled = true;
    compSel.innerHTML = '<option value="todos">Todos</option>';
    compSel.disabled = true;

    if (areaSel.value) {
      window.APP_CONFIG.GRADOS.forEach(g => {
        const opt = document.createElement('option'); opt.value = g;
        opt.textContent = g === "0" ? "Transición (0)" : (g === "-1" ? "Jardín (-1)" : g + "°");
        gradoSel.appendChild(opt);
      });
      gradoSel.disabled = false;
    }
  });

  gradoSel.addEventListener('change', () => {
    resetResultados();
    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    compSel.innerHTML = '<option value="todos">Todos</option>';
    compSel.disabled = true;

    if (gradoSel.value) {
      // DETERMINACIÓN DINÁMICA DE PERIODOS (3 o 4)
      const maxP = window.APP_CONFIG.TIPO_MALLA === "3_periodos" ? 3 : 4;
      for (let i = 1; i <= maxP; i++) {
        const opt = document.createElement('option'); 
        opt.value = i; 
        opt.textContent = `${i}° Periodo`;
        periodoSel.appendChild(opt);
      }
      periodoSel.disabled = false;
    }
  });

  periodoSel.addEventListener('change', async () => {
    resetResultados();
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
        
        // BLINDAJE v10.3: Validación de lista
        if (!Array.isArray(items)) {
          mostrarError("Error de formato en el archivo JSON. Se esperaba una lista [ ].");
          window.RenderEngine.setCargando(false);
          return;
        }

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

  window.onscroll = () => { 
    if (btnTop) btnTop.style.display = (window.scrollY > 400) ? 'block' : 'none';
  };
  if (btnTop) btnTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
});
