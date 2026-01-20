import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Crops from './pages/Crops';
import Inventory from './pages/Inventory';

function App() {
    const [currentPage, setCurrentPage] = useState('dashboard');

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard': return <Dashboard onNavigate={setCurrentPage} />;
            case 'tasks': return <Tasks />;
            case 'crops': return <Crops />;
            case 'inventory': return <Inventory />;
            default: return <Dashboard onNavigate={setCurrentPage} />;
        }
    };

    return (
        <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
            {renderPage()}
        </Layout>
    );
}

export default App;
