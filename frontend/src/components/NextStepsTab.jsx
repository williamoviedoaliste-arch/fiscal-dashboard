import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const NextStepsTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNextStepsMetrics();
  }, []);

  const fetchNextStepsMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/metrics/nextsteps`);
      setData(response.data);
    } catch (err) {
      console.error('Error fetching next steps metrics:', err);
      setError('Error al cargar métricas. Verifica que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando métricas estratégicas...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!data) return null;

  const { cohorts, engagement, pendientes } = data;

  // Preparar datos para gráfico de retención
  const retentionData = cohorts.map(cohort => ({
    cohort: cohort.cohort_mes,
    'Mes 0': 100,
    'Mes 1': cohort.retention.mes_1,
    'Mes 2': cohort.retention.mes_2,
    'Mes 3': cohort.retention.mes_3
  }));

  // Preparar datos para gráfico de engagement
  const engagementData = [
    { rango: '1 día', sellers: engagement.sellers_1_dia },
    { rango: '2-3 días', sellers: engagement.sellers_2_3_dias },
    { rango: '4-7 días', sellers: engagement.sellers_4_7_dias },
    { rango: '8+ días', sellers: engagement.sellers_8_plus_dias }
  ];

  // Preparar datos para gráfico de períodos pendientes
  const pendientesData = [
    { rango: '0 pendientes', sellers: pendientes.sellers_0_pendientes },
    { rango: '1 pendiente', sellers: pendientes.sellers_1_pendiente },
    { rango: '2-3 pendientes', sellers: pendientes.sellers_2_3_pendientes },
    { rango: '4-6 pendientes', sellers: pendientes.sellers_4_6_pendientes },
    { rango: '7+ pendientes', sellers: pendientes.sellers_7_plus_pendientes }
  ];

  return (
    <div>
      <div className="chart-container">
        <h2>🎯 Métricas Estratégicas para Next Steps</h2>
        <p style={{ color: '#666', marginTop: '10px' }}>
          Estas métricas te ayudarán a tomar decisiones sobre engagement, retención y recuperación de sellers.
        </p>
      </div>

      {/* Retención por Cohorte */}
      <div className="chart-container">
        <h2>📈 Análisis de Retención por Cohorte</h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
          % de sellers que regresan en los meses siguientes a su primer actividad
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={retentionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="cohort" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
            <Legend />
            <Line type="monotone" dataKey="Mes 0" stroke="#667eea" strokeWidth={2} />
            <Line type="monotone" dataKey="Mes 1" stroke="#764ba2" strokeWidth={2} />
            <Line type="monotone" dataKey="Mes 2" stroke="#f093fb" strokeWidth={2} />
            <Line type="monotone" dataKey="Mes 3" stroke="#f5576c" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
        <div className="insight">
          <strong>Acción recomendada:</strong> Enfocarse en mejorar la retención del Mes 1 con campañas de re-engagement.
          Los sellers que pasan el Mes 1 tienen mayor probabilidad de quedarse.
        </div>

        {/* Tabla de cohortes */}
        <div className="table-container" style={{ marginTop: '30px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Cohorte</th>
                <th>Sellers</th>
                <th>Mes 0</th>
                <th>Mes 1</th>
                <th>Mes 2</th>
                <th>Mes 3</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map((cohort, idx) => (
                <tr key={idx}>
                  <td><strong>{cohort.cohort_mes}</strong></td>
                  <td>{cohort.sellers_cohort.toLocaleString('es-ES')}</td>
                  <td>{cohort.retention.mes_0}%</td>
                  <td>{cohort.retention.mes_1}%</td>
                  <td>{cohort.retention.mes_2}%</td>
                  <td>{cohort.retention.mes_3}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Engagement: Días Activos */}
      <div className="chart-container">
        <h2>🔥 Nivel de Engagement (Días Activos)</h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
          Distribución de sellers según cuántos días han estado activos
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={engagementData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rango" />
            <YAxis />
            <Tooltip formatter={(value) => value.toLocaleString('es-ES')} />
            <Bar dataKey="sellers" fill="#667eea" name="Cantidad de Sellers" />
          </BarChart>
        </ResponsiveContainer>
        <div className="insight">
          <strong>Acción recomendada:</strong> Los sellers con 8+ días activos son los más engaged.
          Identificar qué los motiva y replicar esas acciones en sellers menos activos.
        </div>
      </div>

      {/* Períodos Pendientes */}
      <div className="chart-container">
        <h2>⚠️ Distribución de Períodos Fiscales Pendientes</h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
          Sellers agrupados por cantidad de períodos fiscales emitidos pero no pagados
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={pendientesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rango" />
            <YAxis />
            <Tooltip formatter={(value) => value.toLocaleString('es-ES')} />
            <Bar dataKey="sellers" fill="#f5576c" name="Cantidad de Sellers" />
          </BarChart>
        </ResponsiveContainer>
        <div className="insight">
          <strong>Acción recomendada:</strong> Promedio de pendientes por seller: {pendientes.promedio_pendientes.toFixed(2)}.
          Priorizar recuperación de sellers con 4+ períodos pendientes (riesgo alto de churn).
        </div>
      </div>

      {/* Resumen de Acciones */}
      <div className="chart-container">
        <h2>🎯 Próximos Pasos Recomendados</h2>
        <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
          <div style={{ padding: '20px', background: '#f0f9ff', borderLeft: '4px solid #3b82f6', borderRadius: '8px' }}>
            <h3 style={{ color: '#1e40af', marginBottom: '10px' }}>1. Campaña de Retención (Mes 1)</h3>
            <p style={{ color: '#374151' }}>
              Crear campaña de email/push para sellers que completaron su primer mes.
              Ofrecer incentivos para segundo uso (descuento, cashback).
            </p>
          </div>

          <div style={{ padding: '20px', background: '#f0fdf4', borderLeft: '4px solid #10b981', borderRadius: '8px' }}>
            <h3 style={{ color: '#065f46', marginBottom: '10px' }}>2. Programa de Recuperación</h3>
            <p style={{ color: '#374151' }}>
              Focalizar en {pendientes.sellers_4_6_pendientes + pendientes.sellers_7_plus_pendientes} sellers
              con 4+ períodos pendientes. Ofrecer planes de pago y recordatorios personalizados.
            </p>
          </div>

          <div style={{ padding: '20px', background: '#fef3c7', borderLeft: '4px solid #f59e0b', borderRadius: '8px' }}>
            <h3 style={{ color: '#92400e', marginBottom: '10px' }}>3. Engagement de Power Users</h3>
            <p style={{ color: '#374151' }}>
              Identificar a los {engagement.sellers_8_plus_dias} sellers más activos (8+ días).
              Crear programa de referidos o embajadores para multiplicar el engagement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NextStepsTab;
