const fs = require("fs");
const path = require("path");

function generarArbol(dir, prefijo = "") {
  let resultado = "";
  let elementos;
  try {
    elementos = fs.readdirSync(dir);
  } catch (e) {
    return "";
  }

  // Filtramos carpetas gigantes que no necesitamos analizar
  const filtrados = elementos.filter(
    (e) =>
      ![
        "node_modules",
        ".git",
        ".next",
        ".expo",
        "dist",
        "build",
        ".supabase",
      ].includes(e),
  );

  filtrados.forEach((elemento, index) => {
    const esUltimo = index === filtrados.length - 1;
    const rutaCompleta = path.join(dir, elemento);
    const stats = fs.statSync(rutaCompleta);

    resultado += `${prefijo}${esUltimo ? "└── " : "├── "}${elemento}\n`;

    if (stats.isDirectory()) {
      resultado += generarArbol(
        rutaCompleta,
        prefijo + (esUltimo ? "    " : "│   "),
      );
    }
  });
  return resultado;
}

const arbol = "Estructura Web Clinesfera:\n" + generarArbol(".");
fs.writeFileSync("estructura.txt", arbol);
console.log("¡Mapeo completado! Revisa el archivo estructura.txt");
