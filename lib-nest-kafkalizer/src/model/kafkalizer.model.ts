export interface TopicConfig {
  topic: string;
  handler: (data: any) => Promise<void>;
  schemaId?: number;
  useSchemaRegistry?: boolean;
}

export interface KafkalizerOptions {
  brokers?: string[];
  clientId?: string;
  groupId?: string;
  schemaRegistryUrl?: string;
  dlqTopic?: string;
  retryAttempts?: number;
  topics?: TopicConfig[];
  useSchemaRegistry?: boolean;
}
