/**
 * JSON Schema for Transaction Validation Request Event
 * Used for Kafka message validation via Schema Registry
 */
exports.TRANSACTION_VALIDATION_REQUEST_SCHEMA = {
  title: 'TransactionValidationRequest',
  description: 'Event published when a new transaction is created for validation',
  type: 'object',
  properties: {
    eventId: {
      type: 'string',
      description: 'Unique identifier for this event',
    },
    eventTimestamp: {
      type: 'string',
      description: 'ISO 8601 timestamp when the event was created',
    },
    eventType: {
      type: 'string',
      enum: ['TRANSACTION_CREATED', 'TRANSACTION_UPDATED'],
      description: 'Type of event',
    },
    transaction: {
      type: 'object',
      description: 'Transaction data',
      properties: {
        transactionExternalId: {
          type: 'string',
          description: 'External ID of the transaction',
        },
        transactionType: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'Transaction type ID',
            },
            name: {
              type: 'string',
              description: 'Transaction type name',
            },
          },
          required: ['id', 'name'],
        },
        transactionStatus: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'Transaction status ID',
            },
            name: {
              type: 'string',
              description: 'Transaction status name',
            },
          },
          required: ['id', 'name'],
        },
        value: {
          type: 'number',
          description: 'Transaction amount',
        },
        createdAt: {
          type: 'string',
          description: 'Transaction creation timestamp',
        },
      },
      required: [
        'transactionExternalId',
        'transactionType',
        'transactionStatus',
        'value',
        'createdAt',
      ],
    },
  },
  required: ['eventId', 'eventTimestamp', 'eventType', 'transaction'],
};
