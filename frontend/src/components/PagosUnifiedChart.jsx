import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import InfoTooltip from './InfoTooltip';

const PagosUnifiedChart = ({ data }) => {
  const chartData = data.map(item => ({
    periodo: item.periodo,
    pagos_totales: item.pagos.cantidad,
    pagos_correctos: item.pagos.pagos_correctos,
    sellers_pagan: item.pagos.sellers_unicos,
    porcentaje_correctos: item.pagos.cantidad > 0
      ? ((item.pagos.pagos_correctos / item.pagos.cantidad) * 100)
      : 0
  }));

  return (
    <div>
      <h2 style={{ display: 'flex', alignItems: 'center' }}>
        Evolución de Pagos: Total, Correctos y Sellers
        <InfoTooltip text="Muestra los pagos totales (barras azules), pagos correctos donde el período fiscal es el mes anterior (barras verdes), y cantidad de sellers únicos que pagaron (línea naranja). Los pagos 'correctos' indican puntualidad en el pago de impuestos." />
      </h2>
      <ResponsiveContainer width="100%" height={450}>
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 60, left: 60, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="periodo"
            label={{ value: 'Período', position: 'insideBottom', dy: 10 }}
          />
          <YAxis
            yAxisId="left"
            label={{ value: 'Cantidad de Pagos', angle: -90, position: 'insideLeft', dx: -25 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: 'Sellers Únicos', angle: 90, position: 'insideRight', dx: 25 }}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === 'porcentaje_correctos') {
                return `${value.toFixed(1)}%`;
              }
              return value.toLocaleString('es-ES');
            }}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />

          {/* Barras de Pagos Totales */}
          <Bar
            yAxisId="left"
            dataKey="pagos_totales"
            fill="#3B82F6"
            name="Total Pagos"
            opacity={0.8}
          />

          {/* Barras de Pagos Correctos */}
          <Bar
            yAxisId="left"
            dataKey="pagos_correctos"
            fill="#10B981"
            name="Pagos Correctos"
          />

          {/* Línea de Sellers */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="sellers_pagan"
            stroke="#F59E0B"
            strokeWidth={3}
            name="Sellers Pagan"
            dot={{ fill: '#F59E0B', r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="insight">
        <strong>Insight:</strong> Los pagos correctos (verde) representan aquellos realizados en el mes siguiente al período fiscal.
        Una alta proporción indica buenos hábitos de pago puntual.
      </div>
    </div>
  );
};

export default PagosUnifiedChart;
