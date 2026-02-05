import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import InfoTooltip from './InfoTooltip';

const VolumenChart = ({ data }) => {
  const chartData = data.map(item => ({
    periodo: item.periodo,
    volumen: item.pagos.volumen_total
  }));

  return (
    <div>
      <h2 style={{ display: 'flex', alignItems: 'center' }}>
        Evolución del Volumen de Pagos
        <InfoTooltip text="Muestra la suma monetaria total (en BRL) de todos los pagos procesados cada mes. Esta métrica indica el valor financiero procesado por el sistema de pagos fiscales." />
      </h2>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 60, bottom: 50 }}
        >
          <defs>
            <linearGradient id="colorVolumen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="periodo"
            label={{ value: 'Período', position: 'insideBottom', dy: 10 }}
          />
          <YAxis
            tickFormatter={(value) =>
              `$${(value / 1000000).toFixed(1)}M`
            }
            label={{ value: 'Volumen (BRL)', angle: -90, position: 'insideLeft', dx: -25 }}
          />
          <Tooltip
            formatter={(value) =>
              `$${value.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`
            }
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          <Area
            type="monotone"
            dataKey="volumen"
            stroke="#8B5CF6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorVolumen)"
            name="Volumen de Pagos"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VolumenChart;
