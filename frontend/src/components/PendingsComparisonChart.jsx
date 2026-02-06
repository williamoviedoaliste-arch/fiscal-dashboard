import React from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function PendingsComparisonChart({ data }) {
  if (!data || data.length === 0) {
    return <div>No hay datos disponibles</div>;
  }

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <h3 style={{ marginBottom: '10px', color: '#374151' }}>
        Comparación: Pagos desde Notificación vs Pagos Reales (Tax)
      </h3>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 20, right: 60, left: 60, bottom: 60 }}>
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
            domain={[0, 100]}
            label={{ value: '% Notif vs Real', angle: 90, position: 'insideRight', dx: 25 }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
            formatter={(value, name) => {
              if (name === 'Porcentaje notif/real') {
                return `${value}%`;
              }
              return new Intl.NumberFormat('es-ES').format(value);
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />

          <Bar
            yAxisId="left"
            dataKey="pagos_desde_notif"
            name="Pagos desde Notificación"
            fill="#10b981"
          />
          <Bar
            yAxisId="left"
            dataKey="pagos_reales_tax"
            name="Pagos Reales (Tax)"
            fill="#3b82f6"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="pct_notif_vs_real"
            name="Porcentaje notif/real"
            stroke="#f59e0b"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div style={{
        marginTop: '10px',
        padding: '10px',
        background: '#f3f4f6',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <strong>Nota:</strong> Este gráfico compara cuántos sellers marcaron "pago desde notificación" vs cuántos realmente
        completaron el pago fiscal en la tabla BT_MP_DAS_TAX_EVENTS. La línea naranja muestra qué porcentaje de los pagos
        reales provienen de notificaciones.
      </div>
    </div>
  );
}

export default PendingsComparisonChart;
