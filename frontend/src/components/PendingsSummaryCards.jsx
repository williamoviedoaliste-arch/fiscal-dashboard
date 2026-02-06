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
      color: '#3b82f6'
    },
    {
      title: 'Pagos desde Notificación',
      value: formatNumber(data.total_pagadas_desde_notif),
      subtitle: 'Conversión directa',
      color: '#10b981'
    },
    {
      title: 'Tasa de Conversión',
      value: `${data.tasa_conversion_global}%`,
      subtitle: `${data.tiempo_promedio_dias} días promedio`,
      color: '#8b5cf6'
    },
    {
      title: 'Descartadas',
      value: formatNumber(data.total_descartadas),
      subtitle: 'Manual o sistema',
      color: '#ef4444'
    },
    {
      title: 'Aún Pendientes',
      value: formatNumber(data.total_pendientes),
      subtitle: 'Sin resolver',
      color: '#f59e0b'
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
        <div key={idx} style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: `4px solid ${card.color}`
        }}>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            {card.title}
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
