export enum EstadoPedido {
  CREADO = 'CREADO',
  PREPARACION = 'PREPARACION',
  DESPACHO = 'DESPACHO',
  ENTREGA = 'ENTREGA',
  SIN_RUTA = 'SIN_RUTA',
  RETENIDO = 'RETENIDO',
  ALERTA_DEMORA = 'ALERTA_DEMORA'
}

export interface IPedido {
  id?: number;
  numero_pedido: string;
  estado: EstadoPedido;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  dias_alerta: number;  // Personalizable por pedido
  version: number;
  destinatario: string;
  ruta: string;
}

export interface IEventoPedido {
  id?: number;
  pedido_id: number;
  estado: EstadoPedido;
  fecha: Date;
  descripcion?: string;
}

type TransicionesEstado = {
  [K in EstadoPedido]: EstadoPedido[];
};

export const TRANSICIONES_ESTADO: TransicionesEstado = {
  [EstadoPedido.CREADO]: [EstadoPedido.PREPARACION, EstadoPedido.SIN_RUTA],
  [EstadoPedido.PREPARACION]: [EstadoPedido.DESPACHO],
  [EstadoPedido.DESPACHO]: [EstadoPedido.ENTREGA, EstadoPedido.RETENIDO],
  [EstadoPedido.SIN_RUTA]: [EstadoPedido.PREPARACION],
  [EstadoPedido.RETENIDO]: [EstadoPedido.DESPACHO],
  [EstadoPedido.ENTREGA]: [], // Estado final
  [EstadoPedido.ALERTA_DEMORA]: [EstadoPedido.PREPARACION, EstadoPedido.DESPACHO]
};

export function esTransicionValida(estadoActual: EstadoPedido, nuevoEstado: EstadoPedido): boolean {
  return TRANSICIONES_ESTADO[estadoActual]?.includes(nuevoEstado) || false;
}

// SQL para crear las tablas:
export const CREATE_TABLES = `
  CREATE TABLE IF NOT EXISTS configuracion (
    clave VARCHAR(50) PRIMARY KEY,
    valor INTEGER NOT NULL,
    descripcion TEXT,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Insertar valor por defecto si no existe
  INSERT INTO configuracion (clave, valor, descripcion)
  VALUES ('dias_alerta_default', 3, 'Días por defecto para alertas de demora')
  ON CONFLICT (clave) DO NOTHING;

  CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    numero_pedido VARCHAR(50) UNIQUE NOT NULL,
    estado VARCHAR(20) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ruta VARCHAR(100),
    destinatario VARCHAR(200),
    dias_alerta INTEGER DEFAULT 3,  -- Valor por defecto hardcodeado
    version INTEGER DEFAULT 1,
    CHECK (estado IN ('CREADO', 'PREPARACION', 'DESPACHO', 'ENTREGA', 'SIN_RUTA', 'RETENIDO', 'ALERTA_DEMORA'))
  );

  CREATE TABLE IF NOT EXISTS eventos_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id),
    estado VARCHAR(20) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descripcion TEXT,
    CHECK (estado IN ('CREADO', 'PREPARACION', 'DESPACHO', 'ENTREGA', 'SIN_RUTA', 'RETENIDO', 'ALERTA_DEMORA'))
  );

  CREATE TABLE IF NOT EXISTS notificaciones (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id),
    tipo VARCHAR(20) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leida BOOLEAN DEFAULT false,
    CHECK (tipo IN ('DEMORA', 'NO_ENTREGADO'))
  );
`; 