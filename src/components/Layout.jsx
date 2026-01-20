import React from 'react';
import { Home, Sprout, ClipboardList, Package } from 'lucide-react';
import clsx from 'clsx';
import { FARM_CONFIG } from '../constants';

const NavItem = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={clsx(
            "flex flex-col items-center justify-center w-full p-2 transition-all duration-200",
            active
                ? "text-nature-600 scale-110"
                : "text-earth-400 hover:text-nature-500"
        )}
    >
        <Icon size={28} strokeWidth={active ? 2.5 : 2} />
        <span className="text-xs font-medium mt-1">{label}</span>
    </button>
);

const Layout = ({ children, currentPage, onNavigate }) => {
    return (
        <div className="min-h-screen bg-earth-50 pb-24 md:pb-0 md:pl-24">
            {/* Mobile Header */}
            <header className="md:hidden bg-white/80 backdrop-blur-md sticky top-0 z-20 px-6 py-4 border-b border-nature-100 flex justify-between items-center">
                <h1 className="text-xl font-bold text-nature-800">{FARM_CONFIG.name}</h1>
                <div className="w-8 h-8 bg-nature-100 rounded-full flex items-center justify-center text-nature-700 font-bold">
                    LF
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6 max-w-5xl animate-fade-in">
                {children}
            </main>

            {/* Desktop Sidebar */}
            <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-24 bg-white border-r border-nature-100 items-center py-8 z-30">
                <div className="mb-12 w-12 h-12 bg-nature-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-nature-200">
                    LF
                </div>
                <div className="flex flex-col gap-8 w-full">
                    <NavItem icon={Home} label="Inicio" active={currentPage === 'dashboard'} onClick={() => onNavigate('dashboard')} />
                    <NavItem icon={ClipboardList} label="Tareas" active={currentPage === 'tasks'} onClick={() => onNavigate('tasks')} />
                    <NavItem icon={Sprout} label="Cultivos" active={currentPage === 'crops'} onClick={() => onNavigate('crops')} />
                    <NavItem icon={Package} label="Inventario" active={currentPage === 'inventory'} onClick={() => onNavigate('inventory')} />
                </div>
            </nav>

            {/* Mobile Bottom Bar (Thumb Friendly) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-nature-100 px-6 py-2 pb-6 z-30 flex justify-between shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                <NavItem icon={Home} label="Inicio" active={currentPage === 'dashboard'} onClick={() => onNavigate('dashboard')} />
                <NavItem icon={ClipboardList} label="Tareas" active={currentPage === 'tasks'} onClick={() => onNavigate('tasks')} />
                <NavItem icon={Sprout} label="Cultivos" active={currentPage === 'crops'} onClick={() => onNavigate('crops')} />
                <NavItem icon={Package} label="Inventario" active={currentPage === 'inventory'} onClick={() => onNavigate('inventory')} />
            </nav>
        </div>
    );
};

export default Layout;
