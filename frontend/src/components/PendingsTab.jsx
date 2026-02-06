import React, { useState, useEffect } from 'react';
import PendingsSummaryCards from './PendingsSummaryCards';
import PendingsConversionFunnel from './PendingsConversionFunnel';
import PendingsEvolutionChart from './PendingsEvolutionChart';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function PendingsTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch summary
      const summaryResponse = await fetch(`${API_URL}/api/pendings/summary`);
      if (!summaryResponse.ok) {
        throw new Error('Error al cargar resumen de notificaciones');
      }
      const summaryJson = await summaryResponse.json();
      setSummaryData(summaryJson);

      // Fetch monthly
      const monthlyResponse = await fetch(`${API_URL}/api/pendings/monthly`);
      if (!monthlyResponse.ok) {
        throw new Error('Error al cargar datos mensuales');
      }
      const monthlyJson = await monthlyResponse.json();
      setMonthlyData(monthlyJson.data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px'
      }}>
        <div>Cargando datos de notificaciones...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        background: '#fee2e2',
        borderRadius: '8px',
        color: '#991b1b'
      }}>
        <h3>Error al cargar datos</h3>
        <p>{error}</p>
        <button
          onClick={fetchAllData}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ margin: 0, color: '#111827', fontSize: '28px' }}>
          Uso de Pendings
        </h2>
        <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
          Análisis de conversión y efectividad de las notificaciones de pendientes (DAS payments)
        </p>
      </div>

      {/* Summary Cards */}
      <PendingsSummaryCards data={summaryData} />

      {/* Funnel de Conversión */}
      <PendingsConversionFunnel data={summaryData} />

      {/* Gráfico de evolución mensual */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <PendingsEvolutionChart data={monthlyData} />
      </div>

      {/* Info box sobre limitaciones */}
      <div style={{
        background: '#fef3c7',
        border: '1px solid #fbbf24',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '20px'
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#92400e' }}>
          ⚠️ Limitaciones Conocidas
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#78350f', fontSize: '14px' }}>
          <li>
            <strong>Estado "Descartadas":</strong> No distingue entre sellers que manualmente descartaron
            la notificación vs sistema que la removió (por expiración o pago externo).
          </li>
          <li>
            <strong>Correlación Individual:</strong> No hay clave directa que une una notificación específica
            con un pago en BT_MP_DAS_TAX_EVENTS. El análisis es agregado por período.
          </li>
          <li>
            <strong>Criticidad:</strong> Análisis no desglosado por nivel de criticidad (C3, C4) ya que actualmente
            solo existe un nivel predominante.
          </li>
        </ul>
      </div>
    </div>
  );
}

export default PendingsTab;
