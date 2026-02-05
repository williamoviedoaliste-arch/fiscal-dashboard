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

const PagosCorrectosChart = ({ data }) => {
  const chartData = data.map(item => ({
    periodo: item.periodo,
    pagos_totales: item.pagos.cantidad,
    pagos_correctos: item.pagos.pagos_correctos,
    porcentaje_correctos: item.pagos.cantidad > 0
      ? ((item.pagos.pagos_correctos / item.pagos.cantidad) * 100).toFixed(1)
      : 0
  }));

  return (
    <div>
      <h2 style={{ display: 'flex', alignItems: 'center' }}>
        Pagos Correctos vs Total de Pagos
        <InfoTooltip text="Pagos 'correctos' son aquellos donde el período fiscal (YEAR/MONTH) corresponde al mes inmediatamente anterior a la fecha del pago (EVENT_DATE). Ejemplo: Un pago realizado en enero corresponde al período fiscal de diciembre." />
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="periodo" />
          <YAxis />
          <Tooltip
            formatter={(value, name) => {
              if (name === 'pagos_correctos' || name === 'pagos_totales') {
                return value.toLocaleString('es-ES');
              }
              return value;
            }}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="pagos_totales"
            stroke="#10B981"
            strokeWidth={3}
            name="Total Pagos"
            dot={{ fill: '#10B981', r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="pagos_correctos"
            stroke="#059669"
            strokeWidth={3}
            name="Pagos Correctos"
            dot={{ fill: '#059669', r: 5 }}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="insight">
        <strong>Insight:</strong> Los pagos correctos representan aquellos que se realizan en el mes siguiente al período fiscal.
        Esto ayuda a identificar patrones de pago puntuales vs pagos atrasados.
      </div>
    </div>
  );
};

export default PagosCorrectosChart;
