// FILE: js/data-loader.js | VERSION: v7.2 Stable

window.MallasData = {};

/**
 * Función de Normalización: Elimina tildes y carácteres especiales
 * para asegurar que las llaves de búsqueda siempre coincidan.
 */
window.normalizarTexto = function(texto) {
    if (!texto) return "";
    return texto.normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .trim();
};

/**
 * Asegura la carga de la tríada de archivos (Académico + DCE + ECO).
 */
async function asegurarDatosGrado(areaKey, grado) {
  const config = window.APP_CONFIG;
  const area = config.AREAS[areaKey];
  const gradoStr = String(grado).trim();
  const tipo = config.TIPO_MALLA;

  if (!area) return false;

  // Llaves normalizadas para almacenamiento interno
  const llaveArea = normalizarTexto(area.nombre);
  const llaveEco = normalizarTexto(config.AREAS["proyecto-socioemocional"].nombre);

  // Verificar si ya existe en memoria para optimizar
  if (window.MallasData[llaveArea]?.[gradoStr] && window.MallasData[llaveEco]?.[gradoStr]) {
    return true; 
  }

  // Definición de rutas según Hito 2
  const rutaBase = `data/${area.carpeta}/${area.prefijo}_${gradoStr}_${tipo}.json`;
  const rutaTareas = `data/${area.carpeta}/tareas_dce/t_${area.prefijo}_${gradoStr}_${tipo}.json`;
  const areaEco = config.AREAS["proyecto-socioemocional"];
  const rutaEco = `data/${areaEco.carpeta}/${areaEco.prefijo}_${gradoStr}_${tipo}.json`;

  try {
    const [resBase, resTareas, resEco] = await Promise.all([
      fetch(rutaBase).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(rutaTareas).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(rutaEco).then(r => r.ok ? r.json() : null).catch(() => null)
    ]);

    // Almacenamiento con llaves normalizadas
    if (resBase) {
      if (!window.MallasData[llaveArea]) window.MallasData[llaveArea] = {};
      window.MallasData[llaveArea][gradoStr] = { [tipo]: resBase };
    }

    if (resTareas) {
      const llaveDCE = `tareas_dce_${llaveArea}`;
      if (!window.MallasData[llaveDCE]) window.MallasData[llaveDCE] = {};
      window.MallasData[llaveDCE][gradoStr] = { [tipo]: resTareas };
    }

    if (resEco) {
      if (!window.MallasData[llaveEco]) window.MallasData[llaveEco] = {};
      window.MallasData[llaveEco][gradoStr] = { [tipo]: resEco };
    }

    return true;
  } catch (error) {
    console.error(`Error en carga asíncrona: ${area.nombre} G:${gradoStr}`, error);
    return false;
  }
}
// END OF FILE: js/data-loader.js | VERSION: v7.2 Stable
