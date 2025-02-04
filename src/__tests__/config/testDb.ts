import { Pool } from 'pg';

const testConfig = {
  user: 'test_user',
  password: 'test_password',
  host: 'localhost',
  database: 'pedidos_test',
  port: 5432,
  max: 5 // Aumentar el número de conexiones permitidas
};

const testPool = new Pool(testConfig);

export async function setupTestDb() {
  const client = await testPool.connect();
  try {
    await client.query('BEGIN');
    await client.query('TRUNCATE pedidos, eventos_pedido, notificaciones RESTART IDENTITY CASCADE');
    await client.query('COMMIT');
  } finally {
    client.release();
  }
}

export async function teardownTestDb() {
  const client = await testPool.connect();
  try {
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
}

export async function closeTestDb() {
  await testPool.end();
}

export { testPool }; 