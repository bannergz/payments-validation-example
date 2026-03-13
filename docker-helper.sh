#!/bin/bash

# ============================================
# Docker Compose Helper Script
# Facilita la gestión de servicios con Docker
# ============================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Comandos disponibles
show_help() {
    cat << EOF
${BLUE}Docker Compose Helper - MS-Payments${NC}

USO: ./docker-helper.sh [comando]

COMANDOS:
  ${GREEN}up${NC}                    Levanta todos los servicios
  ${GREEN}up-infra${NC}              Levanta solo infraestructura (sin app)
  ${GREEN}down${NC}                  Detiene todos los servicios
  ${GREEN}down-v${NC}                Detiene servicios y elimina volúmenes (CUIDADO!)
  ${GREEN}restart${NC}               Reinicia todos los servicios
  ${GREEN}restart-app${NC}           Reinicia solo la app
  ${GREEN}restart-kafka${NC}         Reinicia Kafka y dependencias
  ${GREEN}logs${NC}                  Ver logs de todos los servicios
  ${GREEN}logs-app${NC}              Ver logs de ms-payments-bs
  ${GREEN}logs-kafka${NC}            Ver logs de Kafka
  ${GREEN}logs-registry${NC}         Ver logs de Schema Registry
  ${GREEN}ps${NC}                    Ver estado de los servicios
  ${GREEN}health${NC}                Verificar health de los servicios
  ${GREEN}build${NC}                 Reconstruir imágenes
  ${GREEN}clean${NC}                 Detener y limpiar (mantiene datos)
  ${GREEN}help${NC}                  Mostrar esta ayuda

EJEMPLOS:
  ./docker-helper.sh up
  ./docker-helper.sh logs-app
  ./docker-helper.sh restart-kafka

EOF
}

# Verificar si docker está disponible
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado"
        exit 1
    fi
}

# Levanta todos los servicios
up() {
    print_header "Levantando todos los servicios"
    docker-compose up -d
    print_success "Servicios iniciados"
    sleep 3
    ps
}

# Levanta solo infraestructura
up_infra() {
    print_header "Levantando infraestructura"
    docker-compose up -d postgres mongo zookeeper kafka schema-registry kafka-ui
    print_success "Infraestructura iniciada"
    print_warning "Para levantar ms-payments-bs localmente: cd ms-payments-bs && npm run start:dev"
}

# Detiene servicios
down() {
    print_header "Deteniendo servicios"
    docker-compose down
    print_success "Servicios detenidos"
}

# Detiene y elimina volúmenes
down_volumes() {
    print_warning "⚠️  ADVERTENCIA: Esto eliminará todos los datos en volúmenes"
    read -p "¿Estás seguro? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        print_header "Deteniendo servicios y eliminando volúmenes"
        docker-compose down -v
        print_success "Servicios detenidos y volúmenes eliminados"
    else
        print_warning "Cancelado"
    fi
}

# Reinicia servicios
restart() {
    print_header "Reiniciando todos los servicios"
    docker-compose restart
    print_success "Servicios reiniciados"
}

# Reinicia solo la app
restart_app() {
    print_header "Reiniciando ms-payments-bs"
    docker-compose restart ms-payments-bs
    print_success "App reiniciada"
}

# Reinicia Kafka y dependencias
restart_kafka() {
    print_header "Reiniciando Kafka"
    docker-compose stop kafka
    sleep 2
    docker-compose start kafka
    sleep 3
    docker-compose restart schema-registry
    print_success "Kafka reiniciado"
}

# Ver logs
logs() {
    print_header "Mostrando logs de todos los servicios (Ctrl+C para salir)"
    docker-compose logs -f
}

# Ver logs de la app
logs_app() {
    print_header "Mostrando logs de ms-payments-bs (Ctrl+C para salir)"
    docker-compose logs -f ms-payments-bs
}

# Ver logs de Kafka
logs_kafka() {
    print_header "Mostrando logs de Kafka (Ctrl+C para salir)"
    docker-compose logs -f kafka
}

# Ver logs de Schema Registry
logs_registry() {
    print_header "Mostrando logs de Schema Registry (Ctrl+C para salir)"
    docker-compose logs -f schema-registry
}

# Estado de servicios
ps() {
    print_header "Estado de los servicios"
    docker-compose ps
}

# Health check
health() {
    print_header "Verificando health de servicios"
    
    services=("postgres" "kafka" "schema-registry" "ms-payments-bs")
    
    for service in "${services[@]}"; do
        if docker-compose ps "$service" | grep -q "healthy"; then
            print_success "$service: ✓ Healthy"
        elif docker-compose ps "$service" | grep -q "running"; then
            print_warning "$service: ⚠ Running (esperando health)"
        elif docker-compose ps "$service" | grep -q "Exit"; then
            print_error "$service: ✗ Exited"
            docker-compose logs "$service" | tail -5
        else
            print_warning "$service: ? Desconocido"
        fi
    done
    
    echo
    print_header "URLs de acceso"
    echo -e "${GREEN}GraphQL API${NC}:      http://localhost:3000/graphql"
    echo -e "${GREEN}Kafka UI${NC}:         http://localhost:8080"
    echo -e "${GREEN}Schema Registry${NC}:  http://localhost:8081"
    echo -e "${GREEN}PostgreSQL${NC}:       localhost:5432"
}

# Reconstruir imágenes
build() {
    print_header "Reconstruyendo imágenes"
    docker-compose build
    print_success "Imágenes reconstruidas"
}

# Limpiar
clean() {
    print_header "Limpiando (deteniendo contenedores)"
    docker-compose down
    print_success "Limpieza completada"
}

# Main
main() {
    check_docker
    
    command=$1
    
    case "$command" in
        up)
            up
            ;;
        up-infra)
            up_infra
            ;;
        down)
            down
            ;;
        down-v)
            down_volumes
            ;;
        restart)
            restart
            ;;
        restart-app)
            restart_app
            ;;
        restart-kafka)
            restart_kafka
            ;;
        logs)
            logs
            ;;
        logs-app)
            logs_app
            ;;
        logs-kafka)
            logs_kafka
            ;;
        logs-registry)
            logs_registry
            ;;
        ps)
            ps
            ;;
        health)
            health
            ;;
        build)
            build
            ;;
        clean)
            clean
            ;;
        help|--help|-h|"")
            show_help
            ;;
        *)
            print_error "Comando desconocido: $command"
            echo
            show_help
            exit 1
            ;;
    esac
}

main "$@"
