# Makefile - MS-Payments + Schema Registry
.PHONY: help up down restart logs health build clean up-infra

unleash-up:
	@echo "Levantando servicios unleash..."
	docker compose -p unleash -f docker-compose-unleash.yml up -d
	@echo "✓ Servicios unleash iniciados...."

unleash-down:
	@echo "Deteniendo servicios unleash..."
	docker compose -p unleash down -v --remove-orphans
	@echo "✓ Servicios unleash detenidos"

infra-up:
	@echo "Levantando infraestructura..."
	docker-compose -p infrastructure -f docker-compose-infra.yml up -d
	@echo "✓ Infraestructura iniciada"
	@echo ""
	@echo "Próximo paso: cd ms-payments-bs && npm run start:dev"
	@echo ""

infra-down:
	@echo "Deteniendo infraestructura..."
	docker-compose -p infrastructure down -v --remove-orphans
	@echo "✓ Infraestructura detenida"

services-up:
	@echo "Levantando ms-payments-bs..."
	docker-compose -p payments-services -f docker-compose-services.yml build --no-cache
	docker-compose -p payments-services -f docker-compose-services.yml up -d
	@echo "✓ ms-payments-bs iniciado. Esperando 3 segundos..."
	docker ps

services-down:
	@echo "Deteniendo ms-payments-bs..."
	docker-compose -p payments-services down -v --remove-orphans
	docker image rm ms-payments-bs:latest
	docker builder prune --filter label=ms-payments-bs --force
	@echo "✓ ms-payments-bs detenido e imagen eliminada"

me-happy:
	@echo "Creating docker network -> payment-network"
	docker network create payments-network
	@echo "Network payments-network successfully created."
	@${MAKE} unleash-up
	@${MAKE} infra-up
	@${MAKE} services-up
	@echo "✓ Servicios iniciados. Esperando 3 segundos..."
	@sleep 3
	docker ps

me-down:
	@${MAKE} unleash-down
	@${MAKE} infra-down
	@${MAKE} services-down
	@echo "✓ Services deleted"
	@echo "Deleting docker network -> payment-network"
	docker network rm payments-network
	@echo "Network payments-network successfully deleted."
	docker ps
	docker network ls

restart:
	@echo "Reiniciando servicios..."
	docker-compose restart
	@echo "✓ Servicios reiniciados"

restart-app:
	@echo "Reiniciando ms-payments-bs..."
	docker-compose restart ms-payments-bs
	@echo "✓ App reiniciada"

logs:
	docker-compose logs -f

logs-app:
	docker-compose logs -f ms-payments-bs

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
