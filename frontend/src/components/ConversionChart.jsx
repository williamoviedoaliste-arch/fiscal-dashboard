import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import InfoTooltip from './InfoTooltip';

const ConversionChart = ({ data }) => {
  const chartData = data.map(item => ({
    periodo: item.periodo,
    convEventos: item.conversion.eventos_pct || 0,
    convSellers: item.conversion.sellers_pct || 0
  }));

  return (
    <div>
      <h2 style={{ display: 'flex', alignItems: 'center' }}>
        Tasa de Conversión de Pagos
        <InfoTooltip text="Mide qué porcentaje de emisiones se convierten en pagos. Conversión de Eventos = (Total Pagos / Total Emisiones) × 100. Conversión de Sellers = (Sellers que Pagan / Sellers que Emiten) × 100. Una tasa baja puede indicar morosidad o problemas de UX." />
      </h2>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 60, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="periodo"
            label={{ value: 'Período', position: 'insideBottom', dy: 10 }}
          />
          <YAxis
            domain={[0, 100]}
            label={{ value: 'Porcentaje (%)', angle: -90, position: 'insideLeft', dx: -25 }}
          />
          <Tooltip
            formatter={(value) => `${value.toFixed(2)}%`}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line
            type="monotone"
            dataKey="convEventos"
            stroke="#EF4444"
            strokeWidth={3}
            name="Conversión Eventos (%)"
            dot={{ fill: '#EF4444', r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="convSellers"
            stroke="#F59E0B"
            strokeWidth={3}
            name="Conversión Sellers (%)"
            dot={{ fill: '#F59E0B', r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ConversionChart;
