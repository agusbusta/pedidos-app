import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Cargar el archivo .env correcto según el ambiente
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(__dirname, `../../${envFile}`) });

const isTest = process.env.NODE_ENV === 'test';

const config = {
  user: isTest ? 'test_user' : process.env.DB_USER,
  password: isTest ? 'test_password' : process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  database: isTest ? 'pedidos_test' : process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432'),
};

const pool = new Pool(config);

// Solo verificar conexión en modo no test
if (!isTest) {
  pool.connect((err, client, release) => {
    if (err) {
      console.error('Error conectando a PostgreSQL:', err);
      return;
    }
    pool.query('SELECT NOW()', (err, result) => {
      release();
      if (err) {
        console.error('Error conectando a la base de datos:', err);
      }
    });
  });
}

pool.on('error', (err) => {
  console.error('Error inesperado del pool de conexiones:', err);
});

export default pool; 