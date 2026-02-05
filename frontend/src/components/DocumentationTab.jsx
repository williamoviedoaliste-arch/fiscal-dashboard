import React from 'react';

const DocumentationTab = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Introducción */}
      <div className="chart-container">
        <h1>📖 Documentación del Dashboard</h1>
        <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#666' }}>
          Guía completa para entender y aprovechar al máximo el Dashboard de Métricas Fiscales.
          Este dashboard analiza emisiones y pagos de impuestos, proporcionando insights para
          tomar decisiones de producto y negocio.
        </p>
      </div>

      {/* Conceptos Clave */}
      <div className="chart-container">
        <h2>🔑 Conceptos Clave</h2>

        <div style={{ marginTop: '20px' }}>
          <h3 style={{ color: '#3B82F6' }}>📅 EVENT_DATE vs YEAR/MONTH</h3>
          <div style={{ padding: '15px', backgroundColor: '#F3F4F6', borderRadius: '8px', marginTop: '10px' }}>
            <p><strong>EVENT_DATE:</strong> Fecha en que el seller ejecutó la acción (emisión o pago)</p>
            <p style={{ marginTop: '8px' }}><strong>YEAR/MONTH:</strong> Período fiscal al que corresponde la acción</p>
            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff', borderLeft: '4px solid #3B82F6' }}>
              <strong>Ejemplo:</strong><br />
              Un seller emite el <strong>15 de enero de 2026</strong> (EVENT_DATE) su factura del <strong>período fiscal diciembre 2025</strong> (YEAR/MONTH).
              <br />Esto es común: los impuestos del mes anterior se pagan/emiten al mes siguiente.
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3 style={{ color: '#10B981' }}>✅ Pagos Correctos</h3>
          <div style={{ padding: '15px', backgroundColor: '#F3F4F6', borderRadius: '8px', marginTop: '10px' }}>
            <p>Un <strong>pago correcto</strong> es aquel donde el período fiscal (YEAR/MONTH) corresponde al mes inmediatamente anterior a la fecha del pago (EVENT_DATE).</p>
            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff', borderLeft: '4px solid #10B981' }}>
              <strong>Ejemplo:</strong><br />
              ✅ <strong>Pago correcto:</strong> Pagado en enero 2026 → Período fiscal diciembre 2025<br />
              ❌ <strong>Pago atrasado:</strong> Pagado en enero 2026 → Período fiscal octubre 2025 (2 meses de atraso)
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3 style={{ color: '#F59E0B' }}>🔄 Sellers Nuevos vs Recurrentes</h3>
          <div style={{ padding: '15px', backgroundColor: '#F3F4F6', borderRadius: '8px', marginTop: '10px' }}>
            <p><strong>Seller Nuevo:</strong> Primera vez que ejecuta una acción (emisión o pago)</p>
            <p style={{ marginTop: '8px' }}><strong>Seller Recurrente:</strong> Ya había ejecutado esa acción en meses anteriores</p>
            <p style={{ marginTop: '8px', fontStyle: 'italic', color: '#666' }}>
              Nota: Un seller puede ser "nuevo en emisiones" pero "recurrente en pagos" si pagó antes de emitir por primera vez.
            </p>
          </div>
        </div>
      </div>

      {/* Pestaña General */}
      <div className="chart-container">
        <h2>📊 Pestaña General</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>Vista ejecutiva con métricas agregadas de todo el período.</p>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '200px' }}>Sección</th>
                <th>Qué Muestra</th>
                <th style={{ width: '200px' }}>Uso Principal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>📈 Resumen Ejecutivo</strong></td>
                <td>Total de emisiones, pagos y volumen monetario del período completo</td>
                <td>KPIs principales</td>
              </tr>
              <tr>
                <td><strong>📊 Emisiones</strong></td>
                <td>Evolución mensual de emisiones exitosas y sellers únicos que emiten</td>
                <td>Medir adopción del producto</td>
              </tr>
              <tr>
                <td><strong>💳 Pagos</strong></td>
                <td>Total de pagos, pagos correctos (puntuales), y sellers únicos que pagan</td>
                <td>Medir conversión y puntualidad</td>
              </tr>
              <tr>
                <td><strong>👥 Sellers</strong></td>
                <td>Comparación de sellers nuevos vs recurrentes en emisiones y pagos</td>
                <td>Medir adquisición y retención</td>
              </tr>
              <tr>
                <td><strong>🎯 Conversión</strong></td>
                <td>% de emisiones que se convierten en pagos (eventos y sellers)</td>
                <td>Identificar problemas de conversión</td>
              </tr>
              <tr>
                <td><strong>💰 Volumen</strong></td>
                <td>Suma monetaria total de pagos procesados por mes</td>
                <td>Medir revenue generado</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#EFF6FF', borderRadius: '8px', borderLeft: '4px solid #3B82F6' }}>
          <strong>💡 Cómo usar esta pestaña:</strong>
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li>Identifica el mes con mayor actividad (emisiones y pagos)</li>
            <li>Compara el crecimiento de sellers nuevos vs recurrentes</li>
            <li>Revisa si la tasa de conversión está mejorando o empeorando</li>
            <li>Analiza qué % de pagos son "correctos" (puntuales)</li>
          </ul>
        </div>
      </div>

      {/* Pestaña Mensual */}
      <div className="chart-container">
        <h2>📅 Pestaña Mensual</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>Análisis detallado mes a mes con comparación vs período anterior.</p>

        <h3 style={{ color: '#3B82F6', marginTop: '20px' }}>Filtros Disponibles</h3>
        <div className="table-container" style={{ marginTop: '15px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Filtro</th>
                <th>Descripción</th>
                <th>Cuándo Usar</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>📅 Fecha de Evento</strong></td>
                <td>Filtra por el mes en que ocurrió la acción (cuando el seller la ejecutó)</td>
                <td>Para entender <strong>actividad del mes</strong></td>
              </tr>
              <tr>
                <td><strong>📋 Período Fiscal</strong></td>
                <td>Filtra por el mes de impuesto al que corresponde (sin importar cuándo se ejecutó)</td>
                <td>Para entender <strong>qué períodos se están pagando</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 style={{ color: '#3B82F6', marginTop: '30px' }}>Métricas Mostradas</h3>
        <div style={{ marginTop: '15px' }}>
          <div style={{ padding: '15px', backgroundColor: '#F3F4F6', borderRadius: '8px', marginBottom: '15px' }}>
            <h4 style={{ margin: 0, color: '#10B981' }}>✅ Tarjetas Principales</h4>
            <p style={{ marginTop: '10px' }}>Emisiones, Pagos, Volumen y Conversión del mes seleccionado con <strong>variaciones vs mes anterior</strong>.</p>
            <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
              <li>🟢 Flecha verde ↑ = Crecimiento</li>
              <li>🔴 Flecha roja ↓ = Decrecimiento</li>
            </ul>
          </div>

          <div style={{ padding: '15px', backgroundColor: '#F3F4F6', borderRadius: '8px', marginBottom: '15px' }}>
            <h4 style={{ margin: 0, color: '#10B981' }}>📊 Tabla Comparativa</h4>
            <p style={{ marginTop: '10px' }}>Comparación lado a lado de todas las métricas clave vs el mes anterior.</p>
          </div>

          <div style={{ padding: '15px', backgroundColor: '#F3F4F6', borderRadius: '8px', marginBottom: '15px' }}>
            <h4 style={{ margin: 0, color: '#10B981' }}>📈 Estados de Emisión</h4>
            <p style={{ marginTop: '10px' }}>Desglose de emisiones por estado:</p>
            <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
              <li><strong>Exitosas:</strong> Emisiones procesadas correctamente</li>
              <li><strong>Errores:</strong> Emisiones fallidas (problema técnico o validación)</li>
              <li><strong>Ya Pagadas:</strong> Intentos de pagar un período ya pagado</li>
            </ul>
          </div>

          <div style={{ padding: '15px', backgroundColor: '#F3F4F6', borderRadius: '8px', marginBottom: '15px' }}>
            <h4 style={{ margin: 0, color: '#10B981' }}>📅 Top Períodos Fiscales</h4>
            <p style={{ marginTop: '10px' }}>Solo con filtro "Fecha de Evento". Muestra los períodos fiscales más emitidos durante ese mes.</p>
            <p style={{ marginTop: '8px', fontStyle: 'italic', color: '#666' }}>
              Ejemplo: En enero 2026, el 70% de emisiones pueden ser del período fiscal diciembre 2025.
            </p>
          </div>

          <div style={{ padding: '15px', backgroundColor: '#FEF3C7', borderRadius: '8px', borderLeft: '4px solid #F59E0B' }}>
            <h4 style={{ margin: 0, color: '#92400E' }}>💡 Insights Generales</h4>
            <p style={{ marginTop: '10px', color: '#92400E' }}>
              <strong>Análisis automático</strong> que interpreta las variaciones y genera recomendaciones:
            </p>
            <ul style={{ marginTop: '10px', paddingLeft: '20px', color: '#92400E' }}>
              <li>🔥 Crecimiento explosivo (>50%)</li>
              <li>✅ Crecimiento fuerte (20-50%)</li>
              <li>📊 Crecimiento moderado (0-20%)</li>
              <li>⚠️ Caídas que requieren atención</li>
            </ul>
          </div>
        </div>

        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#EFF6FF', borderRadius: '8px', borderLeft: '4px solid #3B82F6' }}>
          <strong>💡 Cómo usar esta pestaña:</strong>
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li>Selecciona un mes para análisis profundo</li>
            <li>Alterna entre "Fecha de Evento" y "Período Fiscal" para diferentes perspectivas</li>
            <li>Revisa las variaciones vs mes anterior para identificar tendencias</li>
            <li>Lee la tabla de Insights Generales para recomendaciones automáticas</li>
            <li>Analiza los Top Períodos Fiscales para entender comportamiento de pago</li>
          </ul>
        </div>
      </div>

      {/* Casos de Uso */}
      <div className="chart-container">
        <h2>💼 Casos de Uso</h2>

        <div style={{ marginTop: '20px' }}>
          <h3 style={{ color: '#10B981' }}>Caso 1: Detectar Problema de Conversión</h3>
          <div style={{ padding: '15px', backgroundColor: '#F3F4F6', borderRadius: '8px', marginTop: '10px' }}>
            <p><strong>Síntomas:</strong></p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>Pestaña General → Tasa de conversión de sellers = 30% (baja)</li>
              <li>Pestaña Mensual → Enero 2026 tiene 25% (peor que promedio)</li>
            </ul>
            <p style={{ marginTop: '15px' }}><strong>Acción:</strong></p>
            <ol style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>Revisar "Estados de Emisión" en Mensual</li>
              <li>Si % de errores es alto → Problema técnico</li>
              <li>Si conversión baja pero emisiones altas → Problema de UX o morosidad</li>
              <li>Comparar "Pagos Correctos" vs "Total Pagos" → ¿Están pagando tarde?</li>
            </ol>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3 style={{ color: '#10B981' }}>Caso 2: Identificar Estacionalidad</h3>
          <div style={{ padding: '15px', backgroundColor: '#F3F4F6', borderRadius: '8px', marginTop: '10px' }}>
            <p><strong>Síntomas:</strong></p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>Pestaña General → Gráfico de emisiones muestra picos en meses específicos</li>
              <li>Pestaña Mensual → Ciertos meses tienen 3x más volumen</li>
            </ul>
            <p style={{ marginTop: '15px' }}><strong>Acción:</strong></p>
            <ol style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>Comparar filtro "Fecha de Evento" vs "Período Fiscal"</li>
              <li>Revisar "Top Períodos Fiscales" para entender timing</li>
              <li>Verificar si picos corresponden a deadlines fiscales</li>
            </ol>
            <p style={{ marginTop: '15px', fontStyle: 'italic', color: '#666' }}>
              <strong>Insight típico:</strong> Los sellers tienden a emitir en masa al inicio de cada mes
              para pagar los impuestos del mes anterior.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3 style={{ color: '#10B981' }}>Caso 3: Análisis de Crecimiento</h3>
          <div style={{ padding: '15px', backgroundColor: '#F3F4F6', borderRadius: '8px', marginTop: '10px' }}>
            <p><strong>Objetivo:</strong> Entender si el producto está creciendo saludablemente</p>
            <p style={{ marginTop: '15px' }}><strong>Flujo de análisis:</strong></p>
            <ol style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>General → Revisar evolución de emisiones y pagos (¿tendencia ascendente?)</li>
              <li>General → Sellers nuevos vs recurrentes (¿adquisición + retención?)</li>
              <li>Mensual → Seleccionar último mes y revisar variaciones</li>
              <li>Mensual → Leer tabla de Insights Generales para conclusiones</li>
            </ol>
            <p style={{ marginTop: '15px', fontStyle: 'italic', color: '#666' }}>
              <strong>Crecimiento saludable:</strong> Emisiones ↑, Pagos ↑, Sellers nuevos ↑, Conversión estable o ↑
            </p>
          </div>
        </div>
      </div>

      {/* Glosario */}
      <div className="chart-container">
        <h2>📚 Glosario</h2>
        <div className="table-container" style={{ marginTop: '20px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '200px' }}>Término</th>
                <th>Definición</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Emisión</strong></td>
                <td>Acción de emitir una factura fiscal (SERPRO-Emission). Puede ser exitosa, error, o ya pagada.</td>
              </tr>
              <tr>
                <td><strong>Pago</strong></td>
                <td>Acción de pagar los impuestos correspondientes a un período fiscal.</td>
              </tr>
              <tr>
                <td><strong>Pago Correcto</strong></td>
                <td>Pago donde el período fiscal corresponde al mes inmediatamente anterior a la fecha del pago.</td>
              </tr>
              <tr>
                <td><strong>Seller</strong></td>
                <td>Usuario del sistema identificado por CUS_CUST_ID.</td>
              </tr>
              <tr>
                <td><strong>Conversión de Eventos</strong></td>
                <td>(Total Pagos / Total Emisiones) × 100. Mide qué % de emisiones resulta en pago.</td>
              </tr>
              <tr>
                <td><strong>Conversión de Sellers</strong></td>
                <td>(Sellers que Pagan / Sellers que Emiten) × 100. Mide qué % de sellers completa el pago.</td>
              </tr>
              <tr>
                <td><strong>Volumen</strong></td>
                <td>Suma monetaria total de pagos procesados (en BRL).</td>
              </tr>
              <tr>
                <td><strong>Ticket Promedio</strong></td>
                <td>Volumen Total / Cantidad de Pagos. Monto promedio por pago.</td>
              </tr>
              <tr>
                <td><strong>MoM (Month over Month)</strong></td>
                <td>Variación porcentual vs el mes anterior.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tips Finales */}
      <div className="chart-container" style={{ backgroundColor: '#F0FDF4', borderLeft: '4px solid #10B981' }}>
        <h2>✨ Tips para Aprovechar al Máximo el Dashboard</h2>
        <ul style={{ fontSize: '16px', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li><strong>Usa los tooltips (?):</strong> Cada gráfico tiene un ícono "?" con información adicional</li>
          <li><strong>Compara períodos:</strong> Usa la Pestaña Mensual para comparar mes a mes</li>
          <li><strong>Alterna filtros:</strong> Cambia entre "Fecha de Evento" y "Período Fiscal" para diferentes perspectivas</li>
          <li><strong>Lee los insights:</strong> La tabla de Insights Generales te da recomendaciones automáticas</li>
          <li><strong>Identifica patrones:</strong> Busca correlaciones entre emisiones, pagos y conversión</li>
          <li><strong>Monitorea pagos correctos:</strong> Un bajo % indica morosidad o problemas de timing</li>
        </ul>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '40px', padding: '20px', textAlign: 'center', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
        <p style={{ color: '#666', margin: 0 }}>
          <strong>Dashboard de Métricas Fiscales</strong> | Versión 2.0 | Última actualización: Febrero 2026
        </p>
        <p style={{ color: '#999', marginTop: '10px', fontSize: '14px' }}>
          Para soporte técnico o preguntas, contacta al equipo de desarrollo.
        </p>
      </div>
    </div>
  );
};

export default DocumentationTab;
