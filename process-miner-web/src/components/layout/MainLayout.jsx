import React from 'react';
import { FiActivity, FiShare2, FiList, FiGrid } from 'react-icons/fi';
import { MdOutlineDashboard, MdOutlineAccountTree, MdOutlineMonitor} from 'react-icons/md';

import SideMenu from './SideMenu';
import Header from './Header';

const MainLayout = ({ children, activeMenu, setActiveMenu, hasData }) => {
    const iconProps = { size: 22, className: "flex-shrink-0" };

    const menuItems = [
        { id: 'upload', label: 'Cargar Trazas', icon: <FiActivity {...iconProps} /> },
        { id: 'dashboard', label: 'Dashboard', icon: <MdOutlineMonitor {...iconProps} />, requiresData: true },
        { id: 'heuristic', label: 'Minería Heurística', icon: <MdOutlineAccountTree {...iconProps} />, requiresData: true },
        { id: 'alpha', label: 'Minería Alpha', icon: <FiShare2 {...iconProps} />, requiresData: true },
        { id: 'variants', label: 'Análisis Rutas', icon: <FiList {...iconProps} />, requiresData: true },
        { id: 'social', label: 'Auditoría Social', icon: <MdOutlineDashboard {...iconProps} />, requiresData: true },
        { id: 'matrices', label: 'Matrices (Heatmap)', icon: <FiGrid {...iconProps} />, requiresData: true },
    ];

    const activeItem = menuItems.find(m => m.id === activeMenu);
    const headerTitle = activeItem ? activeItem.label : 'SYS. READY';

    return (
        /* Placa base rugosa (bg-noise) */
        <div className="flex h-screen bg-chassis bg-noise font-sans overflow-hidden p-6 gap-6">

            <SideMenu
                menuItems={menuItems}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                hasData={hasData}
            />

            <div className="flex-1 flex flex-col min-w-0 gap-6">

                <Header title={headerTitle} />

                {/* Visor*/}
                <main className="flex-1 overflow-auto rounded-2xl panel-lift screw-corners relative">
                    {children}
                </main>

            </div>

        </div>
    );
};

export default MainLayout;