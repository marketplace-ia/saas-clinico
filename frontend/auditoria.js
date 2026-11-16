/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

function buscarVacios(dir) {
  const archivos = fs.readdirSync(dir);
  archivos.forEach((archivo) => {
    const rutaCompleta = path.join(dir, archivo);
    if (fs.statSync(rutaCompleta).isDirectory()) {
      if (
        !rutaCompleta.includes("node_modules") &&
        !rutaCompleta.includes(".next")
      ) {
        buscarVacios(rutaCompleta);
      }
    } else {
      if (fs.statSync(rutaCompleta).size === 0) {
        console.log("⚠️ Archivo vacío detectado:", rutaCompleta);
      }
    }
  });
}

console.log("Iniciando escaneo de archivos vacíos...");
buscarVacios("./src");
console.log("Escaneo finalizado.");
