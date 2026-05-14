# PRD — Pagos Automáticos de DAS (Opt-in en Hub de Guías DAS)

**Producto:** Guías DAS — Mercado Pago Brasil (MLB)
**Estado:** Draft v1.1
**Fecha:** Marzo 2026
**Autor:** Producto Guías DAS
**Pendientes:** Ver Sección 11

---

## 0. Flujo en Producción — Referencia Figma

> **Fuente:** [Figma — Emisión y Pago Guía DAS MLB_Banking Seller Q1.25](https://www.figma.com/design/XuucFz5gCNAmq5IJGl0ZCS/Emisi%C3%B3n.y.Pago.Gu%C3%ADa.DAS.MLB_Banking.Seller_Q1.25)
> **Páginas clave revisadas:** `🟢 Handoff v2 - Iteración` · `↪️ Fluxo DAS <mobile>` · `🎯 Brief - Contexto`

Esta sección documenta la experiencia actual en producción sobre la que se construirá el opt-in de pagos automáticos.

### 0.1 Contexto del producto en producción

El producto fue lanzado en Q1 2025, con **mobile como prioridad** (también con versión desktop). Alcance exclusivo MLB 🇧🇷. El diferencial clave frente a competidores (incluyendo Nubank) es que Mercado Pago ofrece **emisión + pago en un solo flujo**, eliminando la necesidad de ir al Portal do Simples Nacional.

**Objetivos declarados en el brief del producto:**
- Permitir al usuario emitir la guía DAS y pagar desde el mismo flujo de Mercado Pago
- Consultar histórico de pagos: realizados, vencidos y futuros

**KPIs objetivo (declarados en Figma brief):**
- 120K usuarios PJ con pagos (crecimiento ~900% desde los 12K de enero 2025)
- TPV R$9MM/mes (crecimiento ~800% desde R$1MM/mes de enero 2025)

### 0.2 Pantallas y flujo en producción (Happy Path)

El flujo actual se estructura en las siguientes pantallas principales:

```
[Entry point]
CDP / Home de Mercado Pago
  └── Shortcut / acceso al Hub DAS
        ↓
[Hub DAS]
  Lista de períodos fiscales con sus estados:
  • A pagar (pendiente)
  • Vencido
  • Pagado ✓
        ↓
  Seller selecciona un período pendiente → "Emitir y pagar"
        ↓
[CHO — Checkout]
  Resumen del DAS a emitir
  • CNPJ, período fiscal, monto (mín. R$10)
  • Medio de pago: Account Money
        ↓
[Revise e Confirma]
  Pantalla de revisión antes de confirmar
        ↓
[Congrats]
  Confirmación de pago exitoso
  → Vuelve al Hub DAS con el período en estado "Pagado"
```

### 0.3 Estados de los períodos en el Hub DAS

| Estado | Descripción |
|---|---|
| **A pagar** | Período emitible, dentro del plazo (antes del día 20) |
| **Vencido** | Período pasado el día 20, con posibilidad de mora |
| **Pagado** | Período con pago confirmado en MP |
| **Pago externo** | Período pagado fuera de MP (detectado por SERPRO/gov.br) |

### 0.4 Árbol de decisión (lógica visible en Handoff)

El diseño documenta explícitamente estas decisiones en el flujo:

```
¿Tiene impuestos vencidos?
  └── Sí → Muestra el período vencido con estado destacado
¿Pendiente de pago?
  └── Sí → Permite iniciar emisión
  └── No (ya pagado) → Muestra estado "Pagado", sin acción disponible
¿Error UX?
  └── Errores bloqueantes (impiden continuar)
  └── Errores durante el proceso de emisión
  └── Errores del sistema o infraestructura
  └── Mensajes de error genéricos
```

### 0.5 Impactos del flujo actual en otros productos

Según el handoff, el flujo de producción impacta en:
- **Postpago DAS**: pantalla de detalle post-pago y estados
- **Activities / Bitácora**: registro de la transacción DAS en el historial de actividades del usuario
- **CDP 3.0**: punto de acceso y visualización de deudas DAS en la Central de Pagos
- **Awareness y Lembrete de pagamento DAS**: notificaciones/pendientes de recordatorio de pago

### 0.6 Casos especiales cubiertos en producción

- **FTU (First Time User)**: flujo específico para el primer acceso al hub
- **Monto mínimo (R$10)**: caso donde el monto del DAS es inferior al mínimo, con tratamiento de error diferenciado
- **Período pagado en MP**: flujo de visualización sin acción
- **Período pagado en otra institución**: caso identificado por SERPRO, sin emisión

---

## 1. Contexto y Problema

### 1.1 Contexto del producto actual
Guías DAS permite a sellers MEI (Microempreendedor Individual) emitir y pagar su DAS (Documento de Arrecadação do Simples Nacional) mensual directamente desde Mercado Pago, sin necesidad de acceder a portales gubernamentales. El flujo actual es 100% manual: el seller accede al hub, selecciona el período, emite el boleto y paga.

### 1.2 Problema
El flujo manual genera dos fricciones principales:

**Para el seller:**
- Requiere recordar y ejecutar activamente el pago mensual
- Riesgo de morosidad por olvido (el DAS vence el día 20 de cada mes)

**Para Mercado Pago:**
- Cada consulta a SERPRO para emitir un boleto tiene un **costo directo**
- En 2025 se experimentaron costos elevados por el volumen de emisiones
- El producto Single Player (pagos recurrentes desde Agenda) **no es una solución viable** porque generaría emisiones descontroladas desde Agenda sin control de costos desde Guías DAS

### 1.3 Decisión estratégica
Se implementará un **opt-in propio dentro del hub de Guías DAS** que permita al seller configurar pagos automáticos mensuales. Esto centraliza el control de emisiones SERPRO en el producto, evitando duplicidad de costos y manteniendo trazabilidad completa del ciclo de vida de cada DAS.

---

## 2. Objetivo

Permitir que sellers MEI configuren el pago automático mensual de su DAS desde el hub de Guías DAS. En la fecha configurada, el sistema emite el boleto vía SERPRO, importa la deuda al ecosistema de Agenda y ejecuta el pago automáticamente, **en la misma operación**, sin que el seller vea una deuda pendiente en CDP.

---

## 3. Audiencia

| Criterio | Detalle |
|---|---|
| Mercado | MLB (Brasil) únicamente |
| Tipo de cuenta | MEI activo (Microempreendedor Individual) |
| Scope inicial | Sellers elegibles para Guías DAS (audiencia existente) |

---

## 4. Descripción del Feature

### 4.1 Flujo General

```
Seller accede al Hub de Guías DAS
        ↓
Ve el opt-in de Pagos Automáticos
        ↓
Acepta términos y selecciona día de pago (entre 1 y 20)
        ↓
[Cada mes, en la fecha configurada]
        ↓
Sistema valida: ¿seller sigue siendo MEI activo?
  └── No → No se emite. Notificar al seller. [Ver 7.3]
  └── Sí → ¿El período ya fue pagado?
              └── Sí → Flujo "período pagado". Sin acción.
              └── No → Emite boleto vía SERPRO (período fiscal anterior)
                          ↓
                    Publica evento opt-in en Topic (BigQueue)
                          ↓
                    Agenda crea deuda + programa pago (misma operación)
                          ↓
                    one-scheduler (PX) ejecuta el pago
                          ↓
                    Estado del período → "Pagado"
                          ↓
                    Notificación al seller (PX + Agenda)
```

### 4.2 Período fiscal a emitir
Cada emisión automática corresponde al **período fiscal inmediatamente anterior** al mes en que se está emitiendo.

> **Ejemplo:** Si la fecha configurada es el día 15 y estamos en marzo 2026 → se emite el DAS de febrero 2026 (período `2026-02`).

### 4.3 Alcance temporal del opt-in
El opt-in aplica **únicamente desde el momento de activación en adelante**. No cubre períodos fiscales vencidos anteriores al opt-in.

---

## 5. Opt-in — Configuración

### 5.1 Ubicación
El opt-in se muestra dentro del **Hub de Guías DAS**, como una nueva sección/card destacada, consistente con el sistema de diseño Andes (mismo lenguaje visual que las Cards de períodos en producción).

### 5.2 Datos a capturar durante el opt-in

| Campo | Detalle |
|---|---|
| Aceptación de condiciones | Checkbox / confirmación explícita |
| Día de pago mensual | Número entre 1 y 20 |

### 5.3 Reglas sobre la fecha de pago
- El seller puede seleccionar cualquier día entre el **1 y el 20** del mes
- Si el día 20 cae en **feriado o fin de semana**, el pago se ejecuta el **siguiente día hábil**
- No se permite configurar fechas posteriores al 20 porque a partir de ese punto el DAS puede incurrir en mora

### 5.4 Método de pago
- **Primera instancia:** Account Money (saldo en cuenta Mercado Pago)
- **Pendiente:** Evaluar con equipo de Single Player si se habilita un segundo medio de pago *(ver Sección 11 — P1)*

### 5.5 Modificación y cancelación
- El seller puede **modificar la fecha** o **cancelar el opt-in** desde el mismo hub de Guías DAS
- Si cancela el opt-in en un mes donde el boleto **ya fue emitido pero aún no pagado**: la emisión permanece pendiente para pago manual

---

### 5.6 Propuesta de diseño del opt-in (basada en el flujo de producción)

> Esta propuesta toma como referencia el sistema de diseño **Andes** y los componentes ya utilizados en el flujo de producción (Cards, Pills, CHO, Revise e Confirma, Congrats).

#### Flujo de pantallas propuesto

```
[Hub DAS — estado actual]
  ┌─────────────────────────────────┐
  │  Card destacada (nueva)         │
  │  💳 Pagos automáticos DAS       │
  │  "Configurá el pago automático  │
  │   de tu DAS mensual"            │
  │  [Activar] →                    │
  └─────────────────────────────────┘
  Lista de períodos (existente)
        ↓ tap en "Activar"

[Pantalla 1 — Explicación / onboarding del opt-in]
  ┌─────────────────────────────────┐
  │  ← Pagos automáticos DAS        │
  │                                 │
  │  ¿Cómo funciona?                │
  │  • Emitimos y pagamos tu DAS    │
  │    automáticamente cada mes     │
  │  • El pago se debita de tu      │
  │    saldo en Mercado Pago        │
  │  • Podés cancelar cuando        │
  │    quieras                      │
  │                                 │
  │  [Configurar →]                 │
  └─────────────────────────────────┘
        ↓

[Pantalla 2 — Configuración de fecha]
  ┌─────────────────────────────────┐
  │  ← Configurar pago automático   │
  │                                 │
  │  ¿Qué día del mes querés        │
  │  que se realice el pago?        │
  │                                 │
  │  [  5  ] [10] [15] [20]         │
  │  ○ Elegir otro día (1–20)       │
  │                                 │
  │  Medio de pago:                 │
  │  💙 Saldo en Mercado Pago       │
  │                                 │
  └─────────────────────────────────┘
        ↓

[Pantalla 3 — Revise e Confirma (consistente con CHO actual)]
  ┌─────────────────────────────────┐
  │  ← Revisar y confirmar          │
  │                                 │
  │  Pago automático mensual        │
  │  Día de débito: 10 de cada mes  │
  │  Medio de pago: Saldo MP        │
  │                                 │
  │  Acepto los términos y          │
  │  condiciones de pagos           │
  │  automáticos DAS. ☑             │
  │                                 │
  │  [Confirmar activación]         │
  └─────────────────────────────────┘
        ↓

[Pantalla 4 — Congrats (consistente con el Congrats del flujo actual)]
  ┌─────────────────────────────────┐
  │  ✅ ¡Listo!                     │
  │  Tus pagos automáticos están    │
  │  activados                      │
  │                                 │
  │  A partir del día 10 de cada    │
  │  mes emitiremos y pagaremos     │
  │  tu DAS automáticamente.        │
  │                                 │
  │  [Volver al hub]                │
  └─────────────────────────────────┘
```

#### Estado del Hub DAS post opt-in activado

```
[Hub DAS — con opt-in activo]
  ┌─────────────────────────────────┐
  │  Card de gestión (reemplaza     │
  │  la card de activación)         │
  │  ✅ Pago automático activo      │
  │  Próximo pago: 10 de abril      │
  │  Saldo MP  [Modificar] [Cancelar│
  └─────────────────────────────────┘
  Lista de períodos (existente)
```

#### Distinción en el historial de períodos

Cuando un pago es ejecutado automáticamente, el período en el Hub DAS debe mostrar:

| Estado | Label | Diferenciación visual |
|---|---|---|
| Pagado manualmente | `Pagado` | Pill verde standard |
| Pagado automáticamente | `Pago automático` | Pill verde con icono ⚡ o "Auto" |

#### Consideraciones de diseño

- **Componentes Andes a reutilizar:** Card (mismo tipo que períodos DAS), CHO para el paso de confirmación, Congrats para el éxito — **reutilizar los mismos frames del flujo actual** para consistencia
- **FTU del opt-in:** Si el seller nunca configuró pagos automáticos, mostrar la card de activación con énfasis (estado destacado). Si ya lo tiene activo, mostrar la card de gestión
- **Mobile-first:** Igual que el flujo base, la prioridad es mobile (ver Sección 0.1)

---

## 6. Emisión y Pago Automático — Lógica de Negocio

### 6.1 Trigger mensual
El sistema evalúa diariamente qué sellers con opt-in activo tienen como **fecha configurada el día actual** y dispara el ciclo de emisión + pago.

### 6.2 Pre-validaciones antes de emitir

| Validación | Resultado si falla |
|---|---|
| Seller sigue siendo MEI activo | No se emite. Notificar al seller. [Ver 7.3] |
| El período fiscal ya fue pagado (por cualquier canal) | No se emite. Se sube al flujo existente de "período pagado" |
| Saldo suficiente en Account Money | **Pendiente definición con equipo Single Player** *(ver P2)* |

### 6.3 Comportamiento en CDP (Central de Pagos)
La deuda DAS se importa al ecosistema de Agenda y el pago se ejecuta **en la misma operación**. El objetivo es que el seller **no visualice una deuda pendiente en CDP** — la deuda se crea y se salda en el mismo ciclo, generando únicamente el registro de pago exitoso. Este comportamiento debe coordinarse con el equipo de CDP *(ver P4)*.

---

## 7. Manejo de Errores

### 7.1 Error por intermitencia (SERPRO / sistemas)
- El equipo de **IT ejecuta reintentos** automáticos sin límite definido
- Si persiste: notificar al seller que hubo un problema técnico y que puede pagar manualmente

### 7.2 Error en el pago
- Notificar al seller indicando que el pago automático no pudo procesarse
- El seller debe realizar el pago manualmente desde el hub
- **Pendiente:** Mapear todos los códigos de error posibles en la emisión SERPRO *(ver P3)*

### 7.3 Seller pierde status MEI
- El sistema detecta en la validación previa que el seller ya no es MEI
- No se emite el boleto
- Se notifica al seller y se desactiva el opt-in automático

### 7.4 Período ya pagado externamente
- Si el DAS del período consta como pagado (gov.br u otro banco): no se emite, sin notificación
- Se sigue el flujo existente de visualización de "período pagado"

---

## 8. Conflicto con Single Player (Agenda)

### 8.1 Problema
Single Player tiene su propio opt-in dentro de Agenda para pagos recurrentes. Si un seller MEI activa el opt-in de Guías DAS **y también tiene el de Single Player activo**, se generarían dos cobros para el mismo DAS, o el opt-in de Agenda no funcionaría, creando expectativa falsa y sensación de bug.

### 8.2 Decisión tomada
> Para sellers pertenecientes a la **audiencia de Guías DAS**, el opt-in de Single Player **no debe mostrarse** en el hub de Agenda para este producto específico.

### 8.3 Responsabilidad de implementación
El equipo de **Single Player** implementa la lógica de ocultamiento del opt-in en Agenda, basándose en la audiencia de Guías DAS.

### 8.4 Sellers con Single Player ya activo
No existe actualmente una base de sellers con ambos opt-ins activos simultáneamente. No se requiere migración.

---

## 9. Notificaciones

### 9.1 Pending de recordatorio (comportamiento actual)
Los sellers con opt-in activo deben ser **excluidos de la pending de recordatorio de pago manual**, ya que el pago es automático.

### 9.2 Notificaciones por evento

| Evento | Owner | Canal |
|---|---|---|
| Pago automático exitoso | PX + Agenda | Push / in-app |
| Error en pago automático | PX + Agenda | Push / in-app |
| Error técnico en emisión (intermitencia) | Team DAS (hub) | In-app (hub Guías DAS) |
| Seller dejó de ser MEI | Team DAS (hub) | In-app (hub Guías DAS) |

### 9.3 Historial en el hub
El hub de Guías DAS debe distinguir visualmente entre **pago automático** y **pago manual** en el historial de períodos.

### 9.4 Notificación previa al cobro
**Pendiente:** Definir si se envía un aviso al seller días antes del pago automático *(ver P5)*

---

## 10. Arquitectura Técnica

### 10.1 Diagrama L0 — Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│  DAS MEI — Pago Automático | Arquitectura Alto Nivel            │
└─────────────────────────────────────────────────────────────────┘

  USUARIO
  ├── Activa pago automático DAS
  ├── Visualiza deudas en CDP (no debe ver deuda pendiente)
  └── Recibe notificaciones de pago exitoso / error

  TEAM DAS
  ├── DAS Front          → UI del opt-in dentro del hub
  ├── DAS Integration API [NUEVA] → publica en BigQueue Topic
  └── DAS Debt Source    → fuente de deudas para emisión

  BigQueue Topic (evento opt-in)
  │
  ├──► sp-accounts-core-api    → Crea cuenta DAS MEI para el usuario
  └──► sp-debts-core-api       → Comando CREATE_DEBT
           │
           └──► sp-debts-payments-scheduler → programa pago inmediato
                       │
                       └──► wallet-sp-scheduled-payments-api (Recurrentes)
                                   │
                                   └──► one-scheduler (PX) → ejecuta pago
                                               │
                                               └──► Notificaciones → Usuario

  Visualización (async):
  sp-debts-input-adapter → sp-debts-query-api → CPS → CDP
```

**Flujo de datos clave:**
1. DAS publica → Evento Opt-in (Topic BigQueue)
2. Agenda consume → desde Topic
3. Agenda envía deudas → Motor de Deudas
4. Motor obtiene datos → desde Fuente de Deudas DAS
5. Adaptador CDP → CDP (solo si el pago aún no se ejecutó)
6. Programador de Pagos → Capa de Pagos Agendados (Recurrentes)
7. Motor de Ejecución ejecuta → pagos
8. Notificaciones → al usuario

---

### 10.2 Diagrama L1 — Arquitectura Técnica Detallada

```
┌─────────────────────────────────────────────────────────────────────────┐
│  DAS MEI — Pago Automático | Arquitectura Técnica Detallada             │
│  FASE 1: Opt-in y Alta de Cuenta                                        │
│  FASE 2: Importación de Deudas y Visualización en CDP                   │
│  FASE 3: Pago Automático                                                │
└─────────────────────────────────────────────────────────────────────────┘

TEAM DAS
┌─────────────────────────────────────────────────────────┐
│  DAS Front (opt-in UI)                                  │
│  DAS Integration API [NUEVA]  ──► BigQueue Topic        │
│  DAS Debt Source ◄──── (provee datos de deuda)          │
└─────────────────────────────────────────────────────────┘
         │ BigQueue Topic (evento opt-in DAS)
         │
         ├──────────────────────────────────────────────────────────────────
         │  FASE 1: Alta de Cuenta
         ├──► sp-accounts-core-api
         │       └── Crea cuenta DAS MEI para el seller
         │
         ├──────────────────────────────────────────────────────────────────
         │  FASE 2: Importación de Deuda
         └──► sp-debts-core-api
                  │  Comando: CREATE_DEBT
                  │  ├── Máquina de Estados (Spring State Machine)
                  │  ├── Motor de Eventos
                  │  ├── BQ producer (broadcast)
                  │  └── Stream producer
                  │              │
                  │              └──► sp-debts-input-adapter
                  │                       ├── Event Sourcing + CQRS
                  │                       ├── Event Store
                  │                       └── Stream ──► sp-debts-query-api
                  │                                           │
                  │                                           └── REST ──► CPS
                  │                                                    (Central Payment Services)
                  │                                                         │
                  │                                                         └── REST ──► CDP
                  │                                              (Central de Pagos — Wallet mobile+desktop)
                  │
                  ├──────────────────────────────────────────────────────────────
                  │  FASE 3: Pago Automático (misma operación que la creación de deuda)
                  └── BQ event (debt_created)
                              │
                              └──► sp-debts-payments-scheduler
                                        ├── sp-debts-payments-match   (matchea períodos, oculta pagadas)
                                        ├── sp-user-debt-configs       (config visibilidad — KVS)
                                        └── REST ──► wallet-sp-scheduled-payments-api  (Recurrentes)
                                                            │
                                                            └── delega ejecución ──► one-scheduler (PX)
                                                                                            │
                                                                                            └── Notificaciones ──► Usuario
```

---

### 10.3 Responsabilidades por equipo

| Equipo | Componentes | Tipo de desarrollo |
|---|---|---|
| **Team DAS** | DAS Front (opt-in UI), DAS Integration API, DAS Debt Source | Nuevo (API + UI) |
| **Team Agenda (Palometas)** | sp-accounts-core-api, sp-debts-core-api, sp-debts-input-adapter, sp-debts-query-api, CPS, sp-debts-payments-scheduler, sp-debts-payments-match, sp-user-debt-configs | Adaptación de servicios existentes |
| **Team Recurrentes** | wallet-sp-scheduled-payments-api | Capa de abstracción existente |
| **Team PX** | one-scheduler, Notificaciones | Servicios existentes |
| **Team Single Player** | Ocultamiento opt-in en Agenda para audiencia Guías DAS | Configuración de audiencia |

### 10.4 Protocolos de comunicación

| Protocolo | Uso |
|---|---|
| **BigQueue (async)** | Eventos opt-in, comandos CREATE_DEBT, broadcast de eventos |
| **Stream (async)** | Ingesta de deudas entre sp-debts-core-api y sp-debts-input-adapter |
| **REST (sync)** | sp-debts-query-api → CPS → CDP; scheduler → wallet-sp-scheduled-payments-api |
| **Event Sourcing + CQRS** | Arquitectura interna de sp-debts-input-adapter |

### 10.5 Decisión de diseño: Deuda no visible en CDP
La deuda DAS se genera e importa al ecosistema de Agenda, pero el pago se ejecuta en la **misma operación (mismo día/hora)**. El seller **no debe percibir una deuda pendiente** en CDP — solo el registro de pago exitoso. Este comportamiento requiere coordinación con el equipo de CDP para confirmar la ventana de visibilidad *(ver P4)*.

---

## 11. Pendientes / Open Questions

| # | Pregunta | Owner | Prioridad |
|---|---|---|---|
| P1 | ¿Se puede usar un segundo medio de pago además de Account Money? | Equipo Single Player | Alta |
| P2 | ¿Se valida saldo suficiente antes de emitir el boleto, o se emite y se notifica si falla el pago? | Equipo Single Player | Alta |
| P3 | Mapear todos los códigos de error posibles en la emisión SERPRO y su tratamiento en el hub | Equipo IT / SERPRO | Alta |
| P4 | Coordinar con CDP: ¿cómo evitar que el seller vea la deuda como "pendiente" antes del pago? ¿Impacto del alta de cuenta en sp-accounts-core-api al hacer opt-out? | Equipo CDP / Agenda | Alta |
| P5 | ¿Se envía notificación previa al cobro automático (ej: X días antes)? | UX / Producto | Media |
| P6 | Especificación técnica completa de la DAS Integration API (contratos, endpoints, payloads BigQueue) | Team DAS + Agenda | Alta |
| ~~P7~~ | ~~Confirmar flujo Figma actual en producción~~ | ✅ Resuelto — Ver Sección 0 | — |

---

## 12. Fuera de Scope (v1)

- Cobertura de períodos fiscales anteriores al opt-in
- Pagos automáticos para usuarios no-MEI
- Integración con Single Player para pagos automáticos (decisión tomada: no aplica)
- Emisión de boletos con mora/intereses (el rango 1–20 garantiza emisión antes del vencimiento)
- Segundo medio de pago (evaluación pendiente para v2)

---

## 13. Referencias

- **Figma producción (flujo actual Guías DAS):** https://www.figma.com/design/XuucFz5gCNAmq5IJGl0ZCS/Emisi%C3%B3n.y.Pago.Gu%C3%ADa.DAS.MLB_Banking.Seller_Q1.25?node-id=16910-29860
- **Flujo arquitectura técnica:** Archivo `.drawio` en carpeta Downloads (pendiente subir al repositorio)
- **Tabla BigQuery de referencia:** `meli-bi-data.BT_MP_DAS_TAX_EVENTS`
