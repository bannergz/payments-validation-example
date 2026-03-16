# AGENT.md — Instrucciones para Copilot/IA en este repositorio

## Objetivo General

Optimizar la corrección y creación de tests (unitarios e integración) en este proyecto Node.js/NestJS, minimizando iteraciones y asegurando compatibilidad con el linter, tipado estricto y buenas prácticas de testing.

---

## 1. Tipado y Estilo

- Usa **tipos estrictos** de TypeScript en todos los tests y mocks.
- Prefiere los **tipos globales de Jest** (`jest.SpyInstance`, etc.) en vez de imports de tipos de jest-mock o @jest/types.
- No uses `any` salvo que sea estrictamente necesario y justificado.
- Si hay conflicto de tipos, **castea explícitamente** al tipo esperado por Jest o Axios.
- Usa `unknown` para datos genéricos en mocks, pero tipa las respuestas de Axios y GraphQL.
- Sigue siempre los lineamientos del linter configurado en el repo (por ejemplo, comillas simples, no unused vars, etc.).
- Considera que trabajo con fatify

## 2. Corrección de Errores

- Antes y después de editar un archivo, **valida errores con get_errors** y corrígelos automáticamente hasta que el archivo quede limpio.
- Si hay errores de tipos, lint o sintaxis, **no termines la iteración** hasta que el archivo esté libre de errores.
- Si un error requiere castear el tipo, hazlo explícitamente.
- No uses `any` salvo que sea estrictamente necesario y justificado.
- Si hay conflicto de tipos, **castea explícitamente** al tipo esperado por Jest o Axios.
- Si un error es por imports de tipos de Jest, usa los tipos globales.
- Considera que trabajo con fatify

## 3. Test de Integración (e2e)

- Para tests e2e, **usa testcontainers** para levantar dependencias externas (Postgres, Kafka, etc.) salvo que el usuario indique lo contrario.
- No uses `any` salvo que sea estrictamente necesario y justificado.
- Si hay conflicto de tipos, **castea explícitamente** al tipo esperado por Jest o Axios.
- Si testcontainers falla, sugiere fallback a mocks pero documenta el motivo.
- Asegúrate de que los tests e2e sean independientes y puedan correr en cualquier entorno local o CI.
- Considera que trabajo con fatify

## 4. Buenas Prácticas

- No repitas código: factoriza utilidades de test en archivos como `test/integration/utils.ts`.
- Usa interfaces para las respuestas de GraphQL y Axios.
- No silencies errores con `// eslint-disable-next-line` salvo que sea absolutamente necesario y justificado.
- Si el usuario pide iteración automática, itera hasta que el archivo esté limpio sin pedir confirmación.
- Considera que trabajo con fatify

## 5. Preferencias de Iteración

- Si una corrección genera nuevos errores, **corrige en la misma sesión** hasta que el archivo esté limpio.
- Si el usuario pide "arregla los errores", asume que debe quedar sin errores de compilación ni lint.
- Considera que trabajo con fatify

---

## Ejemplo de patrón de mock seguro

```ts
return jest.spyOn(service, 'metodo').mockImplementation(
  (): Observable<AxiosResponse> =>
    of({
      ...datos,
      config: { headers: new AxiosHeaders() },
    } as AxiosResponse),
) as jest.SpyInstance<Observable<AxiosResponse>, any[]>;
```

---

## Notas

- Si el usuario cambia la configuración del linter, adapta las sugerencias automáticamente.
- Si el usuario pide integración con nuevas herramientas, documenta el patrón en este archivo.

# Buenas prácticas aplicadas en la corrección de test/integration/integration.e2e-spec.ts bajo instrucción 'corrige'

- Reemplaza imports dinámicos por imports estáticos para todos los módulos de NestJS y dependencias principales (Test, AppModule, FastifyAdapter, servicios, etc.) para asegurar el tipado estricto y evitar propagación de any.
- Usa el tipo `TestingModule` para la variable del módulo de test (`moduleFixture`), nunca any.
- Elimina todo uso de `any` en la cadena de creación de módulos y mocks; si es necesario, usa tipos explícitos o interfaces.
- Tipado estricto para variables de aplicación (`app: INestApplication | null`), instancias de Axios (`axios: AxiosInstance | null`), y mocks (`unknown` o interfaces específicas).
- Factoriza interfaces para respuestas de GraphQL y Axios (ej: `GraphQLResponse<T>`, `CreateTransactionResponse`, `RetrieveTransactionResponse`).
- Usa `as import('http').Server` para tipar el resultado de `app.getHttpServer()` y evitar any en server/address.
- Elimina todos los comentarios `eslint-disable-next-line` innecesarios; solo permite excepciones justificadas y documentadas.
- Corrige todos los errores de linter y tipado antes de terminar la iteración, incluyendo issues de CRLF, indentación y formato de genéricos en Axios.
- No silencies errores de linter, corrige la causa raíz (tipado, imports, formato, etc.).
- Valida con get_errors después de cada cambio y reitera hasta que el archivo quede limpio.
- Mantén la compatibilidad con Fastify y la configuración del entorno (env vars antes de imports).
- Si hay imports que dependen de variables de entorno, solo esos pueden ser dinámicos y deben estar justificados.
- Documenta y factoriza cualquier patrón repetido en utilidades o interfaces.
- No repitas código, factoriza utilidades y mocks en archivos de soporte si es necesario.
- Si el usuario pide "corrige", asume que debe quedar sin ningún any, sin errores de linter ni de tipos, y con imports estáticos salvo justificación explícita.
