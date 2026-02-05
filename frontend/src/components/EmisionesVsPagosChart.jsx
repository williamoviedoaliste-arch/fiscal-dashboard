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

const EmisionesVsPagosChart = ({ data, mode = 'all' }) => {
  // mode: 'all', 'emisiones', 'pagos'
  const chartData = data.map(item => ({
    periodo: item.periodo,
    emisiones: item.emisiones.cantidad,
    pagos: item.pagos.cantidad,
    sellersEmiten: item.emisiones.sellers_unicos,
    sellersPagan: item.pagos.sellers_unicos
  }));

  return (
    <ResponsiveContainer width="100%" height={450}>
      <LineChart
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
          label={{ value: 'Cantidad de Eventos', angle: -90, position: 'insideLeft', dx: -25 }}
        />
        {mode === 'all' && (
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: 'Sellers Únicos', angle: 90, position: 'insideRight', dx: 25 }}
          />
        )}
        <Tooltip
          formatter={(value) => value.toLocaleString('es-ES')}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />

        {(mode === 'all' || mode === 'emisiones') && (
          <>
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="emisiones"
              stroke="#3B82F6"
              strokeWidth={3}
              name="Cantidad Emisiones"
              dot={{ fill: '#3B82F6', r: 5 }}
            />
            {mode === 'all' && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="sellersEmiten"
                stroke="#60A5FA"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Sellers Emiten"
                dot={{ fill: '#60A5FA', r: 4 }}
              />
            )}
            {mode === 'emisiones' && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="sellersEmiten"
                stroke="#60A5FA"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Sellers Emiten"
                dot={{ fill: '#60A5FA', r: 4 }}
              />
            )}
          </>
        )}

        {(mode === 'all' || mode === 'pagos') && (
          <>
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="pagos"
              stroke="#10B981"
              strokeWidth={3}
              name="Cantidad Pagos"
              dot={{ fill: '#10B981', r: 5 }}
            />
            {mode === 'all' && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="sellersPagan"
                stroke="#34D399"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Sellers Pagan"
                dot={{ fill: '#34D399', r: 4 }}
              />
            )}
            {mode === 'pagos' && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="sellersPagan"
                stroke="#34D399"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Sellers Pagan"
                dot={{ fill: '#34D399', r: 4 }}
              />
            )}
          </>
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default EmisionesVsPagosChart;
