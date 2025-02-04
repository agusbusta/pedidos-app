import dotenv from 'dotenv';
import path from 'path';
import { testPool } from './testDb';
import { CREATE_TABLES } from '../../models/Pedido';

// Cargar variables de entorno del archivo .env.test
dotenv.config({ path: path.resolve(__dirname, '../../../.env.test') });

async function initTestDb() {
  try {
    // Intentar crear la base de datos si no existe
    await testPool.query(CREATE_TABLES);
    console.log('Tablas de prueba creadas correctamente');
  } catch (error) {
    console.error('Error detallado:', {
      error,
      env: {
        DB_USER: process.env.DB_USER,
        DB_HOST: process.env.DB_HOST,
        DB_NAME: process.env.DB_NAME,
        DB_PORT: process.env.DB_PORT
      }
    });
  } finally {
    await testPool.end();
  }
}

initTestDb(); 