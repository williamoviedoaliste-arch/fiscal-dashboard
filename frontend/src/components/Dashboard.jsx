import React from 'react';
import Tabs from './Tabs';
import GeneralTab from './GeneralTab';
import MonthlyTab from './MonthlyTab';
import PendingsTab from './PendingsTab';
import DocumentationTab from './DocumentationTab';

const Dashboard = ({ monthlyData, sellersData }) => {
  if (!monthlyData || !sellersData) {
    return <div className="loading">No hay datos disponibles</div>;
  }

  const tabs = [
    {
      label: 'General',
      icon: '📊',
      content: <GeneralTab monthlyData={monthlyData} sellersData={sellersData} />
    },
    {
      label: 'Mensual',
      icon: '📅',
      content: <MonthlyTab monthlyData={monthlyData} />
    },
    {
      label: 'Uso de Pendings',
      icon: '🔔',
      content: <PendingsTab />
    },
    {
      label: 'Documentación',
      icon: '📖',
      content: <DocumentationTab />
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard de Métricas Fiscales</h1>
        <p>
          Análisis de Emisiones y Pagos - Período: Agosto 2025 a Febrero 2026
        </p>
      </div>

      <Tabs tabs={tabs} defaultTab={0} />
    </div>
  );
};

export default Dashboard;
