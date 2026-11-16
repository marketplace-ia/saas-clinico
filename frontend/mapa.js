/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

// Carpetas que vamos a ignorar para que el mapa no sea gigantesco
const ignorar = ["node_modules", ".next", ".git", "public"];

function generarArbol(dir, prefijo = "") {
  let resultado = "";
  let archivos;

  try {
    archivos = fs.readdirSync(dir);
  } catch {
    // 🟢 CORRECCIÓN: Quitamos la (e) para que el linter no se queje de variables sin usar
    return "";
  }

  const archivosFiltrados = archivos.filter((a) => !ignorar.includes(a));

  archivosFiltrados.forEach((archivo, index) => {
    const esUltimo = index === archivosFiltrados.length - 1;
    const rutaCompleta = path.join(dir, archivo);
    const esDirectorio = fs.statSync(rutaCompleta).isDirectory();

    resultado += `${prefijo}${esUltimo ? "└── " : "├── "}${archivo}\n`;

    if (esDirectorio) {
      resultado += generarArbol(
        rutaCompleta,
        prefijo + (esUltimo ? "    " : "│   "),
      );
    }
  });

  return resultado;
}

console.log("Generando mapa topográfico del proyecto...");
const mapa = "ESTRUCTURA DEL PROYECTO (SRC):\n" + generarArbol("./src");
fs.writeFileSync("mapa_proyecto.txt", mapa);
console.log("¡Listo! Revisa el archivo 'mapa_proyecto.txt'.");
