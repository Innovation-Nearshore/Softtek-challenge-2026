const swaggerJsdoc = require('swagger-jsdoc');

const definition = {
  openapi: '3.0.0',
  info: {
    title: 'Gestor de Solicitudes API',
    version: '1.0.0',
    description:
      'API REST para la gestión de solicitudes internas. Permite crear y consultar solicitudes almacenadas en PostgreSQL (schema reto_c).',
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Servidor local de desarrollo',
    },
  ],
  components: {
    schemas: {
      Solicitud: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'Identificador interno autogenerado',
            example: 1,
          },
          numero_ticket: {
            type: 'string',
            description: 'Código de ticket generado automáticamente (TCK-<timestamp>)',
            example: 'TCK-1716730800000',
          },
          tipo_solicitud_id: {
            type: 'integer',
            description: 'ID del tipo de solicitud (FK a tipos_solicitud)',
            example: 1,
          },
          titulo: {
            type: 'string',
            description: 'Título breve de la solicitud',
            example: 'Falla en impresora del piso 3',
          },
          descripcion: {
            type: 'string',
            description: 'Descripción detallada del problema o solicitud',
            example: 'La impresora HP LaserJet no enciende desde esta mañana.',
          },
          urgencia: {
            type: 'string',
            enum: ['Alta', 'Media', 'Baja'],
            description: 'Nivel de urgencia de la solicitud',
            example: 'Alta',
          },
          estado: {
            type: 'string',
            enum: ['Recibida', 'En revisión', 'Resuelta', 'Rechazada', 'Cancelada'],
            description: 'Estado actual de la solicitud',
            example: 'Recibida',
          },
          solicitante: {
            type: 'string',
            description: 'Nombre completo del solicitante',
            example: 'Ana García',
          },
          email_solicitante: {
            type: 'string',
            format: 'email',
            description: 'Correo electrónico del solicitante',
            example: 'ana.garcia@empresa.com',
          },
          area_solicitante_id: {
            type: 'integer',
            description: 'ID del área del solicitante (FK a areas)',
            example: 2,
          },
          tipo_solicitud: {
            type: 'string',
            description: 'Nombre del tipo de solicitud (join)',
            example: 'Soporte técnico',
          },
          area_solicitante: {
            type: 'string',
            description: 'Nombre del área solicitante (join)',
            example: 'IT',
          },
          fecha_creacion: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha y hora de creación (autogenerada)',
            example: '2025-05-26T14:00:00.000Z',
          },
        },
      },
      SolicitudInput: {
        type: 'object',
        required: [
          'tipo_solicitud_id',
          'titulo',
          'descripcion',
          'urgencia',
          'solicitante',
          'email_solicitante',
          'area_solicitante_id',
        ],
        properties: {
          tipo_solicitud_id: {
            type: 'integer',
            example: 1,
          },
          titulo: {
            type: 'string',
            example: 'Falla en impresora del piso 3',
          },
          descripcion: {
            type: 'string',
            example: 'La impresora HP LaserJet no enciende desde esta mañana.',
          },
          urgencia: {
            type: 'string',
            enum: ['Alta', 'Media', 'Baja'],
            example: 'Alta',
          },
          solicitante: {
            type: 'string',
            example: 'Ana García',
          },
          email_solicitante: {
            type: 'string',
            format: 'email',
            example: 'ana.garcia@empresa.com',
          },
          area_solicitante_id: {
            type: 'integer',
            example: 2,
          },
        },
      },
      Area: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'Identificador del área',
            example: 1,
          },
          nombre: {
            type: 'string',
            description: 'Nombre del área',
            example: 'Finanzas',
          },
        },
      },
      StatusUpdate: {
        type: 'object',
        required: ['estado'],
        properties: {
          estado: {
            type: 'string',
            enum: ['Recibida', 'En revisión', 'Resuelta', 'Rechazada', 'Cancelada'],
            example: 'En revisión',
          },
        },
      },
      StatusUpdateResponse: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          estado: {
            type: 'string',
            example: 'En revisión',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Missing required fields: titulo',
          },
        },
      },
    },
  },
};

const options = {
  definition,
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
