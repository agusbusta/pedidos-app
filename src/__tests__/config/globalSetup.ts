export default async () => {
  process.env.NODE_ENV = 'test';
  // Inicializar BD una sola vez
  await setupTestDb();
}; 