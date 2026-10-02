import * as fs from 'fs';
import * as path from 'path';

// Configuración
const RUTA_ARCHIVO = path.join(__dirname, '../../numeros.txt');
const API_URL = 'http://localhost:3000/api/contactos/masivo';
const API_KEY = 'DKD-API-PROD-2024';
const API_SECRET = 'DkDup3rS3cr3t0-2024';
const TAMAÑO_LOTE = 500;

async function subirNumeros() {
  console.log('Iniciando lectura del archivo...');
  
  if (!fs.existsSync(RUTA_ARCHIVO)) {
    console.error(`❌ El archivo no existe en la ruta: ${RUTA_ARCHIVO}`);
    process.exit(1);
  }

  // Leer y limpiar los números (quitar espacios y líneas vacías)
  const contenido = fs.readFileSync(RUTA_ARCHIVO, 'utf-8');
  const numerosRaw = contenido.split('\n').map(n => n.trim()).filter(n => n !== '');
  
  // Validar que solo tengan números
  const numeros = numerosRaw.filter(n => /^\d+$/.test(n));

  console.log(`✅ Se encontraron ${numeros.length} números válidos para procesar.`);

  // Procesar en lotes
  let procesados = 0;
  let insertadosTotales = 0;

  for (let i = 0; i < numeros.length; i += TAMAÑO_LOTE) {
    const lote = numeros.slice(i, i + TAMAÑO_LOTE);
    const body = {
      contactos: lote.map(telefono => ({ telefono }))
    };

    console.log(`⏳ Subiendo lote de ${lote.length} contactos (${i + 1} a ${Math.min(i + TAMAÑO_LOTE, numeros.length)})...`);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
          'X-API-SECRET': API_SECRET,
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`   ✅ Lote subido. ${data.datos.insertados} nuevos insertados.`);
        insertadosTotales += data.datos.insertados;
      } else {
        console.error(`   ❌ Error en el lote:`, data.mensaje || data);
      }
    } catch (error) {
      console.error(`   ❌ Error de conexión:`, error.message);
    }

    procesados += lote.length;
  }

  console.log('\n🎉 PROCESO COMPLETADO 🎉');
  console.log(`Total de números enviados: ${procesados}`);
  console.log(`Nuevos contactos insertados en la BD: ${insertadosTotales}`);
}

subirNumeros();
