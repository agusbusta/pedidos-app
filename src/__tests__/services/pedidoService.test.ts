import { PedidoService } from '../../services/pedidoService';
import { testPool, setupTestDb, teardownTestDb } from '../config/testDb';
import { EstadoPedido } from '../../models/Pedido';

describe('PedidoService', () => {
  let pedidoService: PedidoService;

  beforeAll(() => {
    pedidoService = new PedidoService();
  });

  beforeEach(async () => {
    await setupTestDb();
  });

  afterEach(async () => {
    await teardownTestDb();
  });

  describe('crearPedido', () => {
    it('debe crear un nuevo pedido correctamente', async () => {
      const numeroPedido = 'TEST-001';
      const pedido = await pedidoService.crearPedido(numeroPedido);

      expect(pedido).toBeDefined();
      expect(pedido.numero_pedido).toBe(numeroPedido);
      expect(pedido.estado).toBe(EstadoPedido.CREADO);
    });

    it('debe fallar al crear un pedido con número duplicado', async () => {
      const numeroPedido = 'TEST-002';
      await pedidoService.crearPedido(numeroPedido);

      await expect(pedidoService.crearPedido(numeroPedido))
        .rejects
        .toThrow();
    });
  });

  describe('actualizarEstado', () => {
    it('debe actualizar el estado correctamente', async () => {
      const pedido = await pedidoService.crearPedido('TEST-003');
      const pedidoActualizado = await pedidoService.actualizarEstado(
        pedido.id!,
        EstadoPedido.PREPARACION
      );

      expect(pedidoActualizado.estado).toBe(EstadoPedido.PREPARACION);
    });

    it('debe fallar al actualizar un pedido inexistente', async () => {
      await expect(pedidoService.actualizarEstado(
        999999,
        EstadoPedido.PREPARACION
      )).rejects.toThrow('Pedido no encontrado');
    });
  });

  describe('listarPedidos', () => {
    it('debe listar pedidos con paginación', async () => {
      // Crear algunos pedidos de prueba
      await pedidoService.crearPedido('TEST-004');
      await pedidoService.crearPedido('TEST-005');
      await pedidoService.crearPedido('TEST-006');

      const { pedidos, total } = await pedidoService.listarPedidos(
        {},
        { pagina: 1, limite: 2 }
      );

      expect(pedidos).toHaveLength(2);
      expect(total).toBe(3);
    });

    it('debe filtrar pedidos por estado', async () => {
      const pedido = await pedidoService.crearPedido('TEST-007');
      await pedidoService.actualizarEstado(pedido.id!, EstadoPedido.PREPARACION);

      const { pedidos } = await pedidoService.listarPedidos(
        { estado: EstadoPedido.PREPARACION },
        { pagina: 1, limite: 10 }
      );

      expect(pedidos).toHaveLength(1);
      expect(pedidos[0].estado).toBe(EstadoPedido.PREPARACION);
    });
  });

  describe('control de concurrencia', () => {
    it('debe manejar actualizaciones concurrentes correctamente', async () => {
      const pedido = await pedidoService.crearPedido('TEST-CONCURRENCIA-001');
      const versionInicial = pedido.version;

      // Primera actualización
      const pedido1 = await pedidoService.actualizarEstado(
        pedido.id!,
        EstadoPedido.PREPARACION,
        'Actualización 1',
        versionInicial
      );

      // Intentar actualizar con la versión antigua debe fallar
      await expect(
        pedidoService.actualizarEstado(
          pedido.id!,
          EstadoPedido.DESPACHO,
          'Actualización 2',
          versionInicial
        )
      ).rejects.toThrow('Conflicto de versión');

      // La actualización con la versión correcta debe funcionar
      const pedido2 = await pedidoService.actualizarEstado(
        pedido.id!,
        EstadoPedido.DESPACHO,
        'Actualización 2',
        pedido1.version
      );

      expect(pedido2.version).toBe(pedido1.version + 1);
    });
  });
}); 