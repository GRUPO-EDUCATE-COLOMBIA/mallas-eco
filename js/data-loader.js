// js/data-loader.js

/**
 * MOTOR DE CARGA MODULAR Y ESPEJO
 * Carga las mallas base y los archivos de tareas DCE independientes.
 */

window.MallasData = {};

/**
 * Asegura la estructura de objetos en memoria
 */
function prepararMemoria(area, grado, tipo) {
  if (!window.MallasData[area]) window.MallasData[area] = {};
  if (!window.MallasData[area][grado]) window.MallasData[area][grado] = {};
  if (!window.MallasData[area][grado][tipo]) window.MallasData[area][grado][tipo] = null;
}

/**
 * Función Maestra de Carga asíncrona
 */
async function cargarAplicativo() {
  console.log("⏳ Cargando ecosistema modular...");
  
  const config = window.APP_CONFIG;
  const areas = Object.values(config.AREAS);
  const promesas = [];

  areas.forEach(area => {
    config.GRADOS.forEach(grado => {
      
      // 1. RUTA ARCHIVO BASE (Estándares, DBA)
      const rutaBase = `data/${area.carpeta}/${area.prefijo}_${grado}_${config.TIPO_MALLA}.json`;
      
      // 2. RUTA ARCHIVO TAREAS (Metodología DCE Externa)
      const rutaTareas = `data/${area.carpeta}/t_${area.prefijo}_${grado}_${config.TIPO_MALLA}.json`;

      // --- PETICIÓN ARCHIVO BASE ---
      const pBase = fetch(rutaBase)
        .then(r => r.ok ? r.json() : null)
        .then(json => {
          if (json) {
            prepararMemoria(area.nombre, grado, config.TIPO_MALLA);
            window.MallasData[area.nombre][grado][config.TIPO_MALLA] = json;
          }
        }).catch(() => {});

      // --- PETICIÓN ARCHIVO TAREAS DCE (ESPEJO) ---
      const pTareas = fetch(rutaTareas)
        .then(r => r.ok ? r.json() : null)
        .then(json => {
          if (json) {
            // Guardamos las tareas en un "cajón" especial para no mezclar con la malla base
            const llaveTareas = `Tareas_DCE_${area.nombre}`;
            prepararMemoria(llaveTareas, grado, config.TIPO_MALLA);
            window.MallasData[llaveTareas][grado][config.TIPO_MALLA] = json;
            // console.log(`📋 Tareas DCE halladas para ${area.nombre} ${grado}°`);
          }
        }).catch(() => {});

      promesas.push(pBase, pTareas);
    });
  });

  await Promise.all(promesas);
  console.log("🚀 ECOSISTEMA CARGADO: Mallas y Orientaciones Metodológicas vinculadas.");
}

// Iniciar proceso
cargarAplicativo();
