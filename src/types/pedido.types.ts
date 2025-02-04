export interface FiltroPedido {
  estado?: string;
  fechaInicio?: string;
  fechaFin?: string;
  numeroPedido?: string;
}

export interface PaginacionParams {
  pagina?: number;
  limite?: number;
} 