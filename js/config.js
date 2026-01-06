// js/config.js

/**
 * CONFIGURACIÓN GLOBAL DEL APLICATIVO
 * Centraliza la identidad visual y la estructura de archivos.
 */

window.APP_CONFIG = {
  
  // 1. ÁREAS NACIONALES: Configuración de colores, rutas e identidad
  AREAS: {
    "matematicas": {
      nombre: "Matemáticas",
      clase: "area-matematicas",
      color: "#F07F3C",
      carpeta: "matematicas",
      prefijo: "matematicas"
    },
    "lenguaje": {
      nombre: "Lenguaje",
      clase: "area-lenguaje",
      color: "#FBBB21",
      carpeta: "lenguaje",
      prefijo: "lenguaje"
    },
    "ciencias-sociales": {
      nombre: "Ciencias Sociales y Ciudadanas",
      clase: "area-sociales",
      color: "#3974B9",
      carpeta: "sociales",
      prefijo: "sociales"
    },
    "ciencias-naturales": {
      nombre: "Ciencias Naturales y Ambiental",
      clase: "area-naturales",
      color: "#95C11F",
      carpeta: "naturales",
      prefijo: "naturales"
    },
    "ingles": {
      nombre: "Inglés",
      clase: "area-ingles",
      color: "#8257A0",
      carpeta: "ingles",
      prefijo: "ingles"
    },
    "proyecto-socioemocional": {
      nombre: "Proyecto Socioemocional",
      clase: "area-socioemocional",
      color: "#D94D15",
      carpeta: "Socioemocional",
      prefijo: "Socioemocional"
    }
  },

  // 2. UNIVERSO DE GRADOS: Define qué niveles buscará el cargador
  GRADOS: ["-1", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],

  // 3. ESTRUCTURA ACADÉMICA: Sufijo de los archivos JSON
  TIPO_MALLA: "4_periodos"
};
