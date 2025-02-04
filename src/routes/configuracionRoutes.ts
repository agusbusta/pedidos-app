import express, { Request, Response, Router } from 'express';
import { ConfiguracionService } from '../services/configuracionService';

const router: Router = express.Router();
const configuracionService = new ConfiguracionService();

interface ConfiguracionRequest extends Request {
  body: {
    dias: number;
  }
}

// GET /api/configuracion/dias-alerta
router.get('/configuracion/dias-alerta', 
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const dias = await configuracionService.obtenerDiasAlertaDefault();
      res.json({ dias_alerta_default: dias });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener la configuración' });
    }
});

// PUT /api/configuracion/dias-alerta
router.put('/configuracion/dias-alerta', 
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { dias } = req.body as { dias: number };
      if (!dias || dias < 1) {
        res.status(400).json({ error: 'El número de días debe ser un número positivo' });
        return;
      }
      await configuracionService.actualizarDiasAlertaDefault(dias);
      res.json({ mensaje: 'Configuración actualizada correctamente', dias_alerta_default: dias });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la configuración' });
    }
});

export default router; 