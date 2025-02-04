import { EmailService } from '../../services/emailService';
import { EstadoPedido } from '../../models/Pedido';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
  })
}));

describe('EmailService', () => {
  let emailService: EmailService;

  beforeEach(() => {
    emailService = new EmailService();
  });

  describe('enviarAlertaDemora', () => {
    it('debe enviar email de alerta correctamente', async () => {
      const pedidoMock = {
        id: 1,
        numero_pedido: 'TEST-001',
        estado: EstadoPedido.ALERTA_DEMORA,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
        version: 1,
        dias_alerta: 3,
        destinatario: 'Test User',
        ruta: 'RUTA-001'
      };

      await expect(emailService.enviarAlertaDemora(pedidoMock))
        .resolves
        .not
        .toThrow();
    });
  });
});