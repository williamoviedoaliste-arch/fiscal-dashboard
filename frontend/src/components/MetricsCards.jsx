import React from 'react';

const MetricCard = ({ icon, label, value, change, suffix = '' }) => {
  const changeClass = change > 0 ? 'positive' : change < 0 ? 'negative' : '';
  const changeSymbol = change > 0 ? '▲' : change < 0 ? '▼' : '';

  return (
    <div className="metric-card">
      <div className="icon">{icon}</div>
      <div className="label">{label}</div>
      <div className="value">
        {typeof value === 'number'
          ? value.toLocaleString('es-ES')
          : value}
        {suffix}
      </div>
      {change !== undefined && change !== null && (
        <div className={`change ${changeClass}`}>
          {changeSymbol} {Math.abs(change).toFixed(1)}% MoM
        </div>
      )}
    </div>
  );
};

const MetricsCards = ({ latestMonth, summary }) => {
  return (
    <div className="metrics-cards">
      <MetricCard
        icon="📈"
        label="Emisiones"
        value={summary.total_emisiones}
        change={latestMonth.mom_growth.emisiones_pct}
      />
      <MetricCard
        icon="💳"
        label="Pagos"
        value={summary.total_pagos}
        change={latestMonth.mom_growth.pagos_pct}
      />
      <MetricCard
        icon="👥"
        label="Sellers Activos"
        value={latestMonth.emisiones.sellers_unicos + latestMonth.pagos.sellers_unicos}
      />
      <MetricCard
        icon="💰"
        label="Volumen Total"
        value={`$${(summary.total_volumen / 1000000).toFixed(2)}M`}
        change={latestMonth.mom_growth.volumen_pct}
      />
      <MetricCard
        icon="🎯"
        label="Conv. Eventos"
        value={summary.conversion_promedio}
        suffix="%"
      />
      <MetricCard
        icon="📊"
        label="Conv. Sellers"
        value={latestMonth.conversion.sellers_pct}
        suffix="%"
      />
    </div>
  );
};

export default MetricsCards;
