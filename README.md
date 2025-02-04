# Sistema de Gestión de Pedidos

## Descripción
- Breve descripción del sistema
- Tecnologías principales (Node.js, Express, TypeScript, PostgreSQL)
- Propósito del sistema

## Requisitos
- Node.js >= 14
- PostgreSQL >= 12
- npm

## Instalación
1. Clonar repositorio
2. Instalar dependencias (npm install)
3. Configurar variables de entorno

## Variables de Entorno (.env)
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pedidos
DB_USER=tu_usuario
DB_PASSWORD=tu_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_app
ADMIN_EMAIL=tu_email@gmail.com
ALERTA_DESPACHO_HORAS=72

## Scripts Disponibles
- npm run dev (desarrollo)
- npm run build (compilar)
- npm start (producción)
- npm test (tests unitarios)
- npm run test:integration (tests de integración)
- npm run test:coverage (cobertura)

## Estructura del Proyecto
[Árbol de directorios detallado]

## API Endpoints

### Pedidos
- POST /api/pedidos (crear)
- PUT /api/pedidos/:id/estado (actualizar estado)
- GET /api/pedidos/:id (obtener)
- GET /api/pedidos (listar con filtros)
- PATCH /api/pedidos/:id/dias-alerta (configurar días)

### Configuración
- GET /api/configuracion/dias-alerta (obtener default)
- PUT /api/configuracion/dias-alerta (actualizar default)

## Estados del Pedido
- CREADO
- PREPARACION
- DESPACHO
- ENTREGA
- SIN_RUTA
- RETENIDO
- ALERTA_DEMORA

## Características Principales
- CRUD de pedidos
- Control de versiones
- Sistema de alertas
- Notificaciones email
- Registro de eventos
- Validación de estados
- Configuración personalizable
- Tests completos

## Estructura de Base de Datos
[Esquemas de tablas principales]
- pedidos
- eventos_pedido
- configuracion
- notificaciones


## Ejemplos de Uso

### Crear Pedido
POST /api/pedidos
Content-Type: application/json

{
    "numero_pedido": "PED-001",
    "destinatario": "Juan Pérez",
    "ruta": "ZONA-NORTE",
    "dias_alerta": 5
}

Respuesta (201):
{
    "id": 1,
    "numero_pedido": "PED-001",
    "estado": "CREADO",
    "fecha_creacion": "2024-02-04T15:08:35.947Z",
    "fecha_actualizacion": "2024-02-04T15:08:35.947Z",
    "ruta": "ZONA-NORTE",
    "destinatario": "Juan Pérez",
    "dias_alerta": 5,
    "version": 1
}

### Actualizar Estado
PUT /api/pedidos/1/estado
Content-Type: application/json

{
    "estado": "PREPARACION",
    "version": 1,
    "descripcion": "Iniciando preparación"
}

Respuesta (200):
{
    "id": 1,
    "numero_pedido": "PED-001",
    "estado": "PREPARACION",
    "fecha_actualizacion": "2024-02-04T15:10:35.947Z",
    "version": 2
}

### Listar Pedidos
GET /api/pedidos?estado=PREPARACION&pagina=1&limite=10

Respuesta (200):
{
    "pedidos": [
        {
            "id": 1,
            "numero_pedido": "PED-001",
            "estado": "PREPARACION",
            "fecha_creacion": "2024-02-04T15:08:35.947Z",
            "fecha_actualizacion": "2024-02-04T15:10:35.947Z",
            "ruta": "ZONA-NORTE",
            "destinatario": "Juan Pérez",
            "dias_alerta": 5,
            "version": 2
        }
    ],
    "total": 1,
    "pagina": 1,
    "limite": 10,
    "totalPaginas": 1
}

## Tests

### Tests Unitarios
Verifican componentes individuales:
- Validación de estados
- Lógica de servicios
- Controladores
- Utilidades

Ejecutar: npm test

### Tests de Integración
Prueban flujos completos:
- Creación y actualización de pedidos
- Sistema de alertas
- Notificaciones
- Configuración

Ejecutar: npm run test:integration

### Tests de Cobertura
Generan reportes detallados:
Ejecutar: npm run test:coverage

## Manejo de Errores

### Códigos HTTP
- 200: OK
- 201: Creado
- 400: Error de validación
- 404: No encontrado
- 409: Conflicto de versión
- 500: Error interno

### Ejemplos de Errores

#### Error de Validación
{
    "error": "El número de pedido es requerido"
}

#### Estado Inválido
{
    "error": "Estado inválido",
    "estadosValidos": [
        "CREADO",
        "PREPARACION",
        "DESPACHO",
        "ENTREGA",
        "SIN_RUTA",
        "RETENIDO",
        "ALERTA_DEMORA"
    ]
}

#### Conflicto de Versión
{
    "error": "Conflicto de versión: el pedido ha sido modificado"
}

#### Transición Inválida
{
    "error": "Transición no válida: CREADO -> ENTREGA"
} 