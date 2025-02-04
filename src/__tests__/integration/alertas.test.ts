import request from 'supertest';
import app from '../../app';
import { AlertaService } from '../../services/alertaService';
import { testPool, setupTestDb, teardownTestDb } from '../config/testDb';
import { EstadoPedido } from '../../models/Pedido';

// Mock más específico del EmailService
jest.mock('../../services/emailService', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    enviarAlertaDemora: jest.fn().mockImplementation(async () => {
      console.log('Mock: enviarAlertaDemora llamado');
      return Promise.resolve();
    }),
    enviarAlertaNoEntregado: jest.fn().mockImplementation(async () => {
      console.log('Mock: enviarAlertaNoEntregado llamado');
      return Promise.resolve();
    })
  }))
}));

describe('Sistema de Alertas', () => {
  jest.setTimeout(30000);
  
  let alertaService: AlertaService;

  beforeEach(async () => {
    try {
      console.log('⚙️ Iniciando setup...');
      await setupTestDb();
      alertaService = new AlertaService();
      console.log('✅ Setup completado');
    } catch (error) {
      console.error('❌ Error en setup:', error);
      throw error;
    }
  });

  afterEach(async () => {
    try {
      console.log('🧹 Limpiando...');
      await teardownTestDb();
      jest.clearAllMocks();
      console.log('✅ Limpieza completada');
    } catch (error) {
      console.error('❌ Error en limpieza:', error);
      throw error;
    }
  });

  describe('Alertas de Demora', () => {
    it('debe generar alerta para pedidos demorados', async () => {
      try {
        console.log('🔍 1. Creando pedido de prueba...');
        const pedidoResponse = await request(app)
          .post('/api/pedidos')
          .send({ 
            numero_pedido: 'PED-DEMORA',
            estado: EstadoPedido.CREADO,
            dias_alerta: 3
          });
        console.log('📦 Pedido creado:', pedidoResponse.body);

        console.log('⏰ 2. Simulando pedido antiguo...');
        await testPool.query(`
          UPDATE pedidos 
          SET fecha_creacion = NOW() - INTERVAL '4 days'
          WHERE id = $1
        `, [pedidoResponse.body.id]);

        console.log('🚨 3. Ejecutando verificación de alertas...');
        await alertaService.verificarAlertasDespacho();
        console.log('✅ Verificación completada');

        console.log('🔍 4. Verificando resultados...');
        const { rows: [pedidoActualizado] } = await testPool.query(
          'SELECT * FROM pedidos WHERE id = $1',
          [pedidoResponse.body.id]
        );
        console.log('Estado del pedido:', pedidoActualizado);

        const { rows: eventos } = await testPool.query(`
          SELECT * FROM eventos_pedido 
          WHERE pedido_id = $1 
          ORDER BY fecha DESC 
          LIMIT 1
        `, [pedidoResponse.body.id]);
        console.log('Último evento:', eventos[0]);

        expect(pedidoActualizado.estado).toBe('ALERTA_DEMORA');
        expect(eventos[0].estado).toBe('ALERTA_DEMORA');
        expect(eventos[0].descripcion).toBe('Pedido en alerta por demora');
        console.log('✅ Test completado exitosamente');
      } catch (error) {
        console.error('❌ Error en test:', error);
        throw error;
      }
    });
  });

  describe('Alertas de No Entrega', () => {
    it('debe generar alerta para pedidos no entregados', async () => {
      // 1. Crear pedido en estado DESPACHO
      const pedidoResponse = await request(app)
        .post('/api/pedidos')
        .send({ 
          numero_pedido: 'PED-NOENTREGA',
          estado: EstadoPedido.DESPACHO 
        });

      // 2. Simular hora de entrega pasada
      await testPool.query(`
        UPDATE pedidos 
        SET fecha_actualizacion = CURRENT_DATE + TIME '23:01:00',
            estado = $2
        WHERE id = $1
      `, [pedidoResponse.body.id, EstadoPedido.DESPACHO]);

      // 3. Ejecutar verificación
      await alertaService.verificarPedidosNoEntregados();

      // 4. Verificar eventos
      const { rows: eventos } = await testPool.query(`
        SELECT * FROM eventos_pedido 
        WHERE pedido_id = $1 
        ORDER BY fecha DESC 
        LIMIT 1
      `, [pedidoResponse.body.id]);

      expect(eventos[0].estado).toBe(EstadoPedido.DESPACHO);
      expect(eventos[0].descripcion).toBe('Pedido no entregado al final del día');
    });
  });
}); 