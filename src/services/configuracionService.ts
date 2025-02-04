import pool from '../config/database';

export class ConfiguracionService {
  public async actualizarDiasAlertaDefault(dias: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      console.log('🔄 Actualizando configuración de días de alerta...');
      
      // Actualizar la configuración
      const updateConfig = await client.query(`
        UPDATE configuracion 
        SET valor = $1, fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE clave = 'dias_alerta_default'
        RETURNING *
      `, [dias]);
      
      console.log('✅ Configuración actualizada:', updateConfig.rows[0]);

      // Ya no intentamos modificar el DEFAULT de la tabla
      // porque PostgreSQL no lo permite en runtime
      
      await client.query('COMMIT');
      console.log('✅ Transacción completada');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error al actualizar configuración:', error);
      throw new Error(`Error al actualizar configuración: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      client.release();
    }
  }

  public async obtenerDiasAlertaDefault(): Promise<number> {
    try {
      const result = await pool.query(`
        SELECT valor 
        FROM configuracion 
        WHERE clave = 'dias_alerta_default'
      `);
      return result.rows[0]?.valor || 3;
    } catch (error) {
      console.error('❌ Error al obtener configuración:', error);
      throw new Error(`Error al obtener configuración: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
} 