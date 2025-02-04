import { EstadoPedido, esTransicionValida } from '../../models/Pedido';

describe('Validaciones de Estado', () => {
  describe('esTransicionValida', () => {
    it('debe permitir transición de CREADO a PREPARACION', () => {
      expect(esTransicionValida(EstadoPedido.CREADO, EstadoPedido.PREPARACION)).toBe(true);
    });

    it('debe permitir transición de PREPARACION a DESPACHO', () => {
      expect(esTransicionValida(EstadoPedido.PREPARACION, EstadoPedido.DESPACHO)).toBe(true);
    });

    it('no debe permitir transición de CREADO a ENTREGA', () => {
      expect(esTransicionValida(EstadoPedido.CREADO, EstadoPedido.ENTREGA)).toBe(false);
    });

    it('no debe permitir transición desde ENTREGA', () => {
      expect(esTransicionValida(EstadoPedido.ENTREGA, EstadoPedido.DESPACHO)).toBe(false);
    });

    it('debe permitir transición desde ALERTA_DEMORA a PREPARACION', () => {
      expect(esTransicionValida(EstadoPedido.ALERTA_DEMORA, EstadoPedido.PREPARACION)).toBe(true);
    });
  });
}); 