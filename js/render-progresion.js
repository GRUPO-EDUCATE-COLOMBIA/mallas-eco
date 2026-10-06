// FILE: js/render-progresion.js | VERSION: v10.8 Stable
window.ProgresionMotor = (function() {
  // Estado interno sincronizado con la configuración global
  let est = { areaId: '', areaNombre: '', gradoCentral: 0, componente: '', tipo: '4_periodos' };
  
  const ov = document.getElementById('overlay-progresion');
  const txt = document.getElementById('prog-area-txt');
  const cPr = document.getElementById('cont-grado-prev');
  const cAc = document.getElementById('cont-grado-actual');
  const cNx = document.getElementById('cont-grado-next');

  /**
   * ABRE EL PANEL DE PROGRESIÓN (Punto de entrada desde UI)
   */
  async function abrir(nom, gr, comp) {
    const config = window.APP_CONFIG.AREAS;
    // Vinculación dinámica de IDs
    est.areaId = Object.keys(config).find(k => config[k].nombre === nom);
    est.areaNombre = nom; 
    est.gradoCentral = parseInt(gr); 
    est.componente = comp; // Captura si es "todos" o un nombre específico
    est.tipo = window.APP_CONFIG.TIPO_MALLA; // Sincronización Bimodal

    if (ov) ov.classList.add('mostrar-flex');
    renderizar();
  }

  /**
   * COORDINA EL DIBUJO DE LAS 3 COLUMNAS DE COMPARACIÓN
   */
  function renderizar() {
    const g = est.gradoCentral;
    const tituloComp = est.componente === "todos" ? "Todos los Componentes" : est.componente;
    txt.textContent = `${est.areaNombre.toUpperCase()} - ${tituloComp}`;
    
    // Asignación de grados a columnas (Manejo de límites -1 y 11)
    dibujar(cPr, (g - 1 < -1) ? null : String(g - 1));
    dibujar(cAc, String(g));
    dibujar(cNx, (g + 1 > 11) ? null : String(g + 1));
    
    // Navegación interna del modal
    const btnP = document.getElementById('prog-prev');
    const btnN = document.getElementById('prog-next');
    if (btnP) btnP.disabled = (g <= -1);
    if (btnN) btnN.disabled = (g >= 11);
  }

  /**
   * DIBUJA EL CONTENIDO PEDAGÓGICO DE UNA COLUMNA
   */
  function dibujar(cont, grStr) {
    if (!cont) return;
    const h = cont.previousElementSibling;
    cont.innerHTML = '';

    if (grStr === null) {
      if (h) h.textContent = "---";
      cont.innerHTML = '<p style="text-align:center;color:#999;padding-top:20px;">Fin de secuencia curricular.</p>';
      return;
    }

    if (h) h.textContent = (grStr === "0" ? "Transición (0)" : (grStr === "-1" ? "Jardín (-1)" : `Grado ${grStr}°`));
    
    // Lógica Híbrida v10.8: Preescolar usa DBA, resto usa Estándares
    const esPreescolar = (grStr === "0" || grStr === "-1");
    const datos = obtenerDatosCruce(grStr, esPreescolar);

    if (datos.length === 0) {
      cont.innerHTML = '<p style="text-align:center;padding:20px;color:#888;">Sin registros para esta selección.</p>';
    } else {
      datos.forEach(texto => {
        const d = document.createElement('div');
        d.className = 'prog-estandar-item';
        
        // Formateo de Badges para Progresión
        const parts = texto.split(':');
        if (parts.length > 1 && parts[0].trim().length < 30) {
           d.innerHTML = `<span class="badge-id">${parts[0].trim()}</span><div style="margin-top:8px;">${parts.slice(1).join(':').trim()}</div>`;
        } else {
           d.innerHTML = texto;
        }
        cont.appendChild(d);
      });
    }
  }

  /**
   * EXTRAE Y CRUZA DATOS DESDE window.MallasData
   */
  function obtenerDatosCruce(grStr, esPre) {
    const llaveArea = normalizarTexto(est.areaNombre);
    const malla = window.MallasData[llaveArea]?.[grStr]?.[est.tipo];
    
    if (!malla || !malla.periodos) return [];
    
    let resultados = [];
    const nomCompBuscado = normalizarTexto(est.componente);

    // Iteración sobre objeto de periodos (Estructura B Académica)
    Object.values(malla.periodos).forEach(listaItems => {
      if (Array.isArray(listaItems)) {
        listaItems.forEach(item => {
          const nomItem = normalizarTexto(item.componente || item.competencia);
          
          // CRITERIOS DE FILTRADO (Soporta "Todos")
          const esMismoComp = (nomCompBuscado === "todos" || nomItem === nomCompBuscado);
          
          // Lógica de Puente Pedagógico: Grado 1 permite ver estándares 
          // aunque el origen sea preescolar para ver la evolución.
          if (esMismoComp || (est.gradoCentral <= 0 && grStr === "1")) {
            const contenido = esPre ? item.dba : item.estandar;
            if (contenido) {
              if (Array.isArray(contenido)) resultados.push(...contenido);
              else resultados.push(contenido);
            }
          }
        });
      }
    });

    // Limpieza de duplicados y vacíos
    return [...new Set(resultados)].filter(t => t && String(t).trim() !== "");
  }

  // BOTONES DE CIERRE Y NAVEGACIÓN
  const bCerrar = document.getElementById('btn-cerrar-progresion');
  if (bCerrar) bCerrar.onclick = () => ov.classList.remove('mostrar-flex');
  
  const bPrev = document.getElementById('prog-prev');
  if (bPrev) {
    bPrev.onclick = async () => { 
      if (est.gradoCentral > -1) {
        est.gradoCentral--; 
        window.RenderEngine.setCargando(true);
        // Carga dinámica bimodal de grados adyacentes
        await asegurarDatosGrado(est.areaId, est.gradoCentral - 1); 
        renderizar();
        window.RenderEngine.setCargando(false);
      }
    };
  }
  
  const bNext = document.getElementById('prog-next');
  if (bNext) {
    bNext.onclick = async () => { 
      if (est.gradoCentral < 11) {
        est.gradoCentral++; 
        window.RenderEngine.setCargando(true);
        await asegurarDatosGrado(est.areaId, est.gradoCentral + 1); 
        renderizar();
        window.RenderEngine.setCargando(false);
      }
    };
  }
// --- LÓGICA NATIVA DE IMPRESIÓN/PDF PARA PROGRESIÓN ---
  const btnImprimirProg = document.getElementById('btn-imprimir-progresion');
  
  if (btnImprimirProg) {
    btnImprimirProg.onclick = () => {
      // Reutilizamos el contenedor de fecha de tu print-engine
      const fechaTxt = document.getElementById('print-fecha-txt');
      
      if (fechaTxt) {
        const ahora = new Date();
        const fechaFormateada = ahora.toLocaleDateString() + ' ' + ahora.toLocaleTimeString();
        const tituloComp = est.componente === "todos" ? "Todos los Componentes" : est.componente;

        // Población del encabezado oculto con los datos del estado (est)
        fechaTxt.innerHTML = `
          <strong>REPORTE DE PROGRESIÓN DE ESTÁNDARES</strong><br>
          <strong>ÁREA:</strong> ${est.areaNombre.toUpperCase()} | 
          <strong>GRADO CENTRAL:</strong> ${est.gradoCentral} | 
          <strong>COMPONENTE:</strong> ${tituloComp}<br>
          <strong>FECHA DE CONSULTA:</strong> ${fechaFormateada}
        `;
      }

      // 1. Añadimos una clase temporal al body para aislar el CSS
      document.body.classList.add('imprimiendo-progresion');

      // 2. Disparo del diálogo de impresión (manteniendo tus 400ms de sincronía)
      setTimeout(() => {
        window.print();
        
        // 3. Limpieza de la clase al terminar
        setTimeout(() => {
          document.body.classList.remove('imprimiendo-progresion');
        }, 500); // Pequeño delay adicional para asegurar que el diálogo ya se abrió
      }, 400);
    };
  }
  return { abrir };
})();
