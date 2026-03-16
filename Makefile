success:
	@if docker network inspect payments-network >/dev/null 2>&1; then \
		echo -e "Docker network \033[32m payments-network already exists. \xE2\x9C\x94 \033[0m Continuing..."; \
	else \
		echo "Creating docker \033[32m network payments-network... \033[0m"; \
		docker network create payments-network; \
		echo -e "Docker network\033[32m payments-network created successfully. \xE2\x9C\x94 \033[0m"; \
	fi

me-happy:
	@if docker network inspect payments-network >/dev/null 2>&1; then \
		echo -e "Docker network \033[32m payments-network already exists. \xE2\x9C\x94 \033[0m Continuing..."; \
	else \
		echo "Creating docker \033[32m network payments-network... \033[0m"; \
		docker network create payments-network; \
		echo -e "Docker network\033[32m payments-network created successfully. \xE2\x9C\x94 \033[0m"; \
	fi
	@${MAKE} unleash-up
	@${MAKE} infra-up
	@${MAKE} schema
	@${MAKE} kafka-topics
	@${MAKE} services-up
	@echo -e "\033[32m \xE2\x9C\x94 \033[0m Services started. Waiting 3 seconds..."
	@sleep 3
	docker ps

me-down:
	@${MAKE} unleash-down
	@${MAKE} infra-down
	@${MAKE} services-down
	@echo -e "\033[32m \xE2\x9C\x94 \033[0m Services deleted"
	@echo "Deleting docker network -> payment-network"
	docker network rm payments-network
	@echo -e "\033[32m \xE2\x9C\x94 \033[0m Network \033[32m payments-network \033[0m successfully deleted."
	docker ps
	docker network ls

schema:
	@echo "Registering transaction-validation-request-schema in Schema Registry..."
	curl -X POST -H "Content-Type: application/vnd.schemaregistry.v1+json" \
	--data @./schema-registry/schema/subjects/transaction-validation-request.schema.json \
	http://localhost:8081/subjects/transaction-validation-request-schema/versions
	@echo -e "\033[32m \xE2\x9C\x94 \033[0m Schemas successfully registered in Schema Registry."

kafka-topics:
	@echo "Creating topics..."
	docker exec kafka kafka-topics --bootstrap-server localhost:9092 --create --topic transaction-validation-request --partitions 1 --replication-factor 1 --if-not-exists
	docker exec kafka kafka-topics --bootstrap-server localhost:9092 --create --topic transaction-validation-response --partitions 1 --replication-factor 1 --if-not-exists
	docker exec kafka kafka-configs --bootstrap-server localhost:9092 --entity-type topics --entity-name transaction-validation-request --alter --add-config compression.type=snappy
	docker exec kafka kafka-configs --bootstrap-server localhost:9092 --entity-type topics --entity-name transaction-validation-response --alter --add-config compression.type=snappy
	@echo -e "\033[32m \xE2\x9C\x94 \033[0m Topics successfully created."
	
unleash-up:
	@echo "Starting unleash services..."
	docker compose -p unleash -f docker-compose-unleash.yml up -d
	@echo -e "\033[32m \xE2\x9C\x94 \033[0m Unleash services started...."

unleash-down:
	@echo "Stopping unleash services..."
	docker compose -p unleash down -v --remove-orphans
	@echo -e "\033[32m \xE2\x9C\x94 \033[0m Unleash services stopped"

infra-up:
	@echo "Starting infrastructure..."
	docker-compose -p infrastructure -f docker-compose-infra.yml up -d
	@echo -e "\033[32m \xE2\x9C\x94 \033[0m Infrastructure started"
	@echo ""
	@echo "Next step: cd ms-payments-bs && npm run start:dev"
	@echo ""

infra-down:
	@echo "Stopping infrastructure..."
	docker-compose -p infrastructure down -v --remove-orphans
	@echo -e "\033[32m \xE2\x9C\x94 \033[0m Infrastructure stopped"

services-up:
	@echo "Starting ms-payments-bs..."
	docker-compose -p payments-service -f docker-compose-services.yml build --no-cache ms-payments-bs
	docker-compose -p payments-service -f docker-compose-services.yml up -d ms-payments-bs
	@echo -e "\033[32m \xE2\x9C\x94 \033[0m ms-payments-bs started."
	@echo "Starting ms-frauds-bs..."
	docker-compose -p frauds-service -f docker-compose-services.yml build --no-cache ms-frauds-bs
	docker-compose -p frauds-service -f docker-compose-services.yml up -d ms-frauds-bs
	@echo -e "\033[32m \xE2\x9C\x94 \033[0m ms-frauds-bs started."

services-down:
	@echo "Stopping ms-payments-bs..."
	docker-compose -p payments-service down -v --remove-orphans
	docker image rm ms-payments-bs:latest
	docker builder prune --filter label=ms-payments-bs --force
	@echo -e "\033[32m \xE2\x9C\x94  ms-payments-bs \033[0m stopped and \033[32m image removed \033[0m"
	@echo "Stopping ms-frauds-bs..."
	docker-compose -p frauds-service down -v --remove-orphans
	docker image rm ms-frauds-bs:latest
	docker builder prune --filter label=ms-frauds-bs --force
	@echo -e "\033[32m \xE2\x9C\x94 ms-frauds-bs \033[0m stopped and \033[32m image removed \033[0m"

logs-kafka:
	docker-compose logs -f kafka

logs-registry:
	docker-compose logs -f schema-registry

health:
	@echo "=========================================="
	@echo "Estado de servicios"
	@echo "=========================================="
	@docker-compose ps
	@echo ""
	@echo "=========================================="
	@echo "URLs de acceso"
	@echo "=========================================="
	@echo "GraphQL API:      http://localhost:3000/graphql"
	@echo "Kafka UI:         http://localhost:8080"
	@echo "Schema Registry:  http://localhost:8081"
	@echo "PostgreSQL:       localhost:5432"
	@echo ""
