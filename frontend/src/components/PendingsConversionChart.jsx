import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function PendingsConversionChart({ data }) {
  if (!data || data.length === 0) {
    return <div>No hay datos disponibles</div>;
  }

  // Transformar datos para mostrar tasa de conversión por criticidad
  const chartData = data.map(item => {
    const result = { periodo: item.periodo };

    Object.entries(item.por_criticidad).forEach(([criticidad, valores]) => {
      result[criticidad] = valores.tasa_conversion;
    });

    return result;
  });

  // Obtener todas las criticidades únicas
  const criticidades = [...new Set(
    data.flatMap(item => Object.keys(item.por_criticidad))
  )].sort();

  const coloresCriticidad = {
    'C3': '#10b981',
    'C4': '#3b82f6',
    'sin_criticidad': '#9ca3af'
  };

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <h3 style={{ marginBottom: '10px', color: '#374151' }}>
        Tasa de Conversión por Criticidad
      </h3>
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 20, right: 60, left: 60, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="periodo"
            label={{ value: 'Período', position: 'insideBottom', dy: 10 }}
          />
          <YAxis
            domain={[0, 100]}
            label={{ value: 'Tasa de Conversión (%)', angle: -90, position: 'insideLeft', dx: -25 }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
            formatter={(value) => `${value}%`}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />

          {criticidades.map(crit => (
            <Bar
              key={crit}
              dataKey={crit}
              name={`Criticidad ${crit}`}
              fill={coloresCriticidad[crit] || '#6b7280'}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div style={{
        marginTop: '10px',
        padding: '10px',
        background: '#f3f4f6',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <strong>Nota:</strong> Tasa de conversión = (Pagos desde notificación / Notificaciones enviadas) × 100
      </div>
    </div>
  );
}

export default PendingsConversionChart;
