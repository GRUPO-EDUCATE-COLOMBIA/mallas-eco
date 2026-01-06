// js/data-loader.js - v5.6 (FIX LLAVES)
window.MallasData = {};

async function asegurarDatosGrado(areaKey, grado) {
  const config = window.APP_CONFIG;
  const area = config.AREAS[areaKey];
  const gradoStr = String(grado).trim();
  const tipo = config.TIPO_MALLA;

  if (!area) return false;
  if (window.MallasData[area.nombre]?.[gradoStr]) return true;

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

    // 1. Guardar Académico
    if (resBase) {
      if (!window.MallasData[area.nombre]) window.MallasData[area.nombre] = {};
      window.MallasData[area.nombre][gradoStr] = { [tipo]: resBase };
    }

    // 2. Guardar Tareas DCE (Espejo)
    if (resTareas) {
      const llaveT = `Tareas_DCE_${area.nombre}`;
      if (!window.MallasData[llaveT]) window.MallasData[llaveT] = {};
      window.MallasData[llaveT][gradoStr] = { [tipo]: resTareas };
    }

    // 3. Guardar Socioemocional (USA EL NOMBRE EXACTO: "Proyecto Socioemocional")
    if (resEco) {
      const nombreEco = config.AREAS["proyecto-socioemocional"].nombre;
      if (!window.MallasData[nombreEco]) window.MallasData[nombreEco] = {};
      window.MallasData[nombreEco][gradoStr] = { [tipo]: resEco };
    }

    return true;
  } catch (e) { return false; }
}
