import request from 'supertest';
import app from '../../app';
import { EstadoPedido } from '../../models/Pedido';
import { setupTestDb } from '../config/testDb';

describe('API Pedidos', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  it('debe realizar operaciones CRUD básicas', async () => {
    // Crear
    const createResponse = await request(app)
      .post('/api/pedidos')
      .send({
        numero_pedido: 'PED-001',
        destinatario: 'Juan Pérez',
        ruta: 'RUTA-001'
      });

    expect(createResponse.status).toBe(201);
    const pedidoId = createResponse.body.id;

    // Actualizar
    const updateResponse = await request(app)
      .put(`/api/pedidos/${pedidoId}/estado`)
      .send({ estado: EstadoPedido.PREPARACION });

    expect(updateResponse.status).toBe(200);

    // Obtener
    const getResponse = await request(app)
      .get(`/api/pedidos/${pedidoId}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.estado).toBe(EstadoPedido.PREPARACION);
  });

  it('debe manejar errores correctamente', async () => {
    const errorResponse = await request(app)
      .post('/api/pedidos')
      .send({});

    expect(errorResponse.status).toBe(400);
  });
}); 