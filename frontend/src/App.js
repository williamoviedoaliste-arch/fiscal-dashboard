import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import './index.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [monthlyData, setMonthlyData] = useState(null);
  const [sellersData, setSellersData] = useState(null);
  const [sellersRecurrenceData, setSellersRecurrenceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [monthlyResponse, sellersResponse, sellersRecurrenceResponse] = await Promise.all([
          axios.get(`${API_URL}/api/metrics/monthly`),
          axios.get(`${API_URL}/api/metrics/sellers`),
          axios.get(`${API_URL}/api/metrics/sellers/recurrence`)
        ]);

        setMonthlyData(monthlyResponse.data);
        setSellersData(sellersResponse.data);
        setSellersRecurrenceData(sellersRecurrenceResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos. Por favor, verifica que el backend esté corriendo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="App">
      <Dashboard monthlyData={monthlyData} sellersData={sellersData} sellersRecurrenceData={sellersRecurrenceData} />
    </div>
  );
}

export default App;
