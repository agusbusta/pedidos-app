import { Request, Response, NextFunction } from 'express';
import { EstadoPedido, TRANSICIONES_ESTADO } from '../models/Pedido';
import { PedidoService } from '../services/pedidoService';

export const validarPedido = (req: Request, res: Response, next: NextFunction): void => {
  const { numero_pedido } = req.body;

  if (!numero_pedido || typeof numero_pedido !== 'string' || numero_pedido.trim() === '') {
    res.status(400).json({ error: 'El número de pedido es requerido' });
    return;
  }

  next();
};

export const validarFiltros = (req: Request, res: Response, next: NextFunction): void => {
  const { pagina, limite } = req.query;

  if (pagina && isNaN(Number(pagina))) {
    res.status(400).json({ error: 'El número de página debe ser un número válido' });
    return;
  }

  if (limite && isNaN(Number(limite))) {
    res.status(400).json({ error: 'El límite debe ser un número válido' });
    return;
  }

  next();
};

export const validarTransicionEstado = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { estado: nuevoEstado } = req.body;

    if (!Object.values(EstadoPedido).includes(nuevoEstado)) {
      res.status(400).json({ error: 'Estado no válido' });
      return;
    }

    const pedidoService = new PedidoService();
    const pedido = await pedidoService.obtenerPedido(parseInt(id));

    if (!pedido) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }

    if (!esTransicionValida(pedido.estado, nuevoEstado)) {
      res.status(400).json({ 
        error: 'Transición de estado no válida',
        mensaje: `No se puede cambiar de ${pedido.estado} a ${nuevoEstado}`,
        transicionesPermitidas: TRANSICIONES_ESTADO[pedido.estado]
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Error al validar la transición de estado' });
  }
};

export function esTransicionValida(estadoActual: EstadoPedido, nuevoEstado: EstadoPedido): boolean {
  return TRANSICIONES_ESTADO[estadoActual]?.includes(nuevoEstado) || false;
} 