# 📘 Guía DAS - Sistema Fiscal Brasil

**Documento de Arrecadação do Simples Nacional (DAS)**

---

## 📖 Índice

1. [¿Qué es DAS?](#qué-es-das)
2. [Contexto de Negocio](#contexto-de-negocio)
3. [Flujo del Sistema Fiscal](#flujo-del-sistema-fiscal)
4. [Roles y Responsabilidades](#roles-y-responsabilidades)
5. [Problema que Resuelve el Dashboard](#problema-que-resuelve-el-dashboard)
6. [Sistema de Notificaciones (Pendings)](#sistema-de-notificaciones-pendings)
7. [Glosario de Términos](#glosario-de-términos)

---

## 🇧🇷 ¿Qué es DAS?

### Definición

El **DAS (Documento de Arrecadação do Simples Nacional)** es el documento único de recaudación tributaria para empresas brasileñas inscritas en el régimen del Simples Nacional.

### Características Clave

- **Régimen Simplificado**: Unifica hasta 8 impuestos diferentes en un solo documento
- **Periodicidad**: Mensual
- **Vencimiento**: Día 20 de cada mes (para el mes anterior)
- **Cálculo**: Basado en facturación del mes anterior
- **Emisión**: Generada automáticamente por SERPRO (sistema federal)

### Impuestos Incluidos

El DAS puede incluir:
1. IRPJ - Impuesto sobre la Renta de Personas Jurídicas
2. CSLL - Contribución Social sobre el Lucro Líquido
3. PIS/PASEP - Programa de Integración Social
4. COFINS - Contribución para Financiamiento de la Seguridad Social
5. IPI - Impuesto sobre Productos Industrializados
6. ICMS - Impuesto sobre Circulación de Mercaderías y Servicios
7. ISS - Impuesto sobre Servicios
8. CPP - Contribución Patronal Previsional

---

## 🏢 Contexto de Negocio

### Sellers de Mercado Pago en Brasil

**Perfil de Usuarios**:
- Pequeñas y medianas empresas (Simples Nacional)
- Vendedores que usan Mercado Pago como procesador de pagos
- Facturación mensual variable
- Mayormente no tienen equipo contable sofisticado

**Desafío**:
- Muchos sellers no saben que deben pagar DAS
- No entienden cómo calcular el monto
- Pierden la fecha de vencimiento
- Enfrentan multas e intereses por pago tardío

**Rol de Mercado Pago**:
- Genera emisiones fiscales (SERPRO-Emission) automáticamente
- Notifica a sellers sobre obligación de pago
- Proporciona facilidades para realizar el pago
- **NO paga directamente** - el seller debe hacer el pago

---

## 🔄 Flujo del Sistema Fiscal

### Diagrama del Proceso

```
┌─────────────────────────────────────────────────────────────┐
│  PASO 1: Facturación del Seller                             │
│  - Seller vende productos/servicios                         │
│  - Mercado Pago procesa pagos                               │
│  - Se acumula facturación del mes                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  PASO 2: Emisión Fiscal (SERPRO-Emission)                   │
│  - SERPRO calcula impuesto basado en facturación            │
│  - Genera DAS con monto a pagar                             │
│  - Evento registrado en BT_MP_DAS_TAX_EVENTS                │
│  - EVENT_TYPE = 'SERPRO-Emission'                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  PASO 3: Pending en Home (Opcional)                         │
│  - Sistema muestra pending en home del seller               │
│  - "Tienes un DAS pendiente de pago"                        │
│  - Registrado en DIM_PENDINGS                               │
│  - content_id = 'mp.sellers.generic_pendings.das_payment...'│
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  PASO 4: Decisión del Seller                                │
│                                                              │
│  ┌──────────────────┐              ┌──────────────────┐    │
│  │  Paga el DAS     │              │  Ignora/Pospone  │    │
│  └────────┬─────────┘              └────────┬─────────┘    │
│           │                                  │              │
│           ▼                                  ▼              │
│  ┌──────────────────┐              ┌──────────────────┐    │
│  │ Evento: Payment  │              │  No hay evento   │    │
│  │ Registrado en    │              │  Posible multa   │    │
│  │ TAX_EVENTS       │              │  en futuro       │    │
│  └──────────────────┘              └──────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Ejemplo Concreto

**Mes de Enero 2026**:

1. **Facturación**: Seller vende R$ 50,000 durante enero
2. **Emisión (Feb 5)**: SERPRO genera DAS por R$ 2,500 (5% aprox)
3. **Pending (Feb 5)**: Seller ve en su home "DAS de R$ 2,500 vence el 20/Feb"
4. **Pago (Feb 18)**: Seller paga R$ 2,500
5. **Registro**: Sistema registra evento "Payment" en BigQuery

---

## 👥 Roles y Responsabilidades

### 1. **SERPRO** (Serviço Federal de Processamento de Dados)
**Qué hace**:
- Calcula el monto del DAS
- Genera el documento fiscal
- Envía información a Mercado Pago

**NO hace**:
- No cobra el dinero
- No gestiona los pendings del seller

### 2. **Mercado Pago**
**Qué hace**:
- Procesa la facturación del seller
- Recibe emisiones fiscales de SERPRO
- Muestra pendings en la home del seller sobre obligaciones
- Facilita medios de pago
- Registra eventos en BigQuery

**NO hace**:
- No calcula el impuesto (lo hace SERPRO)
- No paga el DAS por el seller
- No es responsable si el seller no paga

### 3. **Seller**
**Qué hace**:
- Vende productos/servicios
- Ve pendings en su home
- Debe pagar el DAS antes del vencimiento

**NO hace**:
- No calcula manualmente (lo hace SERPRO)
- No puede evitar la obligación fiscal

### 4. **Equipo de Tax (Nosotros)**
**Qué hace**:
- Monitorea emisiones vs pagos
- Analiza efectividad del sistema de pendings
- Identifica sellers en riesgo
- Propone mejoras al flujo

---

## 🔔 Sistema de Notificaciones (Pendings)

### ¿Qué son los "Pendings"?

**Pendings son puntos de awareness en la home del seller** que le indican acciones pendientes, como pagos de DAS que deben realizar.

### Tipos de Notificaciones DAS

**content_id**: `mp.sellers.generic_pendings.das_payment_pendings`

**Criticidad**: Variable según cercanía al vencimiento
- **Alta**: Falta 1-3 días para vencer
- **Media**: Falta 4-10 días
- **Baja**: Falta >10 días

### Ciclo de Vida de un Pending

```
┌──────────────────────────────────────────────────────┐
│  Estado: CREATED                                     │
│  - Pending mostrado en home del seller               │
│  - Aparece en app/web de Mercado Pago                │
│  - created_at: timestamp de creación                 │
└────────────────────┬─────────────────────────────────┘
                     │
                     │ Seller interactúa
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│  Estado: DELETED                                     │
│  - Pending cerrado/resuelto                          │
│  - deleted_at: timestamp de cierre                   │
│                                                       │
│  Substatuses posibles:                               │
│  ┌────────────────────────────────────────────────┐  │
│  │ • success: Acción completada (pagó el DAS)     │  │
│  │ • success_web: Completada desde web            │  │
│  │ • dismiss: Descartada sin acción               │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Lógica de Negocio

**Hipótesis**:
- Sellers que ven pending en su home son más propensos a pagar
- Pendings reducen morosidad fiscal
- Criticidad alta aumenta tasa de conversión

**Métricas que Medimos**:
1. % de sellers con pending que pagan
2. Tiempo promedio entre pending y pago
3. Efectividad por nivel de criticidad
4. ROI del sistema de pendings

---

## 🎯 Problema que Resuelve el Dashboard

### Antes del Dashboard

**Problemas**:
- ❌ No había visibilidad sobre emisiones vs pagos reales
- ❌ No se sabía si los pendings funcionaban
- ❌ Análisis manual en SQL toma horas
- ❌ Datos dispersos en múltiples tablas
- ❌ Imposible identificar tendencias rápidamente

### Con el Dashboard

**Beneficios**:
- ✅ Visibilidad en tiempo real de métricas fiscales
- ✅ Análisis de efectividad del sistema de pendings
- ✅ Identificación de sellers en riesgo
- ✅ Tendencias mensuales automáticas
- ✅ Funnel de conversión visual
- ✅ Datos listos para reportes ejecutivos

### Casos de Uso Principales

#### 1. **Product Manager de Pendings**
**Pregunta**: "¿Los pendings realmente ayudan a que sellers paguen?"

**Dashboard responde**:
- Tab "Uso de Pendings" muestra funnel de conversión
- 66.31% de pagos vienen después de mostrar pending
- 12,027 pagos atribuibles a pendings
- ROI calculable: pendings funcionan

#### 2. **Tax Analyst**
**Pregunta**: "¿Cuántos sellers emitieron DAS pero no pagaron?"

**Dashboard responde**:
- Tab "General" muestra emisiones vs pagos
- Tasa de conversión por mes
- Gap de sellers que no pagaron

#### 3. **Leadership**
**Pregunta**: "¿Cómo va el compliance fiscal este mes?"

**Dashboard responde**:
- Tab "Mensual" con comparación vs mes anterior
- Métricas resumidas en tarjetas
- Insights automáticos (↑ mejora, ↓ deterioro)

---

## 📚 Glosario de Términos

### Términos Fiscales

| Término | Definición | Ejemplo |
|---------|------------|---------|
| **DAS** | Documento de Arrecadação do Simples Nacional | Boleto de pago de impuestos |
| **SERPRO** | Serviço Federal de Processamento de Dados | Sistema que calcula DAS |
| **Simples Nacional** | Régimen tributario simplificado para PYMEs | Empresa con facturación <R$ 4.8M/año |
| **Emission** | Generación del documento fiscal DAS | SERPRO emite DAS por R$ 2,500 |
| **Payment** | Pago efectivo del DAS | Seller paga R$ 2,500 |
| **Tax Period** | Período fiscal (mes-año) | 01-2026 (enero 2026) |

### Términos del Dashboard

| Término | Definición | Dónde se usa |
|---------|------------|--------------|
| **Pendings** | Puntos de awareness en la home del seller | Tab "Uso de Pendings" |
| **Conversion Rate** | % emisiones que resultan en pago | Tab General, Mensual |
| **Funnel** | Visualización de conversión por etapas | Tab Pendings |
| **Sellers Únicos** | Cantidad de sellers distintos que pagaron | Todas las tabs |
| **Volumen Pagado** | Suma de montos pagados en BRL | Tab General |

### Términos Técnicos

| Término | Definición | Contexto |
|---------|------------|----------|
| **BigQuery** | Data warehouse de Google Cloud | Fuente de datos |
| **EVENT_TYPE** | Tipo de evento fiscal | SERPRO-Emission, Payment |
| **content_id** | Identificador de tipo de notificación | Filtro en DIM_PENDINGS |
| **Substatus** | Detalle de cómo se cerró notificación | success, dismiss |
| **CUS_CUST_ID** | ID único del seller | Clave para joins |

---

## ⚠️ Concepto Técnico Crítico: EVENT_DATE vs MONTH/YEAR

### Dos Tipos de Fechas en BT_MP_DAS_TAX_EVENTS

La tabla `BT_MP_DAS_TAX_EVENTS` contiene **dos conceptos de fecha diferentes**:

#### 1. **EVENT_DATE** (DATE)
- **Qué es**: Cuándo **ocurrió realmente** el evento (pago o emisión)
- **Tipo**: Fecha exacta (DATE)
- **Ejemplo**: `EVENT_DATE = '2026-02-18'` → El pago se ejecutó el 18 de febrero

#### 2. **MONTH / YEAR** (STRING)
- **Qué es**: Período fiscal al que **corresponde** el pago o emisión
- **Tipo**: Strings separados (mes y año)
- **Ejemplo**: `MONTH = '01', YEAR = '2026'` → Es el DAS del período fiscal enero 2026

### Ejemplo Real Ilustrativo

```sql
-- Un seller paga el DAS de Enero 2026 el día 18 de Febrero
EVENT_TYPE = 'Payment'
EVENT_DATE = '2026-02-18'    ← CUÁNDO ejecutó el pago (18 de febrero)
MONTH = '01'                  ← MES FISCAL que está pagando (enero)
YEAR = '2026'                 ← AÑO FISCAL
TAX_PERIOD = '2026-01'        ← Período completo (enero 2026)
```

### ¿Por Qué Existe Esta Diferencia?

El DAS se paga **después** del cierre del mes fiscal:

```
┌───────────────────────────────────────────────────┐
│ Enero 2026 (MONTH='01', YEAR='2026')             │
│ ├─ Día 1-31: Seller factura durante todo enero   │
│ └─ Cierre del mes: 31 de enero                   │
└───────────────────────────────────────────────────┘
                         │
                         ▼
┌───────────────────────────────────────────────────┐
│ Febrero 2026                                      │
│ ├─ Día 5: SERPRO emite DAS de enero              │
│ ├─ Día 5-19: Período de pago                     │
│ └─ Día 18: Seller paga (EVENT_DATE='2026-02-18') │
└───────────────────────────────────────────────────┘
```

### Implicación Práctica

**Un pago del período fiscal "Enero 2026" (`MONTH='01'`) puede tener `EVENT_DATE` en febrero** porque:
- El mes fiscal cierra el 31 de enero
- El pago vence el 20 de febrero
- El seller paga entre el 1-20 de febrero

### Uso Correcto en Queries

```sql
-- ❌ INCORRECTO: Filtrar por EVENT_DATE para análisis de período fiscal
SELECT *
FROM BT_MP_DAS_TAX_EVENTS
WHERE EVENT_DATE >= '2026-01-01'
  AND EVENT_DATE < '2026-02-01'
-- Esto NO captura los pagos del DAS de enero (que ocurren en febrero)

-- ✅ CORRECTO: Filtrar por MONTH/YEAR para análisis de período fiscal
SELECT *
FROM BT_MP_DAS_TAX_EVENTS
WHERE MONTH = '01'
  AND YEAR = '2026'
-- Esto SÍ captura todos los pagos del DAS de enero, sin importar cuándo se pagaron
```

---

## 🔍 Interpretación de Datos

### Escenarios Comunes

#### ✅ **Escenario Ideal**
```
Emisiones: 10,000
Pagos: 9,500
Tasa Conversión: 95%
```
**Interpretación**: Casi todos los sellers están cumpliendo obligaciones fiscales.

#### ⚠️ **Escenario de Alerta**
```
Emisiones: 10,000
Pagos: 5,000
Tasa Conversión: 50%
```
**Interpretación**: Alta morosidad fiscal, requiere intervención.

#### 🔔 **Evaluación de Pendings**
```
Pendings Creados: 20,000
Pagos Totales Tax: 10,000
Pagos después de Pending: 6,000
Tasa Conversión: 60%
```
**Interpretación**: 60% de los que pagan lo hacen después de ver pending en su home. Sistema efectivo.

### Banderas Rojas

| Indicador | Umbral de Alerta | Acción Recomendada |
|-----------|------------------|---------------------|
| Tasa Conversión | < 70% | Investigar causas de morosidad |
| Pendings → Pago | < 50% | Revisar efectividad de mensajes |
| Volumen Pagado MoM | ↓ >20% | Análisis profundo de sellers |
| Sellers Únicos | ↓ >10% | Alerta de churn/cierre de negocio |

---

## 📅 Calendario Fiscal

### Ciclo Mensual Típico

| Fecha | Evento | Descripción |
|-------|--------|-------------|
| **Día 1-31** | Facturación | Seller vende durante el mes |
| **Día 1-5 (mes siguiente)** | Emisión SERPRO | SERPRO calcula y emite DAS |
| **Día 5-10** | Pending | Sistema muestra pending en home del seller |
| **Día 20** | Vencimiento | Fecha límite de pago |
| **Día 21+** | Morosidad | Multa + Intereses |

### Ejemplo: Enero 2026

```
Enero 1-31:   Seller factura R$ 100,000
Febrero 5:    SERPRO emite DAS por R$ 5,000
Febrero 5:    Seller ve pending en su home (awareness del pago)
Febrero 20:   Fecha límite de pago
Febrero 18:   Seller paga R$ 5,000 ✅
```

---

## 💡 Insights de Negocio

### Aprendizajes del Sistema Actual

1. **Pendings SÍ funcionan**
   - 66% de conversión desde pendings
   - Mucho mejor que sin pending

2. **Diciembre 2025 = Punto de Inflexión**
   - Sistema de pendings lanzado
   - Mejora significativa en compliance

3. **Sellers Recurrentes vs Nuevos**
   - Sellers recurrentes tienen mayor tasa de pago
   - Nuevos requieren más educación

4. **Criticidad Importa**
   - Pendings de alta criticidad tienen mejor conversión
   - Timing es crítico (mostrar 5-7 días antes del vencimiento)

### Oportunidades de Mejora

1. **Personalización**
   - Mensajes diferentes según historial del seller
   - A/B testing de copys

2. **Automatización de Pagos**
   - Débito automático para sellers recurrentes
   - Reduce fricción

3. **Educación Proactiva**
   - Tutoriales para sellers nuevos
   - Calculadora de DAS en la app

4. **Alertas Tempranas**
   - Notificar antes de la emisión
   - "Tu DAS estimado será R$ X"

---

## 📖 Referencias

### Documentación Oficial Brasil
- [Portal Simples Nacional](http://www8.receita.fazenda.gov.br/SimplesNacional/)
- [Tabela de Alíquotas](http://www8.receita.fazenda.gov.br/SimplesNacional/Documentos/Pagina.aspx?id=3)

### Documentación Interna
- [DICCIONARIO_TABLAS.md](DICCIONARIO_TABLAS.md) - Estructura de datos
- [QUERIES_DASHBOARD.md](QUERIES_DASHBOARD.md) - Queries SQL
- [KPIS_PRINCIPALES.md](KPIS_PRINCIPALES.md) - Definición de métricas

---

**Última actualización**: 2026-02-11
**Versión**: 1.0
**Owner**: william.oviedoaliste@mercadolibre.cl
