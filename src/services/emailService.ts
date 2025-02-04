import nodemailer from 'nodemailer';
import { IPedido } from '../models/Pedido';

export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly ADMIN_EMAIL = 'agusbus7@gmail.com'; // Email fijo para todas las notificaciones

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  public async enviarAlertaDemora(pedido: IPedido): Promise<void> {
    await this.enviarEmail({
      from: process.env.SMTP_USER,
      to: this.ADMIN_EMAIL, // Siempre a agusbus7@gmail.com
      subject: `🚨 Alerta de Demora - Pedido ${pedido.numero_pedido}`,
      html: `
        <h1>Alerta de Demora en Pedido</h1>
        <p>El siguiente pedido ha superado el tiempo límite de ${pedido.dias_alerta} días:</p>
        <ul>
          <li><strong>Número de Pedido:</strong> ${pedido.numero_pedido}</li>
          <li><strong>Estado Actual:</strong> ${pedido.estado}</li>
          <li><strong>Fecha de Creación:</strong> ${pedido.fecha_creacion}</li>
          <li><strong>Destinatario:</strong> ${pedido.destinatario || 'No especificado'}</li>
          <li><strong>Ruta:</strong> ${pedido.ruta || 'Sin ruta asignada'}</li>
        </ul>
        <p>Por favor, tomar acción inmediata.</p>
      `
    });
  }

  public async enviarAlertaNoEntregado(pedido: IPedido): Promise<void> {
    await this.enviarEmail({
      from: process.env.SMTP_USER,
      to: this.ADMIN_EMAIL, // Usar el email fijo
      subject: `⚠️ Alerta de No Entrega - Pedido ${pedido.numero_pedido}`,
      html: `
        <h1>Alerta de Pedido No Entregado</h1>
        <p>El siguiente pedido despachado no ha sido entregado al final del día:</p>
        <ul>
          <li><strong>Número de Pedido:</strong> ${pedido.numero_pedido}</li>
          <li><strong>Estado Actual:</strong> ${pedido.estado}</li>
          <li><strong>Fecha de Despacho:</strong> ${pedido.fecha_actualizacion}</li>
          <li><strong>Destinatario:</strong> ${pedido.destinatario || 'No especificado'}</li>
          <li><strong>Ruta:</strong> ${pedido.ruta || 'Sin ruta asignada'}</li>
        </ul>
        <p>Por favor, verificar el estado del envío.</p>
      `
    });
  }

  public async enviarEmailPrueba(): Promise<void> {
    await this.enviarEmail({
      from: process.env.SMTP_USER,
      to: 'agusbus7@gmail.com',
      subject: 'Prueba de Email - Sistema de Pedidos',
      html: `
        <h1>Prueba de Email</h1>
        <p>Este es un email de prueba del sistema de gestión de pedidos.</p>
        <p>Fecha y hora: ${new Date().toLocaleString()}</p>
      `
    });
  }

  private async enviarEmail(mailOptions: nodemailer.SendMailOptions): Promise<void> {
    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email enviado correctamente a ${this.ADMIN_EMAIL}`);
    } catch (error) {
      console.error('Error al enviar email:', error);
      throw error;
    }
  }
} 