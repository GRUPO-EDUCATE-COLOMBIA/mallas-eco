// js/ui-filtros.js - v6.0 STABLE (Corrección de Progresión y Períodos)

document.addEventListener('DOMContentLoaded', () => {
  // Elementos del DOM
  const areaSel = document.getElementById('area');
  const gradoSel = document.getElementById('grado');
  const periodoSel = document.getElementById('periodo');
  const compSel = document.getElementById('componente');
  const btnBuscar = document.querySelector('.btn-buscar');
  const btnProg = document.getElementById('btn-progresion');
  const radioPeriodos = document.querySelectorAll('input[name="periodos"]');

  /**
   * 1. GESTIÓN DE TIPO DE MALLA (3 vs 4 Períodos)
   * Actualiza la configuración global cada vez que el usuario cambia el radio button.
   */
  radioPeriodos.forEach(radio => {
    radio.addEventListener('change', (e) => {
      window.APP_CONFIG.TIPO_MALLA = e.target.value === "3" ? "3_periodos" : "4_periodos";
      
      // Si ya hay un área seleccionada, reiniciamos el flujo para evitar errores de carga
      if (areaSel.value) {
        gradoSel.value = "";
        periodoSel.innerHTML = '<option value="">Seleccionar</option>';
        periodoSel.disabled = true;
        compSel.innerHTML = '<option value="todos">Todos</option>';
        compSel.disabled = true;
      }
    });
  });

  /**
   * 2. CAMBIO DE ÁREA
   * Puebla el selector de grados según la configuración de config.js.
   */
  areaSel.addEventListener('change', () => {
    if (!areaSel.value) {
        gradoSel.disabled = true;
        return;
    }

    gradoSel.innerHTML = '<option value="">Seleccionar</option>';
    window.APP_CONFIG.GRADOS.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = g === "0" ? "Transición (0)" : (g === "-1" ? "Jardín (-1)" : g + "°");
      gradoSel.appendChild(opt);
    });
    gradoSel.disabled = false;
    
    // Resetear niveles inferiores
    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    periodoSel.disabled = true;
  });

  /**
   * 3. CAMBIO DE GRADO
   * Habilita los periodos (ajustado a la elección de 3 o 4).
   */
  gradoSel.addEventListener('change', () => {
    if (!gradoSel.value) {
        periodoSel.disabled = true;
        return;
    }

    const numMax = window.APP_CONFIG.TIPO_MALLA === "3_periodos" ? 3 : 4;
    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    
    for (let i = 1; i <= numMax; i++) {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = `${i}° período`;
      periodoSel.appendChild(opt);
    }
    periodoSel.disabled = false;
  });

  /**
   * 4. CAMBIO DE PERÍODO (CARGA DE DATOS)
   * Dispara la carga asíncrona de la tríada (Académico, DCE y ECO).
   */
  periodoSel.addEventListener('change', async () => {
    if (!periodoSel.value) return;
    
    window.RenderEngine.setCargando(true);
    
    // Asegurar datos del grado actual
    const exito = await asegurarDatosGrado(areaSel.value, gradoSel.value);
    
    if (exito) {
      const areaConfig = window.APP_CONFIG.AREAS[areaSel.value];
      const tipo = window.APP_CONFIG.TIPO_MALLA;
      const malla = window.MallasData[areaConfig.nombre][gradoSel.value][tipo];
      const items = malla.periodos[periodoSel.value] || [];
      
      // Poblar componentes dinámicamente
      compSel.innerHTML = '<option value="todos">Todos</option>';
      const componentesUnicos = [...new Set(items.map(it => it.componente || it.competencia))];
      
      componentesUnicos.forEach(n => {
        if(n) {
          const opt = document.createElement('option');
          opt.value = n;
          opt.textContent = n;
          compSel.appendChild(opt);
        }
      });
      
      compSel.disabled = false;
      btnProg.disabled = false; 
    } else {
      alert("No se pudieron cargar los datos para este grado/área. Verifique que los archivos JSON existan.");
    }
    
    window.RenderEngine.setCargando(false);
  });

  /**
   * 5. BOTÓN CONSULTAR (RENDER PRINCIPAL)
   */
  btnBuscar.addEventListener('click', () => {
    if (!areaSel.value || !gradoSel.value || !periodoSel.value) {
        alert("Por favor seleccione Área, Grado y Período.");
        return;
    }

    const areaId = areaSel.value;
    const config = window.APP_CONFIG.AREAS[areaId];
    const grado = gradoSel.value;
    const periodo = periodoSel.value;
    const tipo = window.APP_CONFIG.TIPO_MALLA;

    try {
        const malla = window.MallasData[config.nombre][grado][tipo];
        const items = malla.periodos[periodo] || [];
        
        // Filtrar por componente si no es "todos"
        const filtrados = compSel.value === "todos" 
            ? items 
            : items.filter(it => (it.componente || it.competencia) === compSel.value);

        window.RenderEngine.renderizar(filtrados, areaId, grado, periodo);
        
        const resPrincipal = document.getElementById('resultados-principal');
        resPrincipal.classList.add('mostrar-block');
        resPrincipal.className = `resultados mostrar-block ${config.clase}`;
        
    } catch (e) {
        console.error("Error al renderizar:", e);
        alert("Error al procesar la malla. Revise la consola.");
    }
  });

  /**
   * 6. BOTÓN PROGRESIÓN (CARGA VECINOS Y ABRE MODAL)
   */
  btnProg.addEventListener('click', async () => {
    const areaId = areaSel.value;
    const config = window.APP_CONFIG.AREAS[areaId];
    const gCentral = parseInt(gradoSel.value);
    
    window.RenderEngine.setCargando(true);

    // Definir secuencia de 3 grados para la progresión
    let gradosParaCargar = [];
    if (gCentral === -1) gradosParaCargar = ["-1", "0", "1"];
    else if (gCentral === 0) gradosParaCargar = ["-1", "0", "1"];
    else {
        gradosParaCargar.push(String(gCentral));
        if (gCentral > 1) gradosParaCargar.push(String(gCentral - 1));
        if (gCentral < 11) gradosParaCargar.push(String(gCentral + 1));
    }

    // Carga masiva paralela de los archivos de los grados vecinos
    try {
        await Promise.all(gradosParaCargar.map(g => asegurarDatosGrado(areaId, g)));
        // Abrir motor de progresión
        window.ProgresionMotor.abrir(config.nombre, gradoSel.value, compSel.value);
    } catch (err) {
        console.error("Error en progresión:", err);
        alert("Hubo un problema al cargar los grados vecinos.");
    }

    window.RenderEngine.setCargando(false);
  });
});
