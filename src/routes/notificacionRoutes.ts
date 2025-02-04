import { Router } from 'express';
import { NotificacionController } from '../controllers/notificacionController';
import { validarFiltros } from '../utils/validadores';

const router = Router();
const notificacionController = new NotificacionController();

router.get('/notificaciones', validarFiltros, notificacionController.listarNotificaciones);
router.patch('/notificaciones/:id/leida', notificacionController.marcarComoLeida);

export default router; 