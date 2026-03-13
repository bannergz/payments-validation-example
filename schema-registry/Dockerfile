# Dockerfile for Confluent Schema Registry
# Extends the official Confluent Schema Registry image with custom initialization

FROM confluentinc/cp-schema-registry:7.8.7

# Set environment variables for Schema Registry
ENV SCHEMA_REGISTRY_LISTENERS=http://0.0.0.0:8081
ENV SCHEMA_REGISTRY_KAFKASTORE_BOOTSTRAP_SERVERS=kafka:29092
ENV SCHEMA_REGISTRY_LOG4J_ROOT_LOGLEVEL=INFO

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8081/subjects || exit 1

# Expose the Schema Registry port
EXPOSE 8081
