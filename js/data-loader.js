// js/data-loader.js

/**
 * MOTOR DE CARGA UNIVERSAL
 * Utiliza la configuración de APP_CONFIG para poblar la base de datos en memoria.
 */

// Objeto global de almacenamiento
window.MallasData = {};

/**
 * Crea la estructura jerárquica para evitar errores de referencia
 */
function ensureAreaGradeTipo(area, grado, tipo) {
  if (!window.MallasData[area]) window.MallasData[area] = {};
  if (!window.MallasData[area][grado]) window.MallasData[area][grado] = {};
  if (!window.MallasData[area][grado][tipo]) window.MallasData[area][grado][tipo] = null;
}

/**
 * Función Maestra de Carga
 * Recorre todas las áreas y grados definidos en config.js
 */
async function cargarTodaLaBaseDeDatos() {
  console.log("⏳ Iniciando carga modular de mallas curriculares...");
  
  const areas = Object.values(window.APP_CONFIG.AREAS);
  const grados = window.APP_CONFIG.GRADOS;
  const tipoMalla = window.APP_CONFIG.TIPO_MALLA;
  
  const todasLasPromesas = [];

  // Recorremos cada Área definida en la configuración
  areas.forEach(area => {
    
    // Para cada área, recorremos todos los grados (desde -1 hasta 11)
    grados.forEach(gradoStr => {
      
      // Construcción dinámica de la ruta basada en config.js
      // data/[carpeta]/[prefijo]_[grado]_4_periodos.json
      const fileName = `data/${area.carpeta}/${area.prefijo}_${gradoStr}_${tipoMalla}.json`;

      const promesa = fetch(fileName)
        .then(response => {
          if (!response.ok) throw new Error(`No hallado`);
          return response.json();
        })
        .then(json => {
          // Guardamos en memoria usando el nombre oficial del Área
          ensureAreaGradeTipo(area.nombre, gradoStr, tipoMalla);
          window.MallasData[area.nombre][gradoStr][tipoMalla] = json;
          
          // Log de depuración silencioso
          // console.log(`✅ ${area.nombre} ${gradoStr}° ok`);
        })
        .catch(() => {
          // Fallo silencioso: Si el archivo no existe en el servidor, simplemente no se carga
          // Esto evita que la aplicación se detenga por archivos faltantes
        });

      todasLasPromesas.push(promesa);
    });
  });

  // Esperamos a que todas las peticiones (fetch) terminen
  try {
    await Promise.all(todasLasPromesas);
    
    // Resumen de carga para el programador
    const totalAreas = Object.keys(window.MallasData).length;
    console.log(`🚀 CARGA MODULAR FINALIZADA: ${totalAreas} áreas vinculadas.`);
  } catch (err) {
    console.error("❌ Error crítico en el motor de carga:", err);
  }
}

// Iniciar proceso de carga al cargar el script
cargarTodaLaBaseDeDatos();
