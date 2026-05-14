import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import InfoTooltip from './InfoTooltip';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const METRIC_OPTIONS = [
  { key: 'emisiones_acum', label: 'Emisiones' },
  { key: 'pagos_acum', label: 'Pagos' },
  { key: 'sellers_emisiones_acum', label: 'Sellers que emitieron' },
  { key: 'sellers_pagos_acum', label: 'Sellers que pagaron' },
];

// Oldest → newest: grey → amber → green → blue → violet → rose
const MONTH_COLORS = ['#94A3B8', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

const MES_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const formatMesLabel = (mes) => {
  const [year, month] = mes.split('-');
  return `${MES_NAMES[parseInt(month) - 1]} ${year}`;
};

const MonthlyMTDChart = () => {
  const [nMonths, setNMonths] = useState(3);
  const [selectedMetric, setSelectedMetric] = useState('emisiones_acum');
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/api/metrics/mtd?months=${nMonths}`);
        setRawData(res.data);
      } catch (err) {
        console.error('Error fetching MTD data:', err);
        setError('Error al cargar datos MTD. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [nMonths]);

  const chartData = useMemo(() => {
    if (!rawData || !rawData.meses.length) return [];

    const maxDay = Math.max(
      ...rawData.meses.flatMap(mes => (rawData.data[mes] || []).map(d => d.dia)),
      0
    );
    if (maxDay === 0) return [];

    return Array.from({ length: maxDay }, (_, i) => {
      const dia = i + 1;
      const point = { dia };
      for (const mes of rawData.meses) {
        const entry = (rawData.data[mes] || []).find(d => d.dia === dia);
        point[mes] = entry != null ? entry[selectedMetric] : null;
      }
      return point;
    });
  }, [rawData, selectedMetric]);

  const meses = rawData?.meses || [];
  // Current month is the last in the sorted list → gets the highest-index color
  const currentMes = meses[meses.length - 1];

  const tooltipFormatter = (value, name) => [
    value != null ? value.toLocaleString('es-ES') : '-',
    formatMesLabel(name)
  ];

  return (
    <div className="chart-container">
      <h2 style={{ display: 'flex', alignItems: 'center' }}>
        📈 Evolución Month to Date (MTD)
        <InfoTooltip text="Muestra el acumulado diario de cada mes para comparar el ritmo de crecimiento. El mes actual se corta en el día de hoy. Los sellers acumulados cuentan sellers únicos desde el día 1 hasta cada día del mes." />
      </h2>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <label style={{ marginRight: '8px', fontWeight: '500' }}>Meses a comparar:</label>
          <select value={nMonths} onChange={e => setNMonths(Number(e.target.value))}>
            <option value={2}>2 meses</option>
            <option value={3}>3 meses</option>
            <option value={4}>4 meses</option>
            <option value={6}>6 meses</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {METRIC_OPTIONS.map(opt => (
            <label key={opt.key} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="radio"
                value={opt.key}
                checked={selectedMetric === opt.key}
                onChange={e => setSelectedMetric(e.target.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {loading && <div className="loading">Cargando datos MTD...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && rawData && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="dia"
              label={{ value: 'Día del mes', position: 'insideBottom', offset: -15 }}
              tickCount={Math.min(chartData.length, 16)}
            />
            <YAxis
              tickFormatter={val => val.toLocaleString('es-ES')}
              width={70}
            />
            <Tooltip
              formatter={tooltipFormatter}
              labelFormatter={dia => `Día ${dia}`}
            />
            <Legend
              formatter={name => formatMesLabel(name)}
              verticalAlign="top"
              wrapperStyle={{ paddingBottom: '10px' }}
            />
            {meses.map((mes, idx) => (
              <Line
                key={mes}
                type="monotone"
                dataKey={mes}
                stroke={MONTH_COLORS[idx % MONTH_COLORS.length]}
                strokeWidth={mes === currentMes ? 2.5 : 1.5}
                dot={false}
                connectNulls={false}
                strokeDasharray={mes === currentMes ? undefined : undefined}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}

      {!loading && !error && rawData && chartData.length === 0 && (
        <p style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>
          No hay datos disponibles para el período seleccionado.
        </p>
      )}
    </div>
  );
};

export default MonthlyMTDChart;
