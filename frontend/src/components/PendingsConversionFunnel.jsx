import React, { useState } from 'react';

function PendingsConversionFunnel({ data, monthlyData }) {
  const [selectedPeriod, setSelectedPeriod] = useState('total');

  if (!data) {
    return <div>Cargando funnel...</div>;
  }

  const formatNumber = (num) => new Intl.NumberFormat('es-ES').format(num);

  // Normalizar los valores según el período seleccionado
  const isTotal = selectedPeriod === 'total';
  let enviadas, pagosReales, pagosFromValue, tasaFromValue;

  if (isTotal) {
    enviadas       = data.total_enviadas;
    pagosReales    = data.total_pagos_reales;
    pagosFromValue = data.total_pagos_from_value || 0;
    tasaFromValue  = data.tasa_from_value || 0;
  } else {
    const row = (monthlyData || []).find(m => m.periodo === selectedPeriod);
    enviadas       = row?.notificaciones_enviadas || 0;
    pagosReales    = row?.pagos_reales || 0;
    pagosFromValue = row?.pagos_from_value || 0;
    tasaFromValue  = row?.tasa_from_value || 0;
  }

  const conversionTotal = enviadas > 0 ? ((pagosReales / enviadas) * 100).toFixed(2) : 0;
  const pctFromValue = pagosReales > 0 ? ((pagosFromValue / pagosReales) * 100).toFixed(1) : tasaFromValue;

  // Vista mensual: el funnel arranca desde Pagos Totales Tax (base 100%)
  // Las notificaciones creadas no se pueden correlacionar por mes con los pagos
  // porque el gap creación→pago cruza meses. Solo se muestra en total acumulado.
  const stages = isTotal
    ? [
        {
          label: 'Notificaciones Enviadas',
          value: enviadas,
          percentage: 100,
          color: '#3b82f6',
          width: 100,
          tooltip: 'Total de notificaciones creadas en DIM_PENDINGS (event=created, reason=success)'
        },
        {
          label: 'Pagos Totales Tax',
          value: pagosReales,
          percentage: conversionTotal,
          color: '#8b5cf6',
          width: 68,
          tooltip: `Pagos fiscales DAS registrados en BT_MP_DAS_TAX_EVENTS: ${formatNumber(pagosReales)} pagos`
        },
        {
          label: 'Pagos originados desde Pending (FROM_VALUE)',
          value: pagosFromValue,
          percentage: pctFromValue,
          color: '#0ea5e9',
          width: 40,
          tooltip: `Pagos en BT_MP_DAS_TAX_EVENTS con FROM_VALUE='pending': ${pctFromValue}% del total de pagos fiscales.`
        }
      ]
    : [
        {
          label: 'Pagos Totales Tax',
          value: pagosReales,
          percentage: 100,
          color: '#8b5cf6',
          width: 100,
          tooltip: `Pagos fiscales DAS registrados en BT_MP_DAS_TAX_EVENTS en ${selectedPeriod}: ${formatNumber(pagosReales)} pagos`
        },
        {
          label: 'Pagos originados desde Pending (FROM_VALUE)',
          value: pagosFromValue,
          percentage: pctFromValue,
          color: '#0ea5e9',
          width: 55,
          tooltip: `Pagos con FROM_VALUE='pending' en ${selectedPeriod}: ${pctFromValue}% del total de pagos fiscales del mes.`
        }
      ];

  return (
    <div style={{
      background: 'white',
      padding: '30px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#111827', fontSize: '20px' }}>
            Funnel de Conversión
          </h3>
          <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
            {isTotal
              ? 'Recorrido desde notificación enviada hasta contribución a pagos fiscales'
              : `Pagos fiscales y origen desde pendings — ${selectedPeriod}`}
          </p>
        </div>
        <div>
          <label style={{ marginRight: '8px', fontWeight: '500', fontSize: '14px', color: '#374151' }}>
            Período:
          </label>
          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
          >
            <option value="total">Total acumulado</option>
            {(monthlyData || []).slice().reverse().map(m => (
              <option key={m.periodo} value={m.periodo}>{m.periodo}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        padding: '20px 0'
      }}>
        {stages.map((stage, idx) => (
          <div key={idx} style={{ width: '100%', textAlign: 'center' }}>
            {/* Barra del funnel */}
            <div
              style={{
                width: `${stage.width}%`,
                margin: '0 auto',
                background: stage.color,
                borderRadius: '8px',
                padding: '20px',
                color: 'white',
                cursor: 'help',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
              title={stage.tooltip}
            >
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '4px'
              }}>
                {stage.label}
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '4px'
              }}>
                {formatNumber(stage.value)}
              </div>
              {idx > 0 && (
                <div style={{
                  fontSize: '14px',
                  opacity: 0.9
                }}>
                  {stage.percentage}% de conversión
                </div>
              )}
            </div>

            {/* Flecha entre etapas */}
            {idx < stages.length - 1 && (
              <div style={{
                fontSize: '24px',
                color: '#9ca3af',
                margin: '10px 0'
              }}>
                ↓
              </div>
            )}

            {/* Pérdida entre etapas */}
            {idx < stages.length - 1 && (
              <div style={{
                fontSize: '12px',
                color: '#ef4444',
                marginBottom: '10px'
              }}>
                -{formatNumber(stages[idx].value - stages[idx + 1].value)}
                ({(100 - stages[idx + 1].percentage).toFixed(1)}% pérdida)
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resumen final */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: '#f3f4f6',
        borderRadius: '8px',
        borderLeft: '4px solid #10b981'
      }}>
        <div style={{ fontSize: '14px', color: '#4b5563' }}>
          {isTotal ? (
            <>
              <strong>💡 Insight:</strong> De {formatNumber(enviadas)} notificaciones enviadas,{' '}
              <strong>{formatNumber(pagosReales)}</strong> pagos fiscales ocurrieron en el período ({conversionTotal}% conversión total).
              De esos pagos, <strong>{formatNumber(pagosFromValue)} ({pctFromValue}%)</strong> tienen origen directo
              en el flujo de pendings según <code>FROM_VALUE='pending'</code> en BT_MP_DAS_TAX_EVENTS.
            </>
          ) : (
            <>
              <strong>💡 Insight {selectedPeriod}:</strong> Se registraron{' '}
              <strong>{formatNumber(pagosReales)}</strong> pagos fiscales en el mes.
              De ellos, <strong>{formatNumber(pagosFromValue)} ({pctFromValue}%)</strong> vinieron directamente
              del flujo de pendings (<code>FROM_VALUE='pending'</code>).
              {' '}La cantidad de notificaciones creadas no se muestra por mes porque el gap creación→pago cruza períodos.
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PendingsConversionFunnel;
