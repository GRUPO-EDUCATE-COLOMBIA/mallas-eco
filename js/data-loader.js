// js/data-loader.js - v5.0 (Arquitectura Bajo Demanda)

window.MallasData = {};

/**
 * Función Maestra: Asegura que toda la tríada de datos de un grado esté en memoria.
 * Carga: Malla Académica + Tareas DCE + Proyecto Socioemocional (ECO)
 */
async function asegurarDatosGrado(areaKey, grado) {
  const config = window.APP_CONFIG;
  const area = config.AREAS[areaIdAKey(areaKey)]; // Helper para obtener config del área
  const tipo = config.TIPO_MALLA;
  const gradoStr = String(grado).trim();

  // 1. Verificar si ya tenemos los datos básicos de este grado para evitar descargas repetidas
  if (window.MallasData[area.nombre]?.[gradoStr]?.[tipo]) {
    return true; 
  }

  // 2. Definir Rutas de la Tríada
  const rutaBase = `data/${area.carpeta}/${area.prefijo}_${gradoStr}_${tipo}.json`;
  const rutaTareas = `data/${area.carpeta}/tareas_dce/t_${area.prefijo}_${gradoStr}_${tipo}.json`;
  
  // Ruta del Proyecto ECO (Siempre se carga para permitir el cruce transversal)
  const areaEco = config.AREAS["proyecto-socioemocional"];
  const rutaEco = `data/${areaEco.carpeta}/${areaEco.prefijo}_${gradoStr}_${tipo}.json`;

  console.log(`📡 Solicitando Paquete Curricular: ${area.nombre} Grado ${gradoStr}`);

  try {
    // 3. Ejecutar Carga Paralela (Máxima Velocidad)
    const [resBase, resTareas, resEco] = await Promise.all([
      fetch(rutaBase).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(rutaTareas).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(rutaEco).then(r => r.ok ? r.json() : null).catch(() => null)
    ]);

    // 4. Indexar Malla Académica en Memoria
    if (resBase) {
      prepararEstructura(area.nombre, gradoStr, tipo);
      window.MallasData[area.nombre][gradoStr][tipo] = resBase;
    }

    // 5. Indexar Tareas DCE (Espejo)
    if (resTareas) {
      const llaveT = `Tareas_DCE_${area.nombre}`;
      prepararEstructura(llaveT, gradoStr, tipo);
      window.MallasData[llaveT][gradoStr][tipo] = resTareas;
    }

    // 6. Indexar Proyecto ECO (Transversal)
    if (resEco) {
      prepararEstructura(areaEco.nombre, gradoStr, tipo);
      window.MallasData[areaEco.nombre][gradoStr][tipo] = resEco;
    }

    return true;
  } catch (error) {
    console.error(`❌ Error crítico al cargar grado ${gradoStr}:`, error);
    return false;
  }
}

/**
 * Helper: Prepara el objeto en memoria para evitar errores de undefined
 */
function prepararEstructura(areaNombre, grado, tipo) {
  if (!window.MallasData[areaNombre]) window.MallasData[areaNombre] = {};
  if (!window.MallasData[areaNombre][grado]) window.MallasData[areaNombre][grado] = {};
}

/**
 * Helper: Encuentra la clave de configuración del área
 */
function areaIdAKey(id) {
  // Si nos pasan el ID (ej: 'matematicas'), lo devolvemos. 
  // Si nos pasan el nombre real, buscamos el ID.
  if (window.APP_CONFIG.AREAS[id]) return id;
  return Object.keys(window.APP_CONFIG.AREAS).find(key => window.APP_CONFIG.AREAS[key].nombre === id);
}

// Nota: Ya no se autoejecuta la carga masiva al inicio.
