// src/app.ts
import express from 'express';
import dotenv from 'dotenv';
import pedidoRoutes from './routes/pedidoRoutes';
import notificacionRoutes from './routes/notificacionRoutes';
import pool from './config/database';
import { CREATE_TABLES } from './models/Pedido';
import { AlertaService } from './services/alertaService';
import schedule from 'node-schedule';
import configuracionRoutes from './routes/configuracionRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configuración básica
app.use(express.json());

// Rutas
app.use('/api', pedidoRoutes);
app.use('/api', notificacionRoutes);
app.use('/api', configuracionRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Sistema de Gestión de Pedidos - API');
});

// Programar verificación automática cada hora
schedule.scheduleJob('0 * * * *', async () => {
  const alertaService = new AlertaService();
  try {
    await alertaService.verificarAlertasDespacho();
  } catch (error) {
    console.error('Error en verificación automática:', error);
  }
});

pool.query(CREATE_TABLES)
  .then(() => {
    console.log('Tablas creadas/verificadas correctamente');
  })
  .catch((error: unknown) => {
    console.error('Error al crear las tablas:', error);
  });

// Solo iniciar el servidor si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
  });
}

export default app;
