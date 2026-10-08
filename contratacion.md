# Módulo de Contratación - Especificación de Base de Datos

> **Objetivo:** Completar la tripleta vendible: Inventario + Documentos + Contratación
> **Estrategia:** v1.0 con 3 tablas (vendible), v2.0 con 7 tablas (premium)
> **Stack:** NestJS + TypeORM + PostgreSQL (multi-tenant por `companyId`)

---

## Roadmap de Implementación

**Estado actual:** Fase 1 implementada en backend y frontend. La fase premium continúa pendiente.

### FASE 1 - v1.0 VENDIBLE (Esta semana)

Con esto ya puedes vender. Flujo: Crear tercero -> Crear contrato -> Ver vencimientos.

- [x] Tabla 1: `contract_third_parties`
- [x] Tabla 2: `contract_types`
- [x] Tabla 3: `contracts`

### FASE 2 - v2.0 PREMIUM (Con primer cliente pago)

Con esto justificas subir de $50 a $100/mes.

- [ ] Tabla 4: `contract_documents` (Integración con módulo Documentos)
- [ ] Tabla 6: `contract_payment_schedule` (Hitos de pago)
- [ ] Tabla 5: `contract_addendums` (Otrosíes)
- [ ] Tabla 7: `contract_alerts` (Notificaciones)

---

## 1. `contract_third_parties`

Base de terceros. No mezclar con tabla de usuarios internos todavía.

| Campo            | Tipo           | Restricciones                       | Descripción                       |
| :--------------- | :------------- | :---------------------------------- | :-------------------------------- |
| `id`             | `uuid`         | PK, default: uuid_generate_v4()     | Identificador único               |
| `companyId`      | `uuid`         | FK -> companies, NOT NULL, INDEX    | Aislamiento multi-tenant          |
| `type`           | `enum`         | NOT NULL                            | `NATURAL`, `JURIDICA`, `EMPLEADO` |
| `name`           | `varchar(255)` | NOT NULL                            | Nombre corto / comercial          |
| `legal_name`     | `varchar(255)` | NULL                                | Razón social completa             |
| `tax_id`         | `varchar(20)`  | NOT NULL, UNIQUE(companyId, tax_id) | NIT / CC                          |
| `email`          | `varchar(255)` | NULL                                | Contacto principal                |
| `phone`          | `varchar(50)`  | NULL                                |                                   |
| `address`        | `varchar(255)` | NULL                                |                                   |
| `contact_person` | `varchar(255)` | NULL                                | Persona de contacto en empresa    |
| `is_active`      | `boolean`      | DEFAULT true                        | Soft delete lógico                |
| `risk_level`     | `enum`         | DEFAULT 'BAJO'                      | `BAJO`, `MEDIO`, `ALTO`           |
| `createdAt`      | `timestamp`    | auto                                |                                   |
| `updatedAt`      | `timestamp`    | auto                                |                                   |

**Índices:** `UNIQUE(companyId, tax_id)`, `INDEX(companyId, is_active)`

## 2. `contract_types`

Hace el módulo configurable por cada empresa. No hardcodear tipos en el frontend.

| Campo             | Tipo           | Restricciones                    | Descripción                                                                 |
| :---------------- | :------------- | :------------------------------- | :-------------------------------------------------------------------------- |
| `id`              | `uuid`         | PK                               |                                                                             |
| `companyId`       | `uuid`         | FK -> companies, NOT NULL, INDEX |                                                                             |
| `code`            | `enum`         | NOT NULL                         | `PRESTACION_SERVICIOS`, `OBRA`, `SUMINISTRO`, `LABORAL`, `ARRIENDO`, `OTRO` |
| `name`            | `varchar(100)` | NOT NULL                         | Ej: "Prestación de Servicios"                                               |
| `requires_policy` | `boolean`      | DEFAULT false                    | Si exige póliza (para validación)                                           |
| `is_active`       | `boolean`      | DEFAULT true                     |                                                                             |
| `createdAt`       | `timestamp`    | auto                             |                                                                             |
| `updatedAt`       | `timestamp`    | auto                             |                                                                             |

**Índices:** `UNIQUE(companyId, code)`

**Seed inicial:** La primera consulta al catálogo crea de forma idempotente los 6 tipos del enum para la empresa. No depende de que el usuario cree los tipos manualmente.

## 3. `contracts`
**TABLA MADRE.** Con esta sola tabla ya puedes vender el módulo.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK | |
| `companyId` | `uuid` | FK, NOT NULL, INDEX | |
| `title` | `varchar(255)` | NOT NULL | Ej: "Contrato Suministro Papelería 2026" |
| `contract_number` | `varchar(50)` | NOT NULL | Ej: "CTR-2026-001" |
| `contract_type_id` | `uuid` | FK -> contract_types, NOT NULL | |
| `third_party_id` | `uuid` | FK -> contract_third_parties, NOT NULL | |
| `object` | `text` | NOT NULL | Objeto del contrato (largo) |
| `status` | `enum` | NOT NULL, DEFAULT 'BORRADOR' | `BORRADOR`, `VIGENTE`, `POR_VENCER`, `VENCIDO`, `LIQUIDADO`, `TERMINADO`, `SUSPENDIDO` |
| `total_value` | `decimal(18,2)` | NOT NULL | Valor total |
| `start_date` | `date` | NOT NULL | Fecha inicio ejecución |
| `end_date` | `date` | NOT NULL | Fecha fin ejecución |
| `signature_date` | `date` | NULL | Fecha firma |
| `payment_terms` | `enum` | NULL | `MENSUAL`, `UNICO`, `POR_HITOS`, `TRIMESTRAL` |
| `supervisor_id` | `uuid` | FK -> users, NULL | Responsable interno |
| `created_by` | `uuid` | FK -> users, NOT NULL | Auditoría |
| `createdAt` | `timestamp` | auto | |
| `updatedAt` | `timestamp` | auto | |

**Índices:** 
- `UNIQUE(companyId, contract_number)` - CRÍTICO
- `INDEX(companyId, status)`
- `INDEX(companyId, end_date)` - Para alertas de vencimiento
- `INDEX(companyId, third_party_id)`

**Lógica de negocio:**
- `POR_VENCER` = `end_date` <= NOW() + 30 días y status = VIGENTE (calcular por cron o vista)
- `VENCIDO` = `end_date` < NOW() y status = VIGENTE


## 4. `contract_documents`
**Truco de la tripleta.** No duplicar archivos, reutilizar `UploadsModule` y tabla de documentos existente.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK | |
| `companyId` | `uuid` | FK, NOT NULL | |
| `contract_id` | `uuid` | FK -> contracts, NOT NULL, INDEX, ON DELETE CASCADE | |
| `storageKey` | `varchar(500)` | NOT NULL | `docs/{companyId}/{folderId}/{filename}` - De tu UploadsService |
| `originalName` | `varchar(255)` | NOT NULL | Nombre original del archivo |
| `doc_type` | `enum` | NOT NULL | `CONTRATO_FIRMADO`, `POLIZA`, `RUT`, `CC`, `CAMARA_COMERCIO`, `OTROSI`, `ACTA_INICIO`, `ACTA_LIQUIDACION` |
| `is_required` | `boolean` | DEFAULT false | Si es obligatorio por tipo de contrato |
| `uploaded_by` | `uuid` | FK -> users | |
| `createdAt` | `timestamp` | auto | |

**Relación:** Un contrato tiene muchos `contract_documents`. Un documento físico es un archivo en `/uploads`.


## 5. `contract_addendums`
Otrosíes / Adiciones / Prórrogas. Sin esto no sirve en Colombia.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK | |
| `companyId` | `uuid` | FK, NOT NULL | |
| `contract_id` | `uuid` | FK -> contracts, NOT NULL, INDEX, CASCADE | |
| `addendum_number` | `varchar(20)` | NOT NULL | Ej: "OTROSI-01" |
| `type` | `enum` | NOT NULL | `ADICION_VALOR`, `PRORROGA_TIEMPO`, `ADICION_Y_PRORROGA`, `MODIFICACION_CLAUSULA` |
| `description` | `text` | NOT NULL | Justificación |
| `additional_value` | `decimal(18,2)` | DEFAULT 0 | Valor que adiciona |
| `previous_end_date` | `date` | NULL | Para trazabilidad |
| `new_end_date` | `date` | NULL | Nueva fecha fin si hay prórroga |
| `signed_at` | `date` | NULL | Fecha firma del otrosí |
| `createdAt` | `timestamp` | auto | |

**Índices:** `UNIQUE(companyId, contract_id, addendum_number)`

**Trigger sugerido:** Al insertar, actualizar `contracts.total_value` y `contracts.end_date`.

## 6. `contract_payment_schedule`

Hitos de pago. Feature que hace que paguen mes a mes.

| Campo                | Tipo            | Restricciones                             | Descripción                                 |
| :------------------- | :-------------- | :---------------------------------------- | :------------------------------------------ |
| `id`                 | `uuid`          | PK                                        |                                             |
| `companyId`          | `uuid`          | FK, NOT NULL                              |                                             |
| `contract_id`        | `uuid`          | FK -> contracts, NOT NULL, INDEX, CASCADE |                                             |
| `installment_number` | `int`           | NOT NULL                                  | 1, 2, 3...                                  |
| `concept`            | `varchar(255)`  | NOT NULL                                  | Ej: "Pago 1 - Anticipo 30%"                 |
| `due_date`           | `date`          | NOT NULL                                  | Fecha vencimiento pago                      |
| `amount`             | `decimal(18,2)` | NOT NULL                                  | Monto de la cuota                           |
| `status`             | `enum`          | DEFAULT 'PENDIENTE'                       | `PENDIENTE`, `PAGADO`, `VENCIDO`, `PARCIAL` |
| `invoice_number`     | `varchar(100)`  | NULL                                      | Número de factura asociada                  |
| `paid_at`            | `date`          | NULL                                      |                                             |
| `createdAt`          | `timestamp`     | auto                                      |                                             |

**Índices:** `UNIQUE(companyId, contract_id, installment_number)`, `INDEX(companyId, due_date, status)`



## 7. `contract_alerts`
Feature premium. Te hace ver pro sin mucho código (cron job diario).

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK | |
| `companyId` | `uuid` | FK, NOT NULL | |
| `contract_id` | `uuid` | FK -> contracts, NOT NULL, INDEX, CASCADE | |
| `type` | `enum` | NOT NULL | `VENCIMIENTO_30_DIAS`, `VENCIMIENTO_15_DIAS`, `VENCIDO`, `POLIZA_POR_VENCER`, `PAGO_VENCIDO`, `PAGO_PROXIMO` |
| `trigger_date` | `date` | NOT NULL | Fecha en que debe dispararse |
| `is_sent` | `boolean` | DEFAULT false | |
| `sent_at` | `timestamp` | NULL | |
| `createdAt` | `timestamp` | auto | |

**Índices:** `INDEX(is_sent, trigger_date)` - Para el cron

**Cron:** `@Cron('0 8 * * *')` -> Buscar alerts con `is_sent=false` y `trigger_date <= hoy`, enviar email.

## Enums Globales (Crear en TypeORM)

```typescript
export enum ThirdPartyType {
  NATURAL = "NATURAL",
  JURIDICA = "JURIDICA",
  EMPLEADO = "EMPLEADO",
}
export enum ContractTypeCode {
  PRESTACION_SERVICIOS = "PRESTACION_SERVICIOS",
  OBRA = "OBRA",
  SUMINISTRO = "SUMINISTRO",
  LABORAL = "LABORAL",
  ARRIENDO = "ARRIENDO",
  OTRO = "OTRO",
}
export enum ContractStatus {
  BORRADOR = "BORRADOR",
  VIGENTE = "VIGENTE",
  POR_VENCER = "POR_VENCER",
  VENCIDO = "VENCIDO",
  LIQUIDADO = "LIQUIDADO",
  TERMINADO = "TERMINADO",
  SUSPENDIDO = "SUSPENDIDO",
}
export enum PaymentTerms {
  MENSUAL = "MENSUAL",
  UNICO = "UNICO",
  POR_HITOS = "POR_HITOS",
  TRIMESTRAL = "TRIMESTRAL",
}
export enum ContractDocType {
  CONTRATO_FIRMADO = "CONTRATO_FIRMADO",
  POLIZA = "POLIZA",
  RUT = "RUT",
  CC = "CC",
  CAMARA_COMERCIO = "CAMARA_COMERCIO",
  OTROSI = "OTROSI",
  ACTA_INICIO = "ACTA_INICIO",
  ACTA_LIQUIDACION = "ACTA_LIQUIDACION",
}
export enum AddendumType {
  ADICION_VALOR = "ADICION_VALOR",
  PRORROGA_TIEMPO = "PRORROGA_TIEMPO",
  ADICION_Y_PRORROGA = "ADICION_Y_PRORROGA",
  MODIFICACION_CLAUSULA = "MODIFICACION_CLAUSULA",
}
export enum PaymentStatus {
  PENDIENTE = "PENDIENTE",
  PAGADO = "PAGADO",
  VENCIDO = "VENCIDO",
  PARCIAL = "PARCIAL",
}
export enum AlertType {
  VENCIMIENTO_30_DIAS = "VENCIMIENTO_30_DIAS",
  VENCIMIENTO_15_DIAS = "VENCIMIENTO_15_DIAS",
  VENCIDO = "VENCIDO",
  POLIZA_POR_VENCER = "POLIZA_POR_VENCER",
  PAGO_VENCIDO = "PAGO_VENCIDO",
  PAGO_PROXIMO = "PAGO_PROXIMO",
}
```

## Implementación Actual

- API protegida en `/contracting`: contratos, terceros y tipos; las consultas y referencias se validan con el `companyId` autenticado.
- Pantalla `/contracting`: alta de contratos y terceros, consulta de vencimientos y edición de nombre, estado y requisito de póliza por tipo.
- El consecutivo `CTR-${YEAR}-${sequence}` se genera en backend con bloqueo transaccional por empresa y año. El usuario no lo digita.
- Un cron diario actualiza `POR_VENCER` y `VENCIDO` para contratos vigentes. El usuario puede iniciar un contrato como borrador o vigente.
- `requires_policy` se configura, pero su validación contra documentos queda pendiente hasta integrar la fase premium.
- Desarrollo crea las tablas con `DB_SYNCHRONIZE=true`. En producción `migrationsRun` está desactivado y no existe una migración para estas tablas; antes de desplegar hay que incorporarlas a la estrategia de migraciones. No habilitar `synchronize` en producción.

## Notas de Implementación para tu proyecto

1.  Todas las entidades deben extender tu `BaseEntity` con `companyId`.
2.  El servicio filtra y valida explícitamente cada relación por `companyId`; el `TenantSubscriber` sigue activo globalmente.
3.  `contract_number` generar con un servicio: `CTR-${YEAR}-${sequence}` con secuencia por company.
4.  El `AuditInterceptor` global ya está activo en `AppModule`.
5.  Permisos: `contracting:read`, `contracting:write`, `contracting:admin`
