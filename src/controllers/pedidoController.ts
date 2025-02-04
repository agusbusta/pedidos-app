import { Request, Response } from 'express';
import { PedidoService } from '../services/pedidoService';
import { EstadoPedido } from '../models/Pedido';
import { FiltroPedido, PaginacionParams } from '../types/pedido.types';

export class PedidoController {
  private pedidoService: PedidoService;

  constructor() {
    this.pedidoService = new PedidoService();
  }

  public crearPedido = async (req: Request, res: Response): Promise<void> => {
    try {
      const { numero_pedido, ...datosPedido } = req.body;
      const pedido = await this.pedidoService.crearPedido(numero_pedido, datosPedido);
      res.status(201).json(pedido);
    } catch (error: unknown) {
      res.status(500).json({ error: 'Error al crear el pedido' });
    }
  };

  public actualizarPedido = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const datosPedido = req.body;
      
      const pedido = await this.pedidoService.actualizarPedido(parseInt(id), datosPedido);
      res.json(pedido);
    } catch (error: unknown) {
      res.status(500).json({ error: 'Error al actualizar el pedido' });
    }
  };

  public actualizarEstado = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const { estado, version } = req.body;
      
      console.log('🔄 Actualizando estado:', { 
        id, 
        estado, 
        version,
        params: req.params,
        body: req.body 
      });

      if (!estado) {
        res.status(400).json({ error: 'El estado es requerido' });
        return;
      }

      if (!Object.values(EstadoPedido).includes(estado)) {
        res.status(400).json({ 
          error: 'Estado inválido',
          estadosValidos: Object.values(EstadoPedido)
        });
        return;
      }

      const pedido = await this.pedidoService.actualizarEstado(
        id,
        estado as EstadoPedido,
        req.body.descripcion,
        version
      );

      res.json(pedido);
    } catch (error) {
      console.error('❌ Error en actualizarEstado:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al actualizar el estado' });
      }
    }
  };

  public obtenerPedido = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const pedido = await this.pedidoService.obtenerPedido(parseInt(id));
      if (!pedido) {
        res.status(404).json({ error: 'Pedido no encontrado' });
        return;
      }
      res.json(pedido);
    } catch (error: unknown) {
      res.status(500).json({ error: 'Error al obtener el pedido' });
    }
  };

  public listarPedidos = async (req: Request, res: Response): Promise<void> => {
    try {
      const filtros: FiltroPedido = {
        estado: req.query.estado as string,
        fechaInicio: req.query.fechaInicio as string,
        fechaFin: req.query.fechaFin as string,
        numeroPedido: req.query.numeroPedido as string
      };

      const paginacion: PaginacionParams = {
        pagina: req.query.pagina ? parseInt(req.query.pagina as string) : 1,
        limite: req.query.limite ? parseInt(req.query.limite as string) : 10
      };

      const { pedidos, total } = await this.pedidoService.listarPedidos(filtros, paginacion);
      res.json({
        pedidos,
        total,
        pagina: paginacion.pagina,
        limite: paginacion.limite,
        totalPaginas: Math.ceil(total / paginacion.limite!)
      });
    } catch (error: unknown) {
      res.status(500).json({ error: 'Error al listar los pedidos' });
    }
  };

  public configurarDiasAlerta = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { dias_alerta } = req.body;

      if (isNaN(Number(dias_alerta)) || Number(dias_alerta) < 1) {
        res.status(400).json({ error: 'Los días de alerta deben ser un número válido mayor a 0' });
        return;
      }

      const pedido = await this.pedidoService.actualizarDiasAlerta(
        parseInt(id),
        parseInt(dias_alerta)
      );
      res.json(pedido);
    } catch (error: unknown) {
      res.status(500).json({ error: 'Error al configurar días de alerta' });
    }
  };
} 