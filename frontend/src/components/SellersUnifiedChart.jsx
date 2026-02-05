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

const SellersUnifiedChart = ({ data }) => {
  const chartData = data.map(item => ({
    periodo: item.periodo,
    emiten_nuevos: item.emisiones.nuevos,
    emiten_recurrentes: item.emisiones.recurrentes,
    pagan_nuevos: item.pagos.nuevos,
    pagan_recurrentes: item.pagos.recurrentes
  }));

  return (
    <div>
      <h2 style={{ display: 'flex', alignItems: 'center' }}>
        Sellers: Nuevos vs Recurrentes (Emisiones y Pagos)
        <InfoTooltip text="Muestra la distribución de sellers nuevos y recurrentes tanto para emisiones como para pagos. Azules = Emisiones, Verdes = Pagos. Los tonos claros son nuevos, los oscuros son recurrentes. Permite comparar patrones de retención en ambas acciones." />
      </h2>
      <ResponsiveContainer width="100%" height={450}>
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

          {/* Emisiones */}
          <Bar
            dataKey="emiten_nuevos"
            stackId="emisiones"
            fill="#60A5FA"
            name="Emiten - Nuevos"
          />
          <Bar
            dataKey="emiten_recurrentes"
            stackId="emisiones"
            fill="#3B82F6"
            name="Emiten - Recurrentes"
          />

          {/* Pagos */}
          <Bar
            dataKey="pagan_nuevos"
            stackId="pagos"
            fill="#34D399"
            name="Pagan - Nuevos"
          />
          <Bar
            dataKey="pagan_recurrentes"
            stackId="pagos"
            fill="#10B981"
            name="Pagan - Recurrentes"
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="insight">
        <strong>Insight:</strong> Compara la adquisición (nuevos) vs retención (recurrentes) en emisiones y pagos.
        Un alto % de recurrentes en pagos indica buena conversión y fidelización.
      </div>
    </div>
  );
};

export default SellersUnifiedChart;
