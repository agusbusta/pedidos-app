import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

// Aumentar timeout para tests de integración
jest.setTimeout(10000); 