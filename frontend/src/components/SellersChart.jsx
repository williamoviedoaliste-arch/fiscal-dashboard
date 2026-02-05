import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import InfoTooltip from './InfoTooltip';

const SellersChart = ({ data, type = 'emisiones' }) => {
  // type puede ser 'emisiones' o 'pagos'
  const chartData = data.map(item => {
    const sourceData = type === 'emisiones' ? item.emisiones : item.pagos;
    return {
      periodo: item.periodo,
      nuevos: sourceData.nuevos,
      recurrentes: sourceData.recurrentes
    };
  });

  const tooltipText = type === 'emisiones'
    ? 'Sellers que emiten por primera vez (nuevos) vs sellers que ya habían emitido antes (recurrentes). Un seller es considerado nuevo en el mes de su primera emisión.'
    : 'Sellers que pagan por primera vez (nuevos) vs sellers que ya habían pagado antes (recurrentes). Un seller es considerado nuevo en el mes de su primer pago.';

  const title = type === 'emisiones'
    ? 'Sellers Emiten: Nuevos vs Recurrentes'
    : 'Sellers Pagan: Nuevos vs Recurrentes';

  return (
    <div>
      <h2 style={{ display: 'flex', alignItems: 'center' }}>
        {title}
        <InfoTooltip text={tooltipText} />
      </h2>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 60, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="periodo"
            label={{ value: 'Período', position: 'insideBottom', dy: 10 }}
          />
          <YAxis
            label={{ value: 'Cantidad de Sellers', angle: -90, position: 'insideLeft', dx: -25 }}
          />
          <Tooltip
            formatter={(value) => value.toLocaleString('es-ES')}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar
            dataKey="nuevos"
            stackId="a"
            fill={type === 'emisiones' ? '#3B82F6' : '#10B981'}
            name="Sellers Nuevos"
          />
          <Bar
            dataKey="recurrentes"
            stackId="a"
            fill={type === 'emisiones' ? '#60A5FA' : '#34D399'}
            name="Sellers Recurrentes"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SellersChart;
