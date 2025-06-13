// Hoja de Scripts JS.

// Esta parte es del Trabajo Parcial.


// Definición de Nodo para el Árbol de Huffman
class Nodo {
  constructor(caracter, frecuencia) {
    this.caracter = caracter;
    this.frecuencia = frecuencia;
    this.izquierda = null;
    this.derecha = null;
  }
}

// Calcular frecuencias de los caracteres del texto
function calcularFrecuencias(texto) {
  const frecuencias = {};
  for (const caracter of texto) {
    frecuencias[caracter] = (frecuencias[caracter] || 0) + 1;
  }
  return frecuencias;
}

// Ordenar nodos por frecuencia (de menor a mayor)
function ordenarNodos(frecuencias) {
  const nodos = [];
  for (const caracter in frecuencias) {
    nodos.push(new Nodo(caracter, frecuencias[caracter]));
  }
  return nodos.sort((a, b) => a.frecuencia - b.frecuencia);
}

// Construir árbol de Huffman a partir de los nodos
function construirArbolHuffman(nodos) {
  while (nodos.length > 1) {
    const izquierda = nodos.shift();
    const derecha = nodos.shift();
    const nuevoNodo = new Nodo(null, izquierda.frecuencia + derecha.frecuencia);
    nuevoNodo.izquierda = izquierda;
    nuevoNodo.derecha = derecha;
    nodos.push(nuevoNodo);
    nodos.sort((a, b) => a.frecuencia - b.frecuencia);
  }
  return nodos[0];
}

// Generar códigos binarios a partir del árbol
function generarCodigos(nodo, camino = '', codigos = {}) {
  if (!nodo) return;
  if (nodo.caracter !== null) {
    codigos[nodo.caracter] = camino;
  }
  generarCodigos(nodo.izquierda, camino + '0', codigos);
  generarCodigos(nodo.derecha, camino + '1', codigos);
  return codigos;
}

// Codificar texto original con los códigos generados
function codificarTexto(texto, codigos) {
  let resultado = '';
  for (const caracter of texto) {
    resultado += codigos[caracter];
  }
  return resultado;
}

// Guardar la tabla de códigos en archivo .txt
function guardarTablaComoArchivo(codigos) {
  let contenido = '';
  for (const [caracter, codigo] of Object.entries(codigos)) {
    contenido += `${caracter}:${codigo}\n`;
  }
  const blob = new Blob([contenido], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tabla_codigos.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Leer tabla de códigos desde archivo
function leerTablaDesdeArchivo(archivo, callback) {
  const lector = new FileReader();
  lector.onload = () => {
    const lineas = lector.result.split('\n');
    const tabla = {};
    for (const linea of lineas) {
      if (linea.trim()) {
        const [caracter, codigo] = linea.split(':');
        tabla[codigo] = caracter;
      }
    }
    callback(tabla);
  };
  lector.readAsText(archivo);
}

// Decodificar el texto binario usando la tabla de códigos
function decodificarTexto(textoCodificado, tablaCodigos) {
  let resultado = '';
  let buffer = '';
  for (const bit of textoCodificado) {
    buffer += bit;
    if (buffer in tablaCodigos) {
      resultado += tablaCodigos[buffer];
      buffer = '';
    }
  }
  return resultado;
}

// Esta parte es la que agregué para le Trabajo Final.

// Una vez hecho click en el botón "Comprimir" realiza lo siguiente.
function comprimirDesdeTexto(texto) {
  const frecuencias = calcularFrecuencias(texto);
  const nodosOrdenados = ordenarNodos(frecuencias);
  const arbol = construirArbolHuffman(nodosOrdenados);
  const codigos = generarCodigos(arbol);
  const textoCodificado = codificarTexto(texto, codigos);

  // Mostrar resultados en pantalla
  document.getElementById('resultadoCodificacion').textContent = textoCodificado;
  document.getElementById('tablaCodigos').textContent = Object.entries(codigos)
    .map(([char, code]) => `${char}: ${code}`)
    .join('\n');

  // Descargar archivo comprimido
  const blob = new Blob([textoCodificado], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'archivo_comprimido.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Descargar tabla de códigos
  guardarTablaComoArchivo(codigos);
}

// Validaciones que se realizan cuando se presiona el botón "Comprimir".
function comprimirDesdeEntrada() {
  // Obtiene el texto que el usuario haya escrito manualmente
  const textoManual = document.getElementById("textoManual").value.trim();

  // Obtiene el archivo que el usuario haya subido
  const archivo = document.getElementById("archivoEntrada").files[0];

  // Caso inválido 1: el usuario llenó texto y también subió un archivo
  if (textoManual.length > 0 && archivo) {
    alert("Por favor, ingresa texto o selecciona un archivo, pero no ambos.");
    return; // Se detiene la función
  }

  // Caso 1: El usuario solo escribió texto manual
  if (textoManual.length > 0) {
    comprimirDesdeTexto(textoManual);
  }

  // Caso 2: El usuario solo subió un archivo
  else if (archivo) {
    const lector = new FileReader();
    lector.onload = () => {
      const textoArchivo = lector.result;
      comprimirDesdeTexto(textoArchivo);
    };
    lector.readAsText(archivo); // Lee el archivo como texto
  }

  // Caso inválido 2: El usuario no escribió nada ni subió archivo
  else {
    alert("Por favor, introduce un texto o selecciona un archivo para comprimir.");
  }
}




// Función principal de descompresión
function descomprimir() {
  const archivoComp = document.getElementById('archivoComprimido').files[0];
  const archivoTabla = document.getElementById('archivoTabla').files[0];
  if (!archivoComp || !archivoTabla) return;

  const lectorTexto = new FileReader();
  lectorTexto.onload = () => {
    const textoCodificado = lectorTexto.result;
    leerTablaDesdeArchivo(archivoTabla, (tablaCodigos) => {
      const textoOriginal = decodificarTexto(textoCodificado, tablaCodigos);

      // Mostrar el resultado en pantalla
      document.getElementById('resultadoDescompresion').textContent = textoOriginal;

      // Descargar archivo descomprimido
      const blob = new Blob([textoOriginal], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'archivo_descomprimido.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };
  lectorTexto.readAsText(archivoComp);
}


//Responsive botón para abrir Navegador.

document.addEventListener("DOMContentLoaded", function () {
  const openBtn = document.getElementById("menu-open-button");
  const closeBtn = document.getElementById("menu-close-button");

  if (openBtn && closeBtn) {
    openBtn.addEventListener("click", () => {
      document.body.classList.add("show-mobile-menu");
    });

    closeBtn.addEventListener("click", () => {
      document.body.classList.remove("show-mobile-menu");
    });
  }
});




