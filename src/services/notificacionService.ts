import pool from '../config/database';
import { INotificacion, FiltroNotificacion } from '../types/notificacion.types';
import { PaginacionParams } from '../types/pedido.types';

export class NotificacionService {
  public async crearNotificacion(pedido_id: number, tipo: string, mensaje: string): Promise<INotificacion> {
    const result = await pool.query(
      'INSERT INTO notificaciones (pedido_id, tipo, mensaje) VALUES ($1, $2, $3) RETURNING *',
      [pedido_id, tipo, mensaje]
    );
    return result.rows[0];
  }

  public async listarNotificaciones(
    filtros: FiltroNotificacion,
    paginacion: PaginacionParams
  ): Promise<{ notificaciones: INotificacion[]; total: number }> {
    const { pagina = 1, limite = 10 } = paginacion;
    const offset = (pagina - 1) * limite;

    let queryWhere = 'WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (filtros.leida !== undefined) {
      queryWhere += ` AND n.leida = $${paramCount}`;
      params.push(filtros.leida);
      paramCount++;
    }

    if (filtros.tipo) {
      queryWhere += ` AND n.tipo = $${paramCount}`;
      params.push(filtros.tipo);
      paramCount++;
    }

    if (filtros.fechaInicio) {
      queryWhere += ` AND n.fecha >= $${paramCount}`;
      params.push(filtros.fechaInicio);
      paramCount++;
    }

    if (filtros.fechaFin) {
      queryWhere += ` AND n.fecha <= $${paramCount}`;
      params.push(filtros.fechaFin);
      paramCount++;
    }

    const queryBase = `
      FROM notificaciones n
      LEFT JOIN pedidos p ON n.pedido_id = p.id
      ${queryWhere}
    `;

    const queryCount = `SELECT COUNT(*) ${queryBase}`;
    const queryNotificaciones = `
      SELECT n.*, 
             p.numero_pedido,
             p.estado
      ${queryBase}
      ORDER BY n.fecha DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const [totalResult, notificacionesResult] = await Promise.all([
      pool.query(queryCount, params),
      pool.query(queryNotificaciones, [...params, limite, offset])
    ]);

    return {
      notificaciones: notificacionesResult.rows,
      total: parseInt(totalResult.rows[0].count)
    };
  }

  public async marcarComoLeida(id: number): Promise<INotificacion> {
    const result = await pool.query(
      'UPDATE notificaciones SET leida = true WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error('Notificación no encontrada');
    }

    return result.rows[0];
  }
} 