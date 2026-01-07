// js/ui-filtros.js - v6.1 STABLE (Hito 1: Navegación y Control)

document.addEventListener('DOMContentLoaded', () => {
  // Elementos del DOM
  const areaSel = document.getElementById('area');
  const gradoSel = document.getElementById('grado');
  const periodoSel = document.getElementById('periodo');
  const compSel = document.getElementById('componente');
  const btnBuscar = document.querySelector('.btn-buscar');
  const btnProg = document.getElementById('btn-progresion');
  const btnTop = document.getElementById('btn-top');
  const radioPeriodos = document.querySelectorAll('input[name="periodos"]');

  /**
   * 1. GESTIÓN DE VOLVER ARRIBA (TOP)
   */
  window.onscroll = function() {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
      btnTop.style.display = "block";
    } else {
      btnTop.style.display = "none";
    }
  };

  btnTop.onclick = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * 2. VALIDACIÓN DE ESTADO DE BOTONES
   * Habilita progresión solo si hay área y grado.
   */
  function validarEstadoBotones() {
    btnProg.disabled = !(areaSel.value && gradoSel.value);
  }

  /**
   * 3. GESTIÓN DE PERIODOS (3 vs 4)
   */
  radioPeriodos.forEach(radio => {
    radio.addEventListener('change', (e) => {
      window.APP_CONFIG.TIPO_MALLA = e.target.value === "3" ? "3_periodos" : "4_periodos";
      // Reiniciar selectores dependientes
      if (areaSel.value) {
        gradoSel.value = "";
        periodoSel.innerHTML = '<option value="">Seleccionar</option>';
        periodoSel.disabled = true;
      }
      validarEstadoBotones();
    });
  });

  /**
   * 4. CAMBIO DE ÁREA
   */
  areaSel.addEventListener('change', () => {
    gradoSel.innerHTML = '<option value="">Seleccionar</option>';
    if (!areaSel.value) {
        gradoSel.disabled = true;
    } else {
        window.APP_CONFIG.GRADOS.forEach(g => {
          const opt = document.createElement('option'); opt.value = g;
          opt.textContent = g === "0" ? "Transición (0)" : (g === "-1" ? "Jardín (-1)" : g + "°");
          gradoSel.appendChild(opt);
        });
        gradoSel.disabled = false;
    }
    periodoSel.disabled = true;
    compSel.disabled = true;
    validarEstadoBotones();
  });

  /**
   * 5. CAMBIO DE GRADO
   */
  gradoSel.addEventListener('change', () => {
    if (!gradoSel.value) {
        periodoSel.disabled = true;
    } else {
        const numMax = window.APP_CONFIG.TIPO_MALLA === "3_periodos" ? 3 : 4;
        periodoSel.innerHTML = '<option value="">Seleccionar</option>';
        for (let i = 1; i <= numMax; i++) {
          const opt = document.createElement('option'); opt.value = String(i); opt.textContent = `${i}° período`;
          periodoSel.appendChild(opt);
        }
        periodoSel.disabled = false;
    }
    validarEstadoBotones();
  });

  /**
   * 6. CARGA DE DATOS AL SELECCIONAR PERIODO
   */
  periodoSel.addEventListener('change', async () => {
    if (!periodoSel.value) return;
    
    window.RenderEngine.setCargando(true);
    const exito = await asegurarDatosGrado(areaSel.value, gradoSel.value);
    
    if (exito) {
      const areaNom = window.APP_CONFIG.AREAS[areaSel.value].nombre;
      const tipo = window.APP_CONFIG.TIPO_MALLA;
      const malla = window.MallasData[areaNom][gradoSel.value][tipo];
      const items = malla.periodos[periodoSel.value] || [];
      
      compSel.innerHTML = '<option value="todos">Todos</option>';
      [...new Set(items.map(it => it.componente || it.competencia))].forEach(n => {
        if(n) { const opt = document.createElement('option'); opt.value = n; opt.textContent = n; compSel.appendChild(opt); }
      });
      compSel.disabled = false;
    }
    window.RenderEngine.setCargando(false);
  });

  /**
   * 7. CONSULTAR
   */
  btnBuscar.addEventListener('click', () => {
    const areaId = areaSel.value;
    const grado = gradoSel.value;
    const periodo = periodoSel.value;
    if (!areaId || !grado || !periodo) return;

    const config = window.APP_CONFIG.AREAS[areaId];
    const tipo = window.APP_CONFIG.TIPO_MALLA;
    const malla = window.MallasData[config.nombre][grado][tipo];
    const items = malla.periodos[periodo] || [];
    const filtrados = compSel.value === "todos" ? items : items.filter(it => (it.componente || it.competencia) === compSel.value);

    window.RenderEngine.renderizar(filtrados, areaId, grado, periodo);
    
    const resPrincipal = document.getElementById('resultados-principal');
    resPrincipal.classList.add('mostrar-block');
    resPrincipal.className = `resultados mostrar-block ${config.clase}`;
    
    // Scrollear un poco hacia abajo para mostrar que hay resultados
    window.scrollBy({ top: 150, behavior: 'smooth' });
  });

  /**
   * 8. PROGRESIÓN
   */
  btnProg.addEventListener('click', async () => {
    window.RenderEngine.setCargando(true);
    const areaId = areaSel.value;
    const config = window.APP_CONFIG.AREAS[areaId];
    const gCentral = parseInt(gradoSel.value);
    
    let gradosCarga = [String(gCentral)];
    if (gCentral > 1) gradosCarga.push(String(gCentral - 1));
    if (gCentral < 11) gradosCarga.push(String(gCentral + 1));
    if (gCentral <= 0) gradosCarga.push("-1", "0", "1");

    await Promise.all(gradosCarga.map(g => asegurarDatosGrado(areaId, g)));
    window.ProgresionMotor.abrir(config.nombre, gradoSel.value, compSel.value);
    window.RenderEngine.setCargando(false);
  });
});
