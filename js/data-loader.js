// FILE: js/data-loader.js | VERSION: v7.3 Stable
window.MallasData = {};

/**
 * Normalización Global: Asegura que "Matemáticas" y "matematicas" sean la misma llave.
 */
window.normalizarTexto = function(texto) {
    if (!texto) return "";
    return texto.normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .trim();
};

async function asegurarDatosGrado(areaKey, grado) {
  const config = window.APP_CONFIG;
  const area = config.AREAS[areaKey];
  const gradoStr = String(grado).trim();
  const tipo = config.TIPO_MALLA;

  if (!area) return false;

  const llaveArea = normalizarTexto(area.nombre);
  const llaveEco = normalizarTexto(config.AREAS["proyecto-socioemocional"].nombre);

  if (window.MallasData[llaveArea]?.[gradoStr]) return true;

  const rutaBase = `data/${area.carpeta}/${area.prefijo}_${gradoStr}_${tipo}.json`;
  const rutaTareas = `data/${area.carpeta}/tareas_dce/t_${area.prefijo}_${gradoStr}_${tipo}.json`;
  const rutaEco = `data/${config.AREAS["proyecto-socioemocional"].carpeta}/${config.AREAS["proyecto-socioemocional"].prefijo}_${gradoStr}_${tipo}.json`;

  try {
    const [resBase, resTareas, resEco] = await Promise.all([
      fetch(rutaBase).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(rutaTareas).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(rutaEco).then(r => r.ok ? r.json() : null).catch(() => null)
    ]);

    // Validación: Si no hay malla base, el grado no existe
    if (!resBase) return false;

    // Guardar Malla Académica
    if (!window.MallasData[llaveArea]) window.MallasData[llaveArea] = {};
    window.MallasData[llaveArea][gradoStr] = { [tipo]: resBase };

    // Guardar Tareas DCE (Opcional, no bloquea)
    const llaveDCE = `tareas_dce_${llaveArea}`;
    if (resTareas) {
      if (!window.MallasData[llaveDCE]) window.MallasData[llaveDCE] = {};
      window.MallasData[llaveDCE][gradoStr] = { [tipo]: resTareas };
    }

    // Guardar ECO (Opcional, no bloquea)
    if (resEco) {
      if (!window.MallasData[llaveEco]) window.MallasData[llaveEco] = {};
      window.MallasData[llaveEco][gradoStr] = { [tipo]: resEco };
    }

    return true;
  } catch (e) {
    return false;
  }
}
// END OF FILE: js/data-loader.js | VERSION: v7.3 Stable
