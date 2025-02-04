import { Request, Response } from 'express';
import { NotificacionService } from '../services/notificacionService';
import { FiltroNotificacion } from '../types/notificacion.types';

export class NotificacionController {
  private notificacionService: NotificacionService;

  constructor() {
    this.notificacionService = new NotificacionService();
  }

  public listarNotificaciones = async (req: Request, res: Response): Promise<void> => {
    try {
      const filtros: FiltroNotificacion = {
        leida: req.query.leida === 'true',
        tipo: req.query.tipo as string,
        fechaInicio: req.query.fechaInicio as string,
        fechaFin: req.query.fechaFin as string
      };

      const paginacion = {
        pagina: req.query.pagina ? parseInt(req.query.pagina as string) : 1,
        limite: req.query.limite ? parseInt(req.query.limite as string) : 10
      };

      const { notificaciones, total } = await this.notificacionService.listarNotificaciones(
        filtros,
        paginacion
      );

      res.json({
        notificaciones,
        total,
        pagina: paginacion.pagina,
        limite: paginacion.limite,
        totalPaginas: Math.ceil(total / paginacion.limite)
      });
    } catch (error: unknown) {
      res.status(500).json({ error: 'Error al listar las notificaciones' });
    }
  };

  public marcarComoLeida = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const notificacion = await this.notificacionService.marcarComoLeida(parseInt(id));
      res.json(notificacion);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Notificación no encontrada') {
        res.status(404).json({ error: 'Notificación no encontrada' });
        return;
      }
      res.status(500).json({ error: 'Error al marcar la notificación como leída' });
    }
  };
} 