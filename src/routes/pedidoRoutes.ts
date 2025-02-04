import { Router } from 'express';
import { PedidoController } from '../controllers/pedidoController';
import { validarPedido, validarFiltros, validarTransicionEstado } from '../utils/validadores';

const router = Router();
const pedidoController = new PedidoController();

// Rutas CRUD básicas
router.post('/pedidos', validarPedido, pedidoController.crearPedido);
router.put('/pedidos/:id', validarPedido, pedidoController.actualizarPedido);
router.put('/pedidos/:id/estado', validarTransicionEstado, pedidoController.actualizarEstado);
router.get('/pedidos/:id', pedidoController.obtenerPedido);
router.get('/pedidos', validarFiltros, pedidoController.listarPedidos);
router.patch('/pedidos/:id/dias-alerta', pedidoController.configurarDiasAlerta);

export default router; 