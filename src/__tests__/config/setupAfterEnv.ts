import { closeTestDb } from './testDb';
import pool from '../../config/database';

beforeAll(async () => {
  console.log('Configurando ambiente de pruebas...');
  process.env.NODE_ENV = 'test';
});

afterAll(async () => {
  console.log('Limpiando ambiente de pruebas...');
  try {
    // Cerrar todas las conexiones
    await Promise.all([
      closeTestDb(),
      pool.end()
    ]);
    console.log('Conexiones cerradas correctamente');
    
    // Reducir el tiempo de espera
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (error) {
    console.error('Error al cerrar conexiones:', error);
  }
}); 