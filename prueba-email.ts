import dotenv from 'dotenv';
import { EmailService } from './src/services/emailService';

dotenv.config();

async function probarEmail() {
  console.log('Iniciando prueba de email...');
  const emailService = new EmailService();
  
  try {
    await emailService.enviarEmailPrueba();
    console.log('Email enviado exitosamente');
  } catch (error) {
    console.error('Error al enviar email:', error);
  }
}

probarEmail(); 