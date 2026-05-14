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

const SellersRecurrenceChart = ({ data }) => {
  const chartData = data.map(item => ({
    periodo: item.periodo,
    emiten_totalmente_nuevos: item.emisiones.totalmente_nuevos,
    emiten_sin_recurrencia: item.emisiones.sin_recurrencia,
    emiten_recurrentes: item.emisiones.recurrentes,
    pagan_totalmente_nuevos: item.pagos.totalmente_nuevos,
    pagan_sin_recurrencia: item.pagos.sin_recurrencia,
    pagan_recurrentes: item.pagos.recurrentes,
  }));

  const tooltipText =
    'Clasifica sellers en 3 categorías: Totalmente Nuevo = nunca había emitido/pagado antes; ' +
    'Sin Recurrencia = ya lo había hecho antes pero no el mes anterior; ' +
    'Recurrente = lo hizo el mes anterior Y este mes. Azules = Emisiones, Verdes = Pagos.';

  return (
    <div>
      <h2 style={{ display: 'flex', alignItems: 'center' }}>
        Sellers: Análisis de Recurrencia
        <InfoTooltip text={tooltipText} />
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
          <Bar dataKey="emiten_totalmente_nuevos" stackId="emisiones" fill="#BFDBFE" name="Emiten - Tot. Nuevos" />
          <Bar dataKey="emiten_sin_recurrencia"   stackId="emisiones" fill="#60A5FA" name="Emiten - Sin Recurrencia" />
          <Bar dataKey="emiten_recurrentes"        stackId="emisiones" fill="#1D4ED8" name="Emiten - Recurrentes" />

          {/* Pagos */}
          <Bar dataKey="pagan_totalmente_nuevos"  stackId="pagos" fill="#A7F3D0" name="Pagan - Tot. Nuevos" />
          <Bar dataKey="pagan_sin_recurrencia"    stackId="pagos" fill="#34D399" name="Pagan - Sin Recurrencia" />
          <Bar dataKey="pagan_recurrentes"        stackId="pagos" fill="#065F46" name="Pagan - Recurrentes" />
        </BarChart>
      </ResponsiveContainer>
      <div className="insight">
        <strong>Insight:</strong> Un crecimiento sostenido de <em>Recurrentes</em> indica buena retención mes a mes.
        Alto volumen de <em>Sin Recurrencia</em> puede señalar sellers que pagan de forma irregular o estacional.
      </div>
    </div>
  );
};

export default SellersRecurrenceChart;
