import React from 'react';
import Tabs from './Tabs';
import GeneralTab from './GeneralTab';
import MonthlyTab from './MonthlyTab';
import PendingsTab from './PendingsTab';
import DocumentationTab from './DocumentationTab';

const formatPeriod = (periodo) => {
  const [year, month] = periodo.split('-');
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  return `${months[parseInt(month) - 1]} ${year}`;
};

const Dashboard = ({ monthlyData, sellersData, sellersRecurrenceData }) => {
  if (!monthlyData || !sellersData) {
    return <div className="loading">No hay datos disponibles</div>;
  }

  const periodos = (Array.isArray(monthlyData) ? monthlyData : monthlyData.data || []).map(d => d.periodo).sort();
  const desde = periodos.length ? formatPeriod(periodos[0]) : '';
  const hasta = periodos.length ? formatPeriod(periodos[periodos.length - 1]) : '';

  const tabs = [
    {
      label: 'General',
      icon: '📊',
      content: <GeneralTab monthlyData={monthlyData} sellersData={sellersData} sellersRecurrenceData={sellersRecurrenceData} />
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
          Análisis de Emisiones y Pagos - Período: {desde} a {hasta}
        </p>
      </div>

      <Tabs tabs={tabs} defaultTab={0} />
    </div>
  );
};

export default Dashboard;
