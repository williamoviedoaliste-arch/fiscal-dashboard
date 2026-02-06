import React from 'react';

function PendingsSummaryCards({ data }) {
  if (!data) {
    return <div>Cargando resumen...</div>;
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const cards = [
    {
      title: 'Notificaciones Enviadas',
      value: formatNumber(data.total_enviadas),
      subtitle: `${formatNumber(data.sellers_unicos)} sellers únicos`,
      color: '#3b82f6',
      tooltip: 'Total de notificaciones de pendings creadas y enviadas a sellers en la tabla DIM_PENDINGS (event=created)'
    },
    {
      title: 'Pagos Totales (Tax)',
      value: formatNumber(data.total_pagos_reales),
      subtitle: `${formatNumber(data.sellers_pagos_reales)} sellers`,
      color: '#8b5cf6',
      tooltip: 'Total de pagos fiscales registrados en la tabla BT_MP_DAS_TAX_EVENTS (todos los pagos DAS)'
    },
    {
      title: 'Pagos desde Notificación',
      value: formatNumber(data.total_pagadas_desde_notif),
      subtitle: 'Conversión directa',
      color: '#10b981',
      tooltip: 'Sellers que marcaron "pagar desde notificación" en DIM_PENDINGS (event=deleted, reason=success)'
    },
    {
      title: 'Descartadas',
      value: formatNumber(data.total_descartadas),
      subtitle: 'Manual o sistema',
      color: '#ef4444',
      tooltip: 'Notificaciones descartadas (event=deleted, reason=dismiss). Puede ser dismiss manual del seller o eliminación automática del sistema'
    },
    {
      title: 'Conversión (Notif)',
      value: `${data.tasa_conversion_notif}%`,
      subtitle: 'Notif → Pago',
      color: '#f59e0b',
      tooltip: 'Porcentaje de notificaciones enviadas que resultaron en pago desde notificación = (Pagos desde Notif / Notif Enviadas) × 100'
    },
    {
      title: 'Conversión (Pagos)',
      value: `${data.tasa_conversion_pagos}%`,
      subtitle: 'Notif → Tax',
      color: '#ec4899',
      tooltip: 'Porcentaje de pagos reales que provienen de notificaciones = (Pagos desde Notif / Pagos Totales Tax) × 100'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    }}>
      {cards.map((card, idx) => (
        <div
          key={idx}
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderLeft: `4px solid ${card.color}`,
            position: 'relative'
          }}
          title={card.tooltip}
        >
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '8px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {card.title}
            <span
              style={{
                display: 'inline-block',
                width: '16px',
                height: '16px',
                background: '#e5e7eb',
                borderRadius: '50%',
                textAlign: 'center',
                lineHeight: '16px',
                fontSize: '12px',
                color: '#6b7280',
                cursor: 'help'
              }}
              title={card.tooltip}
            >
              ?
            </span>
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '4px'
          }}>
            {card.value}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#9ca3af'
          }}>
            {card.subtitle}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PendingsSummaryCards;
