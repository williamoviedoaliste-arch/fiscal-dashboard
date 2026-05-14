import React, { useState, useEffect } from 'react';
import InfoTooltip from './InfoTooltip';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const fmt = (n) => (n ?? 0).toLocaleString('es-ES');
const pct = (n) => (n != null ? `${Number(n).toFixed(1)}%` : '-');

function PendingsMonthlyTable() {
  const [filterType, setFilterType] = useState('event');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/pendings/monthly?filter=${filterType}`);
        if (!res.ok) throw new Error('Error al cargar datos mensuales');
        const json = await res.json();
        setData(json.data.slice().reverse()); // más reciente primero
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filterType]);

  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#111827', fontSize: '20px' }}>
            Conversión Mensual de Pendings
          </h3>
          <p style={{ margin: '6px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
            Notificaciones enviadas vs pagos fiscales reales por mes
          </p>
        </div>

        <div className="filter-type-toggle" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontWeight: '500', fontSize: '14px' }}>
            Filtrar pagos por:
            <InfoTooltip text="'Fecha de Evento' agrupa los pagos por el día en que se ejecutaron. 'Período Fiscal' agrupa por el mes de impuesto al que corresponde el pago (campo YEAR/MONTH)." />
          </label>
          <label style={{ cursor: 'pointer' }}>
            <input
              type="radio"
              value="event"
              checked={filterType === 'event'}
              onChange={e => setFilterType(e.target.value)}
            />
            {' '}Fecha de Evento
          </label>
          <label style={{ cursor: 'pointer' }}>
            <input
              type="radio"
              value="fiscal"
              checked={filterType === 'fiscal'}
              onChange={e => setFilterType(e.target.value)}
            />
            {' '}Período Fiscal
          </label>
        </div>
      </div>

      {loading && <div className="loading">Cargando datos...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && data.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Período</th>
                <th style={{ textAlign: 'right' }}>
                  Notif. Enviadas
                  <InfoTooltip text="Notificaciones creadas en DIM_PENDINGS ese mes (event=created, reason=success). Siempre por fecha de creación." />
                </th>
                <th style={{ textAlign: 'right' }}>
                  Sellers Notificados
                </th>
                <th style={{ textAlign: 'right' }}>
                  Pagos Tax
                  <InfoTooltip text="Pagos registrados en BT_MP_DAS_TAX_EVENTS. El agrupamiento depende del filtro seleccionado." />
                </th>
                <th style={{ textAlign: 'right' }}>
                  Sellers que Pagaron
                </th>
                <th style={{ textAlign: 'right' }}>
                  % Conv. (pagos/notif)
                  <InfoTooltip text="Pagos Tax / Notificaciones Enviadas. No implica causalidad directa." />
                </th>
                <th style={{ textAlign: 'right' }}>
                  Pagos vía Pending
                  <InfoTooltip text="Pagos con FROM_VALUE='pending' en BT_MP_DAS_TAX_EVENTS. Mide origen directo desde el flujo de pendings." />
                </th>
                <th style={{ textAlign: 'right' }}>
                  Sellers vía Pending
                </th>
                <th style={{ textAlign: 'right' }}>
                  % FROM_VALUE
                  <InfoTooltip text="Pagos vía Pending / Pagos Tax totales del mes." />
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const convColor = row.tasa_conversion_total >= 10
                  ? '#10B981'
                  : row.tasa_conversion_total >= 5
                  ? '#F59E0B'
                  : '#EF4444';

                const fromColor = row.tasa_from_value >= 50
                  ? '#10B981'
                  : row.tasa_from_value >= 25
                  ? '#F59E0B'
                  : '#94A3B8';

                return (
                  <tr key={row.periodo}>
                    <td><strong>{row.periodo}</strong></td>
                    <td style={{ textAlign: 'right' }}>{fmt(row.notificaciones_enviadas)}</td>
                    <td style={{ textAlign: 'right' }}>{fmt(row.sellers_enviadas)}</td>
                    <td style={{ textAlign: 'right' }}>{fmt(row.pagos_reales)}</td>
                    <td style={{ textAlign: 'right' }}>{fmt(row.sellers_pagos_reales)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: convColor }}>
                      {pct(row.tasa_conversion_total)}
                    </td>
                    <td style={{ textAlign: 'right' }}>{fmt(row.pagos_from_value)}</td>
                    <td style={{ textAlign: 'right' }}>{fmt(row.sellers_from_value)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: fromColor }}>
                      {pct(row.tasa_from_value)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <p style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>
          No hay datos disponibles.
        </p>
      )}

      <div style={{ marginTop: '14px', fontSize: '12px', color: '#9CA3AF' }}>
        * Las notificaciones siempre se agrupan por fecha de creación (DIM_PENDINGS). El filtro afecta únicamente cómo se agrupan los pagos en BT_MP_DAS_TAX_EVENTS.
      </div>
    </div>
  );
}

export default PendingsMonthlyTable;
