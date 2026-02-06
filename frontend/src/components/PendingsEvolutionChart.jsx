import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function PendingsEvolutionChart({ data }) {
  if (!data || data.length === 0) {
    return <div>No hay datos disponibles</div>;
  }

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <h3 style={{ marginBottom: '10px', color: '#374151' }}>
        Evolución Mensual de Notificaciones
      </h3>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 20, right: 60, left: 60, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="periodo"
            label={{ value: 'Período', position: 'insideBottom', dy: 10 }}
          />
          <YAxis
            label={{ value: 'Cantidad', angle: -90, position: 'insideLeft', dx: -25 }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
            formatter={(value, name) => {
              const labels = {
                'notificaciones_enviadas': 'Notificaciones Enviadas',
                'pagos_desde_notificacion': 'Pagos desde Notificación',
                'descartadas': 'Descartadas',
                'pagos_reales': 'Pagos Reales (Tax)'
              };
              return [new Intl.NumberFormat('es-ES').format(value), labels[name] || name];
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />

          <Line
            type="monotone"
            dataKey="notificaciones_enviadas"
            name="Notificaciones Enviadas"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
          />

          <Line
            type="monotone"
            dataKey="pagos_desde_notificacion"
            name="Pagos desde Notificación"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
          />

          <Line
            type="monotone"
            dataKey="descartadas"
            name="Descartadas"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 4 }}
          />

          <Line
            type="monotone"
            dataKey="pagos_reales"
            name="Pagos Reales (Tax)"
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4 }}
          />
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
        <strong>Nota:</strong> Línea punteada (Pagos Reales) representa todos los pagos fiscales registrados en BT_MP_DAS_TAX_EVENTS. La diferencia con "Pagos desde Notificación" muestra cuántos pagos se realizaron sin usar las notificaciones.
      </div>
    </div>
  );
}

export default PendingsEvolutionChart;
