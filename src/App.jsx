import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Crops from './pages/Crops';
import Inventory from './pages/Inventory';
import Harvests from './pages/Harvests';
import ClimateRadar from './components/ClimateRadar';
import ButlerChat from './components/ButlerChat';
import Machinery from './pages/Machinery';

function App() {
    const [currentPage, setCurrentPage] = useState('dashboard');

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard': return <Dashboard onNavigate={setCurrentPage} />;
            case 'tasks': return <Tasks />;
            case 'crops': return <Crops />;
            case 'inventory': return <Inventory />;
            case 'harvests': return <Harvests />;
            case 'radar': return <ClimateRadar onBack={() => setCurrentPage('dashboard')} />;
            case 'machinery': return <Machinery />;
            default: return <Dashboard onNavigate={setCurrentPage} />;
        }
    };

    return (
        <>
            <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
                {renderPage()}
            </Layout>
            <ButlerChat />
        </>
    );
}

export default App;
