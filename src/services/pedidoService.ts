import pool from '../config/database';
import { IPedido, IEventoPedido, EstadoPedido } from '../models/Pedido';
import { FiltroPedido, PaginacionParams } from '../types/pedido.types';
import { AlertaService } from '../services/alertaService';
import { esTransicionValida } from '../utils/validadores';

export class PedidoService {
  private alertaService: AlertaService;

  constructor() {
    this.alertaService = new AlertaService();
  }

  public async crearPedido(
    numeroPedido: string, 
    datos?: { 
      estado?: EstadoPedido,
      destinatario?: string,
      ruta?: string,
      dias_alerta?: number 
    }
  ): Promise<IPedido> {
    const client = await pool.connect();
    try {
      console.log('🔄 Creando pedido:', { numeroPedido, datos });
      await client.query('BEGIN');

      // Obtener el valor por defecto de días_alerta
      const configQuery = await client.query(`
        SELECT valor FROM configuracion WHERE clave = 'dias_alerta_default'
      `);
      const diasAlerta = datos?.dias_alerta || configQuery.rows[0]?.valor || 3;
      console.log('📅 Días de alerta:', diasAlerta);

      const result = await client.query(`
        INSERT INTO pedidos (
          numero_pedido, 
          estado, 
          destinatario, 
          ruta, 
          dias_alerta
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [
        numeroPedido,
        datos?.estado || EstadoPedido.CREADO,
        datos?.destinatario,
        datos?.ruta,
        diasAlerta
      ]);

      await client.query(`
        INSERT INTO eventos_pedido (pedido_id, estado)
        VALUES ($1, $2)
      `, [result.rows[0].id, datos?.estado || EstadoPedido.CREADO]);

      await client.query('COMMIT');
      console.log('✅ Pedido creado:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error al crear pedido:', error);
      throw new Error(`Error al crear pedido: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      client.release();
    }
  }

  public async actualizarEstado(
    id: number,
    estado: EstadoPedido,
    descripcion?: string,
    version?: number
  ): Promise<IPedido> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Validar que el pedido existe y obtener versión actual
      const pedidoActual = await client.query(
        'SELECT * FROM pedidos WHERE id = $1 FOR UPDATE',
        [id]
      );

      if (pedidoActual.rows.length === 0) {
        throw new Error('Pedido no encontrado');
      }

      // Validar transición de estado
      if (!esTransicionValida(pedidoActual.rows[0].estado, estado)) {
        throw new Error(`Transición no válida: ${pedidoActual.rows[0].estado} -> ${estado}`);
      }

      // Verificar versión
      const currentVersion = pedidoActual.rows[0].version;
      if (version !== undefined && currentVersion !== version) {
        throw new Error('Conflicto de versión: el pedido ha sido modificado');
      }

      // Actualizar el pedido
      const pedidoResult = await client.query(
        `UPDATE pedidos 
         SET estado = $1, 
             fecha_actualizacion = CURRENT_TIMESTAMP,
             version = version + 1
         WHERE id = $2 
         AND version = $3
         RETURNING *`,
        [estado, id, currentVersion]
      );

      // Registrar el evento
      await client.query(
        'INSERT INTO eventos_pedido (pedido_id, estado, descripcion) VALUES ($1, $2, $3)',
        [id, estado, descripcion]
      );

      await client.query('COMMIT');
      return pedidoResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async obtenerPedido(id: number): Promise<IPedido | null> {
    const result = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  public async listarPedidos(
    filtros: FiltroPedido,
    paginacion: PaginacionParams
  ): Promise<{ pedidos: IPedido[]; total: number }> {
    const { pagina = 1, limite = 10 } = paginacion;
    const offset = (pagina - 1) * limite;

    let queryWhere = 'WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (filtros.estado) {
      queryWhere += ` AND estado = $${paramCount}`;
      params.push(filtros.estado);
      paramCount++;
    }

    if (filtros.numeroPedido) {
      queryWhere += ` AND numero_pedido ILIKE $${paramCount}`;
      params.push(`%${filtros.numeroPedido}%`);
      paramCount++;
    }

    if (filtros.fechaInicio) {
      queryWhere += ` AND fecha_creacion >= $${paramCount}`;
      params.push(filtros.fechaInicio);
      paramCount++;
    }

    if (filtros.fechaFin) {
      queryWhere += ` AND fecha_creacion <= $${paramCount}`;
      params.push(filtros.fechaFin);
      paramCount++;
    }

    const queryCount = `SELECT COUNT(*) FROM pedidos ${queryWhere}`;
    const queryPedidos = `
      SELECT * FROM pedidos 
      ${queryWhere}
      ORDER BY fecha_creacion DESC 
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const client = await pool.connect();
    try {
      const [totalResult, pedidosResult] = await Promise.all([
        client.query(queryCount, params),
        client.query(queryPedidos, [...params, limite, offset])
      ]);

      return {
        pedidos: pedidosResult.rows,
        total: parseInt(totalResult.rows[0].count)
      };
    } finally {
      client.release();
    }
  }

  public async actualizarDiasAlerta(id: number, diasAlerta: number): Promise<IPedido> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE pedidos SET dias_alerta = $1, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [diasAlerta, id]
      );

      if (result.rows.length === 0) {
        throw new Error('Pedido no encontrado');
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  public async actualizarPedido(id: number, datos: Partial<IPedido>): Promise<IPedido> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE pedidos 
         SET destinatario = COALESCE($1, destinatario),
             ruta = COALESCE($2, ruta),
             fecha_actualizacion = CURRENT_TIMESTAMP
         WHERE id = $3 
         RETURNING *`,
        [datos.destinatario, datos.ruta, id]
      );

      if (result.rows.length === 0) {
        throw new Error('Pedido no encontrado');
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }
} 