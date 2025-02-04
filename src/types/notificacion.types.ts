export interface INotificacion {
  id: number;
  pedido_id: number;
  tipo: 'DEMORA' | 'NO_ENTREGADO';
  mensaje: string;
  fecha: Date;
  leida: boolean;
  pedido?: {
    numero_pedido: string;
    estado: string;
  };
}

export interface FiltroNotificacion {
  leida?: boolean;
  tipo?: string;
  fechaInicio?: string;
  fechaFin?: string;
} 