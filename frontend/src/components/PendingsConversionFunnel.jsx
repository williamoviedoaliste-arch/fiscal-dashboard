import React from 'react';

function PendingsConversionFunnel({ data }) {
  if (!data) {
    return <div>Cargando funnel...</div>;
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const stages = [
    {
      label: 'Notificaciones Enviadas',
      value: data.total_enviadas,
      percentage: 100,
      color: '#3b82f6',
      width: 100,
      tooltip: 'Total de notificaciones de pendings enviadas a sellers'
    },
    {
      label: 'Pagos Totales Tax (12/2025+)',
      value: data.total_pagos_reales,
      percentage: ((data.total_pagos_reales / data.total_enviadas) * 100).toFixed(2),
      color: '#8b5cf6',
      width: 75,
      tooltip: `Total de pagos fiscales DAS del período 12/2025 en adelante: ${formatNumber(data.total_pagos_reales)} pagos`
    },
    {
      label: 'Pagos desde Notificación',
      value: data.total_pagadas_desde_notif,
      percentage: data.tasa_conversion_pagos,
      color: '#10b981',
      width: 50,
      tooltip: `Sellers que pagaron directamente desde la notificación: ${data.tasa_conversion_pagos}% del total de pagos fiscales`
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
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: 0, color: '#111827', fontSize: '20px' }}>
          Funnel de Conversión
        </h3>
        <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
          Recorrido desde notificación enviada hasta contribución a pagos fiscales
        </p>
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
          <strong>💡 Insight:</strong> De {formatNumber(data.total_enviadas)} notificaciones enviadas,
          se generaron {formatNumber(data.total_pagos_reales)} pagos fiscales totales (período 12/2025+).
          De estos pagos, {formatNumber(data.total_pagadas_desde_notif)} ({data.tasa_conversion_pagos}%)
          provienen directamente de sellers que usaron las notificaciones.
        </div>
      </div>
    </div>
  );
}

export default PendingsConversionFunnel;
