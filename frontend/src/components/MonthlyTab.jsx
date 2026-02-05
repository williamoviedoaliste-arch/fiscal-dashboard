import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InfoTooltip from './InfoTooltip';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MonthlyTab = ({ monthlyData }) => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [filterType, setFilterType] = useState('event'); // 'event' o 'fiscal'
  const [monthDetail, setMonthDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener lista de meses disponibles
  const availableMonths = monthlyData.data.map(item => item.periodo);

  useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(availableMonths[availableMonths.length - 1]);
    }
  }, [availableMonths, selectedMonth]);

  useEffect(() => {
    if (selectedMonth) {
      fetchMonthDetail();
    }
  }, [selectedMonth, filterType]);

  const fetchMonthDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${API_URL}/api/metrics/month/${selectedMonth}?filter=${filterType}`
      );
      setMonthDetail(response.data);
    } catch (err) {
      console.error('Error fetching month detail:', err);
      setError('Error al cargar datos del mes. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Función helper para mostrar variación con color
  const renderVariation = (variation) => {
    if (variation === null || variation === undefined) {
      return <span style={{ color: '#999' }}>-</span>;
    }

    const isPositive = variation >= 0;
    const color = isPositive ? '#10B981' : '#EF4444';
    const arrow = isPositive ? '↑' : '↓';

    return (
      <span style={{ color, fontWeight: 'bold' }}>
        {arrow} {Math.abs(variation).toFixed(1)}%
      </span>
    );
  };

  if (!selectedMonth) {
    return <div className="loading">Cargando meses disponibles...</div>;
  }

  return (
    <div>
      {/* Filtros */}
      <div className="month-filter">
        <div>
          <label>Mes:</label>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-type-toggle">
          <label style={{ display: 'flex', alignItems: 'center' }}>
            Filtrar por:
            <InfoTooltip text="'Fecha de Evento' filtra por cuándo ocurrió la acción. 'Período Fiscal' filtra por el mes de impuesto al que corresponde, sin importar cuándo se ejecutó." />
          </label>
          <label>
            <input
              type="radio"
              value="event"
              checked={filterType === 'event'}
              onChange={(e) => setFilterType(e.target.value)}
            />
            Fecha de Evento
          </label>
          <label>
            <input
              type="radio"
              value="fiscal"
              checked={filterType === 'fiscal'}
              onChange={(e) => setFilterType(e.target.value)}
            />
            Período Fiscal
          </label>
        </div>
      </div>

      {loading && <div className="loading">Cargando datos...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && monthDetail && (
        <>
          {/* Encabezado con comparación */}
          <div className="chart-container">
            <h2 style={{ display: 'flex', alignItems: 'center' }}>
              📅 Detalle del Mes: {selectedMonth}
              {monthDetail.periodo_anterior && (
                <span style={{ fontSize: '16px', fontWeight: 'normal', marginLeft: '15px', color: '#666' }}>
                  vs {monthDetail.periodo_anterior}
                </span>
              )}
            </h2>
            <p style={{ color: '#666', marginTop: '10px' }}>
              {filterType === 'event'
                ? 'Filtrando por fecha en que ocurrió el evento'
                : 'Filtrando por período fiscal (mes de impuesto)'}
            </p>
          </div>

          {/* Métricas Principales con Comparación */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div className="stat-box">
              <h3>📈 Emisiones</h3>
              <div className="value">{monthDetail.current.cantidad_emisiones.toLocaleString('es-ES')}</div>
              <div className="sub-value">
                {monthDetail.current.sellers_emitieron.toLocaleString('es-ES')} sellers
              </div>
              {monthDetail.variaciones && (
                <div className="variation" style={{ marginTop: '5px', fontSize: '14px' }}>
                  {renderVariation(monthDetail.variaciones.emisiones_pct)}
                  {' '}
                  {monthDetail.variaciones.sellers_emiten_pct !== null && (
                    <span style={{ marginLeft: '10px' }}>
                      ({renderVariation(monthDetail.variaciones.sellers_emiten_pct)} sellers)
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="stat-box secondary">
              <h3>💳 Pagos</h3>
              <div className="value">{monthDetail.current.cantidad_pagos.toLocaleString('es-ES')}</div>
              <div className="sub-value">
                {monthDetail.current.sellers_pagaron.toLocaleString('es-ES')} sellers
              </div>
              {monthDetail.variaciones && (
                <div className="variation" style={{ marginTop: '5px', fontSize: '14px' }}>
                  {renderVariation(monthDetail.variaciones.pagos_pct)}
                  {' '}
                  {monthDetail.variaciones.sellers_pagan_pct !== null && (
                    <span style={{ marginLeft: '10px' }}>
                      ({renderVariation(monthDetail.variaciones.sellers_pagan_pct)} sellers)
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="stat-box success">
              <h3>💰 Volumen</h3>
              <div className="value">
                ${monthDetail.current.volumen_total.toLocaleString('es-ES', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
              <div className="sub-value">
                Ticket prom: ${monthDetail.current.ticket_promedio.toFixed(2)}
              </div>
              {monthDetail.variaciones && (
                <div className="variation" style={{ marginTop: '5px', fontSize: '14px' }}>
                  {renderVariation(monthDetail.variaciones.volumen_pct)}
                </div>
              )}
            </div>

            <div className="stat-box">
              <h3>🎯 Conversión</h3>
              <div className="value">{monthDetail.current.tasa_conversion_sellers.toFixed(1)}%</div>
              <div className="sub-value">
                Eventos: {monthDetail.current.tasa_conversion_eventos.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Comparación Detallada vs Período Anterior */}
          {monthDetail.previous && (
            <div className="chart-container">
              <h2 style={{ display: 'flex', alignItems: 'center' }}>
                📊 Comparación vs {monthDetail.periodo_anterior}
                <InfoTooltip text="Muestra la comparación de métricas clave entre el mes seleccionado y el período inmediatamente anterior. Las flechas verdes indican crecimiento, las rojas indican decrecimiento." />
              </h2>
              <div className="table-container" style={{ marginTop: '20px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Métrica</th>
                      <th>{monthDetail.periodo_anterior}</th>
                      <th>{selectedMonth}</th>
                      <th>Variación</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Emisiones</strong></td>
                      <td>{monthDetail.previous.cantidad_emisiones?.toLocaleString('es-ES') || '-'}</td>
                      <td>{monthDetail.current.cantidad_emisiones.toLocaleString('es-ES')}</td>
                      <td>{renderVariation(monthDetail.variaciones?.emisiones_pct)}</td>
                    </tr>
                    <tr>
                      <td><strong>Sellers Emiten</strong></td>
                      <td>{monthDetail.previous.sellers_emitieron?.toLocaleString('es-ES') || '-'}</td>
                      <td>{monthDetail.current.sellers_emitieron.toLocaleString('es-ES')}</td>
                      <td>{renderVariation(monthDetail.variaciones?.sellers_emiten_pct)}</td>
                    </tr>
                    <tr>
                      <td><strong>Pagos</strong></td>
                      <td>{monthDetail.previous.cantidad_pagos?.toLocaleString('es-ES') || '-'}</td>
                      <td>{monthDetail.current.cantidad_pagos.toLocaleString('es-ES')}</td>
                      <td>{renderVariation(monthDetail.variaciones?.pagos_pct)}</td>
                    </tr>
                    <tr>
                      <td><strong>Sellers Pagan</strong></td>
                      <td>{monthDetail.previous.sellers_pagaron?.toLocaleString('es-ES') || '-'}</td>
                      <td>{monthDetail.current.sellers_pagaron.toLocaleString('es-ES')}</td>
                      <td>{renderVariation(monthDetail.variaciones?.sellers_pagan_pct)}</td>
                    </tr>
                    <tr>
                      <td><strong>Volumen Total</strong></td>
                      <td>
                        {monthDetail.previous.volumen_total
                          ? `$${monthDetail.previous.volumen_total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`
                          : '-'}
                      </td>
                      <td>
                        ${monthDetail.current.volumen_total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </td>
                      <td>{renderVariation(monthDetail.variaciones?.volumen_pct)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Estados de Emisión */}
          <div className="chart-container">
            <h2 style={{ display: 'flex', alignItems: 'center' }}>
              📊 Estados de Emisión
              <InfoTooltip text="Desglose de emisiones por estado: Exitosas (success), Errores (error), y Ya Pagadas (already_paid). Un alto % de errores puede indicar problemas técnicos." />
            </h2>
            <div className="stats-grid" style={{ marginTop: '20px' }}>
              <div className="metric-card">
                <div className="icon">✅</div>
                <div className="label">Exitosas</div>
                <div className="value">{monthDetail.current.cantidad_emisiones.toLocaleString('es-ES')}</div>
                <div className="percentage">
                  {((monthDetail.current.cantidad_emisiones /
                    (monthDetail.current.cantidad_emisiones + monthDetail.current.emisiones_error + monthDetail.current.emisiones_ya_pagadas)) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="metric-card">
                <div className="icon">❌</div>
                <div className="label">Errores</div>
                <div className="value">{monthDetail.current.emisiones_error.toLocaleString('es-ES')}</div>
                <div className="percentage">
                  {((monthDetail.current.emisiones_error /
                    (monthDetail.current.cantidad_emisiones + monthDetail.current.emisiones_error + monthDetail.current.emisiones_ya_pagadas)) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="metric-card">
                <div className="icon">💚</div>
                <div className="label">Ya Pagadas</div>
                <div className="value">{monthDetail.current.emisiones_ya_pagadas.toLocaleString('es-ES')}</div>
                <div className="percentage">
                  {((monthDetail.current.emisiones_ya_pagadas /
                    (monthDetail.current.cantidad_emisiones + monthDetail.current.emisiones_error + monthDetail.current.emisiones_ya_pagadas)) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Top Períodos Fiscales (solo cuando se filtra por evento) */}
          {filterType === 'event' && monthDetail.top_periodos_fiscales && monthDetail.top_periodos_fiscales.length > 0 && (
            <div className="chart-container">
              <h2 style={{ display: 'flex', alignItems: 'center' }}>
                📅 Top Períodos Fiscales Emitidos
                <InfoTooltip text="Muestra los períodos fiscales (YEAR-MONTH) más emitidos durante este mes. Ejemplo: En enero 2026, muchos sellers emiten el período fiscal de diciembre 2025." />
              </h2>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Período Fiscal</th>
                      <th>Emisiones</th>
                      <th>Sellers</th>
                      <th>% del Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthDetail.top_periodos_fiscales.map((periodo, idx) => (
                      <tr key={idx}>
                        <td><strong>{periodo.periodo_fiscal}</strong></td>
                        <td>{periodo.emisiones.toLocaleString('es-ES')}</td>
                        <td>{periodo.sellers.toLocaleString('es-ES')}</td>
                        <td>
                          {((periodo.emisiones / monthDetail.current.cantidad_emisiones) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Información Adicional */}
          <div className="chart-container">
            <h2>ℹ️ Información Adicional</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
              <div>
                <strong>Primera actividad:</strong><br />
                {monthDetail.current.fecha_primera_actividad
                  ? new Date(monthDetail.current.fecha_primera_actividad).toLocaleString('es-ES')
                  : 'N/A'}
              </div>
              <div>
                <strong>Última actividad:</strong><br />
                {monthDetail.current.fecha_ultima_actividad
                  ? new Date(monthDetail.current.fecha_ultima_actividad).toLocaleString('es-ES')
                  : 'N/A'}
              </div>
            </div>
          </div>

          {/* Insights Generales */}
          {monthDetail.variaciones && (
            <div className="chart-container">
              <h2 style={{ display: 'flex', alignItems: 'center' }}>
                💡 Insights Generales
                <InfoTooltip text="Análisis automático de las variaciones del período para identificar tendencias, oportunidades y áreas de atención." />
              </h2>
              <div className="table-container" style={{ marginTop: '20px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '150px' }}>Categoría</th>
                      <th>Insight</th>
                      <th style={{ width: '120px' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Insight de Emisiones */}
                    <tr>
                      <td><strong>📈 Emisiones</strong></td>
                      <td>
                        {monthDetail.variaciones.emisiones_pct !== null && (
                          <>
                            {monthDetail.variaciones.emisiones_pct > 50 && (
                              <span>🔥 Crecimiento explosivo de emisiones ({monthDetail.variaciones.emisiones_pct.toFixed(1)}%). Excelente adopción del producto.</span>
                            )}
                            {monthDetail.variaciones.emisiones_pct > 20 && monthDetail.variaciones.emisiones_pct <= 50 && (
                              <span>✅ Crecimiento fuerte de emisiones ({monthDetail.variaciones.emisiones_pct.toFixed(1)}%). El producto está ganando tracción.</span>
                            )}
                            {monthDetail.variaciones.emisiones_pct > 0 && monthDetail.variaciones.emisiones_pct <= 20 && (
                              <span>📊 Crecimiento moderado de emisiones ({monthDetail.variaciones.emisiones_pct.toFixed(1)}%). Mantener momentum.</span>
                            )}
                            {monthDetail.variaciones.emisiones_pct < 0 && monthDetail.variaciones.emisiones_pct >= -20 && (
                              <span>⚠️ Ligera caída en emisiones ({monthDetail.variaciones.emisiones_pct.toFixed(1)}%). Monitorear tendencia.</span>
                            )}
                            {monthDetail.variaciones.emisiones_pct < -20 && (
                              <span>🚨 Caída significativa en emisiones ({monthDetail.variaciones.emisiones_pct.toFixed(1)}%). Requiere atención inmediata.</span>
                            )}
                          </>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {monthDetail.variaciones.emisiones_pct > 20 && <span style={{ color: '#10B981', fontSize: '24px' }}>✓</span>}
                        {monthDetail.variaciones.emisiones_pct > 0 && monthDetail.variaciones.emisiones_pct <= 20 && <span style={{ color: '#F59E0B', fontSize: '24px' }}>⚡</span>}
                        {monthDetail.variaciones.emisiones_pct < 0 && <span style={{ color: '#EF4444', fontSize: '24px' }}>⚠</span>}
                      </td>
                    </tr>

                    {/* Insight de Pagos */}
                    <tr>
                      <td><strong>💳 Pagos</strong></td>
                      <td>
                        {monthDetail.variaciones.pagos_pct !== null && (
                          <>
                            {monthDetail.variaciones.pagos_pct > 50 && (
                              <span>🔥 Crecimiento explosivo de pagos ({monthDetail.variaciones.pagos_pct.toFixed(1)}%). Excelente conversión.</span>
                            )}
                            {monthDetail.variaciones.pagos_pct > 20 && monthDetail.variaciones.pagos_pct <= 50 && (
                              <span>✅ Crecimiento fuerte de pagos ({monthDetail.variaciones.pagos_pct.toFixed(1)}%). Buena monetización.</span>
                            )}
                            {monthDetail.variaciones.pagos_pct > 0 && monthDetail.variaciones.pagos_pct <= 20 && (
                              <span>📊 Crecimiento moderado de pagos ({monthDetail.variaciones.pagos_pct.toFixed(1)}%). Estable.</span>
                            )}
                            {monthDetail.variaciones.pagos_pct < 0 && monthDetail.variaciones.pagos_pct >= -20 && (
                              <span>⚠️ Ligera caída en pagos ({monthDetail.variaciones.pagos_pct.toFixed(1)}%). Revisar fricción en el proceso.</span>
                            )}
                            {monthDetail.variaciones.pagos_pct < -20 && (
                              <span>🚨 Caída significativa en pagos ({monthDetail.variaciones.pagos_pct.toFixed(1)}%). Problema crítico de conversión.</span>
                            )}
                          </>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {monthDetail.variaciones.pagos_pct > 20 && <span style={{ color: '#10B981', fontSize: '24px' }}>✓</span>}
                        {monthDetail.variaciones.pagos_pct > 0 && monthDetail.variaciones.pagos_pct <= 20 && <span style={{ color: '#F59E0B', fontSize: '24px' }}>⚡</span>}
                        {monthDetail.variaciones.pagos_pct < 0 && <span style={{ color: '#EF4444', fontSize: '24px' }}>⚠</span>}
                      </td>
                    </tr>

                    {/* Insight de Volumen */}
                    <tr>
                      <td><strong>💰 Volumen</strong></td>
                      <td>
                        {monthDetail.variaciones.volumen_pct !== null && (
                          <>
                            {monthDetail.variaciones.volumen_pct > 30 && (
                              <span>🚀 Volumen monetario en alza ({monthDetail.variaciones.volumen_pct.toFixed(1)}%). Revenue creciendo fuertemente.</span>
                            )}
                            {monthDetail.variaciones.volumen_pct > 0 && monthDetail.variaciones.volumen_pct <= 30 && (
                              <span>💚 Volumen monetario creciente ({monthDetail.variaciones.volumen_pct.toFixed(1)}%). Tendencia positiva.</span>
                            )}
                            {monthDetail.variaciones.volumen_pct < 0 && monthDetail.variaciones.volumen_pct >= -20 && (
                              <span>⚠️ Volumen ligeramente bajo ({monthDetail.variaciones.volumen_pct.toFixed(1)}%). Posible estacionalidad.</span>
                            )}
                            {monthDetail.variaciones.volumen_pct < -20 && (
                              <span>🚨 Caída importante en volumen ({monthDetail.variaciones.volumen_pct.toFixed(1)}%). Impacto en revenue.</span>
                            )}
                          </>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {monthDetail.variaciones.volumen_pct > 20 && <span style={{ color: '#10B981', fontSize: '24px' }}>✓</span>}
                        {monthDetail.variaciones.volumen_pct > 0 && monthDetail.variaciones.volumen_pct <= 20 && <span style={{ color: '#F59E0B', fontSize: '24px' }}>⚡</span>}
                        {monthDetail.variaciones.volumen_pct < 0 && <span style={{ color: '#EF4444', fontSize: '24px' }}>⚠</span>}
                      </td>
                    </tr>

                    {/* Insight de Conversión */}
                    <tr>
                      <td><strong>🎯 Conversión</strong></td>
                      <td>
                        {(() => {
                          const conversionActual = monthDetail.current.tasa_conversion_sellers;
                          if (conversionActual >= 60) {
                            return <span>🏆 Excelente tasa de conversión ({conversionActual.toFixed(1)}%). Funnel optimizado.</span>;
                          } else if (conversionActual >= 40) {
                            return <span>✅ Buena tasa de conversión ({conversionActual.toFixed(1)}%). Mayoría de sellers completa el pago.</span>;
                          } else if (conversionActual >= 25) {
                            return <span>📊 Conversión moderada ({conversionActual.toFixed(1)}%). Hay oportunidad de mejora.</span>;
                          } else {
                            return <span>⚠️ Conversión baja ({conversionActual.toFixed(1)}%). Revisar barreras en el funnel de pago.</span>;
                          }
                        })()}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {monthDetail.current.tasa_conversion_sellers >= 40 && <span style={{ color: '#10B981', fontSize: '24px' }}>✓</span>}
                        {monthDetail.current.tasa_conversion_sellers >= 25 && monthDetail.current.tasa_conversion_sellers < 40 && <span style={{ color: '#F59E0B', fontSize: '24px' }}>⚡</span>}
                        {monthDetail.current.tasa_conversion_sellers < 25 && <span style={{ color: '#EF4444', fontSize: '24px' }}>⚠</span>}
                      </td>
                    </tr>

                    {/* Insight de Sellers */}
                    <tr>
                      <td><strong>👥 Sellers</strong></td>
                      <td>
                        {monthDetail.variaciones.sellers_emiten_pct !== null && monthDetail.variaciones.sellers_pagan_pct !== null && (
                          <>
                            {monthDetail.variaciones.sellers_emiten_pct > monthDetail.variaciones.sellers_pagan_pct + 20 && (
                              <span>⚠️ Los sellers emiten más ({monthDetail.variaciones.sellers_emiten_pct.toFixed(1)}%) pero pagan menos ({monthDetail.variaciones.sellers_pagan_pct.toFixed(1)}%). Brecha de conversión creciente.</span>
                            )}
                            {monthDetail.variaciones.sellers_pagan_pct > monthDetail.variaciones.sellers_emiten_pct && (
                              <span>🎯 Sellers pagando crecen más rápido ({monthDetail.variaciones.sellers_pagan_pct.toFixed(1)}%) que los que emiten ({monthDetail.variaciones.sellers_emiten_pct.toFixed(1)}%). Excelente monetización.</span>
                            )}
                            {Math.abs(monthDetail.variaciones.sellers_emiten_pct - monthDetail.variaciones.sellers_pagan_pct) <= 20 && (
                              <span>✅ Crecimiento balanceado entre sellers que emiten ({monthDetail.variaciones.sellers_emiten_pct.toFixed(1)}%) y pagan ({monthDetail.variaciones.sellers_pagan_pct.toFixed(1)}%).</span>
                            )}
                          </>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {monthDetail.variaciones.sellers_pagan_pct > 0 && <span style={{ color: '#10B981', fontSize: '24px' }}>✓</span>}
                        {monthDetail.variaciones.sellers_pagan_pct <= 0 && monthDetail.variaciones.sellers_pagan_pct >= -20 && <span style={{ color: '#F59E0B', fontSize: '24px' }}>⚡</span>}
                        {monthDetail.variaciones.sellers_pagan_pct < -20 && <span style={{ color: '#EF4444', fontSize: '24px' }}>⚠</span>}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MonthlyTab;
