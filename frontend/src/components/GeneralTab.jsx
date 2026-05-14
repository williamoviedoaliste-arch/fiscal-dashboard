import React from 'react';
import EmisionesVsPagosChart from './EmisionesVsPagosChart';
import ConversionChart from './ConversionChart';
import VolumenChart from './VolumenChart';
import PagosUnifiedChart from './PagosUnifiedChart';
import SellersUnifiedChart from './SellersUnifiedChart';
import SellersRecurrenceChart from './SellersRecurrenceChart';
import InfoTooltip from './InfoTooltip';

const GeneralTab = ({ monthlyData, sellersData, sellersRecurrenceData }) => {
  const { summary } = monthlyData;
  const latestMonth = monthlyData.data[monthlyData.data.length - 1];

  return (
    <div>
      {/* Resumen General */}
      <div className="stats-grid">
        <div className="stat-box">
          <h3>📈 Total Emisiones</h3>
          <div className="value">{summary.total_emisiones.toLocaleString('es-ES')}</div>
          <div className="sub-value">
            Último mes: {latestMonth.emisiones.cantidad.toLocaleString('es-ES')}
          </div>
        </div>

        <div className="stat-box secondary">
          <h3>💳 Total Pagos</h3>
          <div className="value">{summary.total_pagos.toLocaleString('es-ES')}</div>
          <div className="sub-value">
            Último mes: {latestMonth.pagos.cantidad.toLocaleString('es-ES')}
          </div>
        </div>

        <div className="stat-box success">
          <h3>💰 Volumen Total</h3>
          <div className="value">
            ${(summary.total_volumen / 1000000).toFixed(2)}M
          </div>
          <div className="sub-value">
            Conversión: {summary.conversion_promedio}%
          </div>
        </div>
      </div>

      {/* Sección de Emisiones */}
      <div className="section-title">📊 Métricas de Emisiones</div>
      <div className="chart-container">
        <h2 style={{ display: 'flex', alignItems: 'center' }}>
          Evolución de Emisiones por Mes
          <InfoTooltip text="Muestra la cantidad de emisiones exitosas (línea sólida) y los sellers únicos que emitieron (línea punteada) cada mes. Útil para identificar tendencias de uso y picos de actividad." />
        </h2>
        <EmisionesVsPagosChart data={monthlyData.data} mode="emisiones" />
        <div className="insight">
          <strong>Insight:</strong> Total de emisiones exitosas: {summary.total_emisiones.toLocaleString('es-ES')}.
          El pico fue en {monthlyData.data.reduce((max, item) =>
            item.emisiones.cantidad > max.emisiones.cantidad ? item : max
          ).periodo}.
        </div>
      </div>

      {/* Sección de Pagos - Gráfico Unificado */}
      <div className="section-title">💳 Métricas de Pagos</div>
      <div className="chart-container">
        <PagosUnifiedChart data={monthlyData.data} />
      </div>

      {/* Sección de Sellers - Gráfico Unificado */}
      <div className="section-title">👥 Métricas de Sellers</div>
      <div className="chart-container">
        <SellersUnifiedChart data={sellersData.data} />
      </div>

      {/* Análisis de Recurrencia */}
      {sellersRecurrenceData && (
        <div className="chart-container">
          <SellersRecurrenceChart data={sellersRecurrenceData.data} />
        </div>
      )}

      {/* Conversión */}
      <div className="section-title">🎯 Conversión</div>
      <div className="chart-container">
        <ConversionChart data={monthlyData.data} />
        <div className="insight">
          <strong>Mejor mes:</strong> {summary.mejor_mes.periodo} con {summary.mejor_mes.conversion_sellers}% de conversión de sellers.
        </div>
      </div>

      {/* Volumen Monetario */}
      <div className="section-title">💰 Volumen Monetario</div>
      <div className="chart-container">
        <VolumenChart data={monthlyData.data} />
        <div className="insight">
          <strong>Total Procesado:</strong> ${summary.total_volumen.toLocaleString('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </div>
      </div>
    </div>
  );
};

export default GeneralTab;
