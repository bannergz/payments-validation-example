export interface KafkaConfig {
  clientId: string;
  brokers: string[];
  schemaRegistryUrl: string;
  transactionValidationRequestTopic: string;
  transactionValidationResponseTopic: string;
  transactionValidationSubject: string;
  fraudsConsumerGroupId: string;
}

export const kafkaConfig: KafkaConfig = {
  clientId: process.env.APP_NAME || 'ms-payments-bs',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
  transactionValidationRequestTopic: process.env.KAFKA_TRANSACTION_VALIDATION_REQUEST_TOPIC || 'transaction-validation-request',
  transactionValidationResponseTopic: process.env.KAFKA_TRANSACTION_VALIDATION_RESPONSE_TOPIC || 'transaction-validation-response',
  schemaRegistryUrl: process.env.SCHEMA_REGISTRY_URL || 'http://localhost:8081',
  transactionValidationSubject: process.env.KAFKA_TRANSACTION_VALIDATION_SUBJECT || 'transaction-validation-request-schema',
  fraudsConsumerGroupId: process.env.KAFKA_FRAUDS_CONSUMER_GROUP_ID || 'frauds-service-group',
};