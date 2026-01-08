// FILE: js/ui-filtros.js | VERSION: v7.4 Stable
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
  }

  btnCerrarModal.onclick = () => modal.classList.remove('mostrar-flex');

  areaSel.addEventListener('change', () => {
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

  gradoSel.addEventListener('change', () => {
    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    if (gradoSel.value) {
      const max = window.APP_CONFIG.TIPO_MALLA === "3_periodos" ? 3 : 4;
      for (let i = 1; i <= max; i++) {
        const opt = document.createElement('option'); opt.value = i; opt.textContent = `${i}° periodo`;
        periodoSel.appendChild(opt);
      }
      periodoSel.disabled = false;
    }
  });

  periodoSel.addEventListener('change', async () => {
    if (!periodoSel.value) return;
    
    window.RenderEngine.setCargando(true);
    
    try {
      const exito = await asegurarDatosGrado(areaSel.value, gradoSel.value);
      
      if (exito) {
        const configArea = window.APP_CONFIG.AREAS[areaSel.value];
        const llaveNormal = normalizarTexto(configArea.nombre);
        const tipo = window.APP_CONFIG.TIPO_MALLA;
        
        // PRUEBA DE ESCRITORIO: Recuperamos con la misma llave normalizada
        const dataGrado = window.MallasData[llaveNormal]?.[gradoSel.value]?.[tipo];
        
        if (dataGrado && dataGrado.periodos && dataGrado.periodos[periodoSel.value]) {
          const items = dataGrado.periodos[periodoSel.value];
          compSel.innerHTML = '<option value="todos">Todos</option>';
          [...new Set(items.map(it => it.componente || it.competencia))].forEach(n => {
            if (n) {
              const opt = document.createElement('option'); opt.value = n; opt.textContent = n; compSel.appendChild(opt);
            }
          });
          compSel.disabled = false;
          btnProg.disabled = false;
        }
      } else {
        mostrarError("No se encontró el archivo principal de este grado.");
      }
    } catch (e) {
      console.error("Error en flujo de filtros:", e);
    } finally {
      // PRUEBA DE ESCRITORIO: Pase lo que pase, el spinner se apaga aquí
      window.RenderEngine.setCargando(false);
    }
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

    if (!malla) {
      mostrarError("Los datos no están en memoria.");
      return;
    }

    const items = malla.periodos[periodoSel.value] || [];
    const filtrados = compSel.value === "todos" ? items : items.filter(it => (it.componente || it.competencia) === compSel.value);
    
    window.RenderEngine.renderizar(filtrados, areaSel.value, gradoSel.value, periodoSel.value);
    document.getElementById('resultados-principal').classList.add('mostrar-block');
  });

  btnProg.addEventListener('click', async () => {
    window.RenderEngine.setCargando(true);
    try {
      const g = parseInt(gradoSel.value);
      const grados = [String(g)];
      if (g > 1) grados.push(String(g - 1));
      if (g < 11) grados.push(String(g + 1));
      if (g <= 0) grados.push("-1", "0", "1");

      await Promise.all(grados.map(gr => asegurarDatosGrado(areaSel.value, gr)));
      window.ProgresionMotor.abrir(window.APP_CONFIG.AREAS[areaSel.value].nombre, gradoSel.value, compSel.value);
    } catch (e) {
      mostrarError("Error al cargar la progresión.");
    } finally {
      window.RenderEngine.setCargando(false);
    }
  });

  window.onscroll = () => { btnTop.style.display = (window.scrollY > 300) ? "block" : "none"; };
  btnTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
});
// END OF FILE: js/ui-filtros.js | VERSION: v7.4 Stable
