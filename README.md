# Sistema de Gestión de Pedidos

API REST para gestión y seguimiento de pedidos, desarrollada con Node.js, Express, TypeScript y PostgreSQL.

## Requisitos

- Node.js >= 14
- PostgreSQL >= 12
- npm

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:

npm install

3. Configurar variables de entorno (.env):

PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestor_pedidos
DB_USER=tu_usuario
DB_PASSWORD=tu_password
ALERTA_DESPACHO_HORAS=72

## Scripts

# Desarrollo
npm run dev

# Compilar
npm run build

# Producción
npm start

# Tests
npm test

## Estructura del Proyecto

proyecto-gestion-pedidos/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   └── pedidoController.ts
│   ├── models/
│   │   └── Pedido.ts
│   ├── routes/
│   │   └── pedidoRoutes.ts
│   ├── services/
│   │   ├── pedidoService.ts
│   │   └── alertaService.ts
│   ├── utils/
│   │   └── validadores.ts
│   └── app.ts
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md

## API Endpoints

### Pedidos

#### Crear Pedido

POST /api/pedidos
Content-Type: application/json

{
  "numero_pedido": "PED001",
  "destinatario": "Juan Pérez",
  "ruta": "RUTA-001"
}

#### Actualizar Estado

PUT /api/pedidos/:id/estado

{
  "estado": "DESPACHO",
  "descripcion": "En camino a entrega"
}

#### Obtener Pedido

GET /api/pedidos/:id

#### Listar Pedidos

GET /api/pedidos

Parámetros opcionales:
- estado
- fechaInicio
- fechaFin
- numeroPedido
- pagina (default: 1)
- limite (default: 10)

#### Configurar Días de Alerta

PATCH /api/pedidos/:id/dias-alerta

{
  "dias_alerta": 5
}

## Estados de Pedido

- CREADO: Registrado en sistema
- PREPARACION: En preparación
- DESPACHO: En ruta de entrega
- ENTREGA: Entregado
- SIN_RUTA: Pendiente de ruta
- RETENIDO: Retenido
- ALERTA_DEMORA: En alerta por demora

## Características

- ✅ CRUD completo de pedidos
- ✅ Filtrado y paginación
- ✅ Sistema de alertas por demora
- ✅ Registro de eventos
- ✅ Validación de datos
- ✅ Manejo de transacciones
- ✅ Trazabilidad de estados

## Base de Datos

### Tabla: pedidos

CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  numero_pedido VARCHAR(50) UNIQUE NOT NULL,
  estado VARCHAR(20) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ruta VARCHAR(100),
  destinatario VARCHAR(200),
  dias_alerta INTEGER DEFAULT 3
);

### Tabla: eventos_pedido

CREATE TABLE eventos_pedido (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER REFERENCES pedidos(id),
  estado VARCHAR(20) NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  descripcion TEXT
);
