me-happy:
	@echo "Creating docker network -> payments-network"
	docker network create payments-network
	@echo "Network payments-network successfully created."
	@${MAKE} unleash-up
	@${MAKE} infra-up
	@echo ""
	@echo "Ejecutando prisma migration de inicializacion"
	npx prisma migrate dev
	@echo "Prisma migration successfull."

me-down:
	@${MAKE} unleash-down
	@${MAKE} infra-down
	@echo "Deleting docker network -> payment-network"
	docker network rm payments-network
	@echo "Network payments-network successfully deleted."

schema:
	@echo "Registrando esquema transaction-validation-request-schema en Schema Registry..."
	curl -X POST -H "Content-Type: application/vnd.schemaregistry.v1+json" \
	--data @../schema-registry/schema/subjects/transaction-validation-request.schema.json \
	http://localhost:8081/subjects/transaction-validation-request-schema/versions
	@echo "✓ Esquemas registrados exitosamente en Schema Registry."

build:
	@echo "Reconstruyendo imágenes..."
	docker-compose build
	@echo "✓ Imágenes reconstruidas"

unleash-up:
	@echo "Levantando servicios unleash..."
	docker compose -p unleash -f ../docker-compose-unleash.yml up -d
	@echo "✓ Servicios unleash iniciados...."

unleash-down:
	@echo "Deteniendo servicios unleash..."
	docker compose -p unleash down -v --remove-orphans
	@echo "✓ Servicios unleash detenidos"

infra-up:
	@echo "Levantando infraestructura..."
	docker-compose -p infrastructure -f ../docker-compose-infra.yml up -d postgres zookeeper kafka schema-registry kafka-ui
	@echo "✓ Infraestructura iniciada"
	@echo ""
	@echo "Próximo paso: cd ms-payments-bs && npm run start:dev"
	@echo ""

infra-down:
	@echo "Deteniendo infraestructura..."
	docker-compose -p infrastructure down -v --remove-orphans
	@echo "✓ Infraestructura detenida"