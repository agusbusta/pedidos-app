import { AlertaService } from '../../services/alertaService';
import { PedidoService } from '../../services/pedidoService';
import { testPool, setupTestDb, teardownTestDb } from '../config/testDb';
import { EstadoPedido } from '../../models/Pedido';

jest.mock('../../services/emailService');

describe('AlertaService', () => {
  let alertaService: AlertaService;
  let pedidoService: PedidoService;

  beforeEach(async () => {
    await setupTestDb();
    alertaService = new AlertaService();
    pedidoService = new PedidoService();
  });

  afterEach(async () => {
    await teardownTestDb();
    jest.clearAllMocks();
  });

  describe('verificarAlertasDespacho', () => {
    it('debe generar alerta para pedidos demorados', async () => {
      // Crear un pedido con fecha antigua
      const pedido = await pedidoService.crearPedido('TEST-ALERTA-001');
      await testPool.query(
        'UPDATE pedidos SET fecha_creacion = NOW() - INTERVAL \'4 days\' WHERE id = $1',
        [pedido.id]
      );

      await alertaService.verificarAlertasDespacho();

      // Verificar que el pedido cambió a estado ALERTA_DEMORA
      const pedidoActualizado = await pedidoService.obtenerPedido(pedido.id!);
      expect(pedidoActualizado?.estado).toBe(EstadoPedido.ALERTA_DEMORA);
    });

    it('no debe generar alerta para pedidos recientes', async () => {
      const pedido = await pedidoService.crearPedido('TEST-ALERTA-002');
      
      await alertaService.verificarAlertasDespacho();

      const pedidoActualizado = await pedidoService.obtenerPedido(pedido.id!);
      expect(pedidoActualizado?.estado).toBe(EstadoPedido.CREADO);
    });
  });

  describe('verificarPedidosNoEntregados', () => {
    it('debe generar alerta para pedidos despachados no entregados', async () => {
      // Crear pedido y llevarlo a estado DESPACHO siguiendo el flujo correcto
      const pedido = await pedidoService.crearPedido('TEST-ALERTA-001');
      await pedidoService.actualizarEstado(pedido.id!, EstadoPedido.PREPARACION);
      await pedidoService.actualizarEstado(pedido.id!, EstadoPedido.DESPACHO);

      // Simular que pasó la hora de entrega
      await testPool.query(`
        UPDATE pedidos 
        SET fecha_actualizacion = CURRENT_DATE + TIME '23:01:00'
        WHERE id = $1
      `, [pedido.id]);

      await alertaService.verificarPedidosNoEntregados();

      const eventos = await testPool.query(`
        SELECT * FROM eventos_pedido 
        WHERE pedido_id = $1 
        ORDER BY fecha DESC 
        LIMIT 1
      `, [pedido.id]);

      expect(eventos.rows[0].estado).toBe(EstadoPedido.DESPACHO);
      expect(eventos.rows[0].descripcion).toBe('Pedido no entregado al final del día');
    });

    it('no debe generar alerta para pedidos entregados', async () => {
      // Crear pedido y llevarlo a estado ENTREGA siguiendo el flujo correcto
      const pedido = await pedidoService.crearPedido('TEST-ALERTA-002');
      await pedidoService.actualizarEstado(pedido.id!, EstadoPedido.PREPARACION);
      await pedidoService.actualizarEstado(pedido.id!, EstadoPedido.DESPACHO);
      await pedidoService.actualizarEstado(pedido.id!, EstadoPedido.ENTREGA);

      await alertaService.verificarPedidosNoEntregados();

      const eventos = await testPool.query(
        'SELECT * FROM eventos_pedido WHERE pedido_id = $1 AND descripcion = $2',
        [pedido.id, 'Pedido no entregado al final del día']
      );

      expect(eventos.rows).toHaveLength(0);
    });
  });
}); 