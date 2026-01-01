// js/render-nucleo.js

/**
 * Renderiza la malla curricular de las áreas del Núcleo Común.
 * Utiliza una estructura de bloques verticales para facilitar la lectura.
 */
window.renderTablaMallas = function(items) {
  const container = document.getElementById('tabla-body');
  if (!container) return;

  // Limpiar contenido previo
  container.innerHTML = '';

  if (!items || items.length === 0) {
    container.innerHTML = '<p class="sin-resultados">No se encontraron resultados para esta selección.</p>';
    return;
  }

  // Generar el HTML vertical para cada ítem de la malla
  container.innerHTML = items.map(item => `
    <div class="item-malla">
      <h3>${item.componente || 'Sin componente'}</h3>
      
      ${item.estandar ? `
        <div class="campo">
          <strong>Estándar:</strong>
          <div>${item.estandar}</div>
        </div>
      ` : ''}
      
      ${item.dba && item.dba.length > 0 ? `
        <div class="campo">
          <strong>DBA (Derechos Básicos de Aprendizaje):</strong>
          <div>${Array.isArray(item.dba) ? item.dba.join('<br><br>') : item.dba}</div>
        </div>
      ` : ''}
      
      ${item.evidencias && item.evidencias.length > 0 ? `
        <div class="campo">
          <strong>Evidencias de Aprendizaje:</strong>
          <div>${Array.isArray(item.evidencias) ? item.evidencias.join('<br><br>') : item.evidencias}</div>
        </div>
      ` : ''}
      
      ${item.saberes && item.saberes.length > 0 ? `
        <div class="campo">
          <strong>Saberes / Temas:</strong>
          <div>${Array.isArray(item.saberes) ? item.saberes.join(' • ') : item.saberes}</div>
        </div>
      ` : ''}
    </div>
  `).join('');

  // Agregar funcionalidad de "Click para copiar" a cada tarjeta
  document.querySelectorAll('.item-malla').forEach(card => {
    card.addEventListener('click', function() {
      copiarContenido(this);
    });
  });
};

/**
 * Copia el texto de la tarjeta al portapapeles y da feedback visual
 */
function copiarContenido(elemento) {
  const seleccion = window.getSelection();
  const rango = document.createRange();
  rango.selectNodeContents(elemento);
  seleccion.removeAllRanges();
  seleccion.addRange(rango);

  try {
    document.execCommand('copy');
    // Feedback visual: destello verde suave
    const colorOriginal = elemento.style.backgroundColor;
    elemento.style.backgroundColor = '#e8f5e9';
    setTimeout(() => {
      elemento.style.backgroundColor = colorOriginal;
      seleccion.removeAllRanges();
    }, 1000);
  } catch (err) {
    console.error('Error al copiar:', err);
  }
}
