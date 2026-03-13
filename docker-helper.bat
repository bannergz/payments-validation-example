@echo off
REM ============================================
REM Docker Compose Helper Script for Windows
REM ============================================

setlocal enabledelayedexpansion

color 0A

REM Verificar si docker está disponible
where docker >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker no está instalado o no está en el PATH
    exit /b 1
)

set command=%1

if "%command%"=="" (
    call :show_help
    exit /b 0
)

if /i "%command%"=="up" (
    call :up
) else if /i "%command%"=="up-infra" (
    call :up_infra
) else if /i "%command%"=="down" (
    call :down
) else if /i "%command%"=="down-v" (
    call :down_volumes
) else if /i "%command%"=="restart" (
    call :restart
) else if /i "%command%"=="restart-app" (
    call :restart_app
) else if /i "%command%"=="restart-kafka" (
    call :restart_kafka
) else if /i "%command%"=="logs" (
    call :logs
) else if /i "%command%"=="logs-app" (
    call :logs_app
) else if /i "%command%"=="logs-kafka" (
    call :logs_kafka
) else if /i "%command%"=="logs-registry" (
    call :logs_registry
) else if /i "%command%"=="ps" (
    call :ps
) else if /i "%command%"=="health" (
    call :health
) else if /i "%command%"=="build" (
    call :build
) else if /i "%command%"=="clean" (
    call :clean
) else if /i "%command%"=="help" (
    call :show_help
) else (
    echo [ERROR] Comando desconocido: %command%
    echo.
    call :show_help
    exit /b 1
)

exit /b 0

:show_help
echo.
echo ========================================
echo Docker Compose Helper - MS-Payments
echo ========================================
echo.
echo USO: docker-helper.bat [comando]
echo.
echo COMANDOS:
echo   up                    Levanta todos los servicios
echo   up-infra              Levanta solo infraestructura (sin app)
echo   down                  Detiene todos los servicios
echo   down-v                Detiene servicios y elimina volumenes (CUIDADO!)
echo   restart               Reinicia todos los servicios
echo   restart-app           Reinicia solo la app
echo   restart-kafka         Reinicia Kafka y dependencias
echo   logs                  Ver logs de todos los servicios
echo   logs-app              Ver logs de ms-payments-bs
echo   logs-kafka            Ver logs de Kafka
echo   logs-registry         Ver logs de Schema Registry
echo   ps                    Ver estado de los servicios
echo   health                Verificar health de los servicios
echo   build                 Reconstruir imagenes
echo   clean                 Detener y limpiar (mantiene datos)
echo   help                  Mostrar esta ayuda
echo.
echo EJEMPLOS:
echo   docker-helper.bat up
echo   docker-helper.bat logs-app
echo   docker-helper.bat restart-kafka
echo.
exit /b 0

:up
cls
echo.
echo ========================================
echo Levantando todos los servicios...
echo ========================================
echo.
docker-compose up -d
timeout /t 3 /nobreak
call :ps
exit /b 0

:up_infra
cls
echo.
echo ========================================
echo Levantando infraestructura...
echo ========================================
echo.
docker-compose up -d postgres mongo zookeeper kafka schema-registry kafka-ui
timeout /t 3 /nobreak
echo.
echo [INFO] Para levantar ms-payments-bs localmente:
echo        cd ms-payments-bs
echo        npm run start:dev
echo.
exit /b 0

:down
cls
echo.
echo ========================================
echo Deteniendo servicios...
echo ========================================
echo.
docker-compose down
exit /b 0

:down_volumes
echo.
echo ========================================
echo ADVERTENCIA: Esto eliminará TODOS los datos
echo ========================================
echo.
set /p confirm="¿Estás seguro? (s/n): "
if /i not "%confirm%"=="s" (
    echo Cancelado.
    exit /b 0
)
cls
echo.
echo Deteniendo servicios y eliminando volumenes...
echo.
docker-compose down -v
exit /b 0

:restart
cls
echo.
echo ========================================
echo Reiniciando todos los servicios...
echo ========================================
echo.
docker-compose restart
timeout /t 2 /nobreak
call :ps
exit /b 0

:restart_app
cls
echo.
echo ========================================
echo Reiniciando ms-payments-bs...
echo ========================================
echo.
docker-compose restart ms-payments-bs
exit /b 0

:restart_kafka
cls
echo.
echo ========================================
echo Reiniciando Kafka...
echo ========================================
echo.
docker-compose stop kafka
timeout /t 2 /nobreak
docker-compose start kafka
timeout /t 3 /nobreak
docker-compose restart schema-registry
exit /b 0

:logs
cls
echo.
echo ========================================
echo Mostrando logs (Ctrl+C para salir)...
echo ========================================
echo.
docker-compose logs -f
exit /b 0

:logs_app
cls
echo.
echo ========================================
echo Logs de ms-payments-bs (Ctrl+C para salir)...
echo ========================================
echo.
docker-compose logs -f ms-payments-bs
exit /b 0

:logs_kafka
cls
echo.
echo ========================================
echo Logs de Kafka (Ctrl+C para salir)...
echo ========================================
echo.
docker-compose logs -f kafka
exit /b 0

:logs_registry
cls
echo.
echo ========================================
echo Logs de Schema Registry (Ctrl+C para salir)...
echo ========================================
echo.
docker-compose logs -f schema-registry
exit /b 0

:ps
echo.
echo ========================================
echo Estado de los servicios
echo ========================================
echo.
docker-compose ps
echo.
exit /b 0

:health
cls
echo.
echo ========================================
echo Verificando health de servicios...
echo ========================================
echo.
docker-compose ps
echo.
echo ========================================
echo URLs de acceso
echo ========================================
echo.
echo GraphQL API:      http://localhost:3000/graphql
echo Kafka UI:         http://localhost:8080
echo Schema Registry:  http://localhost:8081
echo PostgreSQL:       localhost:5432
echo.
exit /b 0

:build
cls
echo.
echo ========================================
echo Reconstruyendo imagenes...
echo ========================================
echo.
docker-compose build
exit /b 0

:clean
cls
echo.
echo ========================================
echo Limpiando (deteniendo contenedores)...
echo ========================================
echo.
docker-compose down
exit /b 0
