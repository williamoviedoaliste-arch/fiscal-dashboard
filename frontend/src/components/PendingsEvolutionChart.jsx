import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function PendingsEvolutionChart({ data }) {
  if (!data || data.length === 0) {
    return <div>No hay datos disponibles</div>;
  }

  // Transformar datos para el gráfico
  const chartData = data.map(item => {
    const result = { periodo: item.periodo };

    // Agregar datos por criticidad
    Object.entries(item.por_criticidad).forEach(([criticidad, valores]) => {
      result[`enviadas_${criticidad}`] = valores.notificaciones_enviadas;
      result[`pagadas_${criticidad}`] = valores.pagos_desde_notificacion;
    });

    // Agregar totales
    result.total_enviadas = item.totales.notificaciones_enviadas;
    result.total_pagadas = item.totales.pagos_desde_notificacion;

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
        Evolución Mensual de Notificaciones por Criticidad
      </h3>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 20, right: 60, left: 60, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="periodo"
            label={{ value: 'Período', position: 'insideBottom', dy: 10 }}
          />
          <YAxis
            label={{ value: 'Cantidad de Notificaciones', angle: -90, position: 'insideLeft', dx: -25 }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />

          {/* Líneas por criticidad - Enviadas */}
          {criticidades.map(crit => (
            <Line
              key={`enviadas_${crit}`}
              type="monotone"
              dataKey={`enviadas_${crit}`}
              name={`Enviadas ${crit}`}
              stroke={coloresCriticidad[crit] || '#6b7280'}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}

          {/* Líneas por criticidad - Pagadas */}
          {criticidades.map(crit => (
            <Line
              key={`pagadas_${crit}`}
              type="monotone"
              dataKey={`pagadas_${crit}`}
              name={`Pagadas ${crit}`}
              stroke={coloresCriticidad[crit] || '#6b7280'}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div style={{
        marginTop: '10px',
        padding: '10px',
        background: '#f3f4f6',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <strong>Nota:</strong> Líneas sólidas = Notificaciones enviadas | Líneas punteadas = Pagos desde notificación
      </div>
    </div>
  );
}

export default PendingsEvolutionChart;
