import { IPedido } from '../models/Pedido';
import pool from '../config/database';
import { EmailService } from './emailService';

export class AlertaService {
  private emailService: EmailService;
  
  constructor() {
    this.emailService = new EmailService();
  }

  public async verificarAlertasDespacho(): Promise<void> {
    const client = await pool.connect();
    try {
      console.log('🔄 Iniciando verificación de alertas...');
      await client.query('BEGIN');

      const query = `
        SELECT p.* FROM pedidos p
        WHERE (
          estado = 'CREADO' 
          AND fecha_creacion < NOW() - (COALESCE(dias_alerta, 3) || ' days')::INTERVAL
        )
        AND estado NOT IN ('ALERTA_DEMORA', 'DESPACHO', 'ENTREGA')
      `;

      const result = await client.query(query);
      console.log('📊 Pedidos encontrados:', result.rows);

      for (const pedido of result.rows) {
        console.log(`🔄 Procesando pedido ${pedido.id}...`);
        
        await client.query(
          'UPDATE pedidos SET estado = $1, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = $2',
          ['ALERTA_DEMORA', pedido.id]
        );
        console.log('✅ Estado actualizado');

        await client.query(
          'INSERT INTO eventos_pedido (pedido_id, estado, descripcion) VALUES ($1, $2, $3)',
          [pedido.id, 'ALERTA_DEMORA', `Pedido en alerta por demora`]
        );
        console.log('✅ Evento registrado');

        await this.emailService.enviarAlertaDemora(pedido);
        console.log('✅ Email enviado');
      }

      await client.query('COMMIT');
      console.log('✅ Transacción completada');
    } catch (error) {
      console.error('❌ Error en verificación:', error);
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async verificarPedidosNoEntregados(): Promise<void> {
    const query = `
      SELECT p.* FROM pedidos p
      WHERE estado = 'DESPACHO'
      AND DATE(fecha_actualizacion) = CURRENT_DATE
      AND CURRENT_TIME > TIME '23:00:00'
    `;

    const result = await pool.query(query);
    const pedidosSinEntregar = result.rows;

    for (const pedido of pedidosSinEntregar) {
      await this.generarAlertaNoEntregado(pedido);
    }
  }

  private async generarAlertaNoEntregado(pedido: IPedido): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Registrar evento
      await client.query(
        'INSERT INTO eventos_pedido (pedido_id, estado, descripcion) VALUES ($1, $2, $3)',
        [
          pedido.id,
          pedido.estado,
          `Pedido no entregado al final del día`
        ]
      );

      await client.query('COMMIT');
      
      // Enviar notificación por email
      await this.emailService.enviarAlertaNoEntregado(pedido);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
} 