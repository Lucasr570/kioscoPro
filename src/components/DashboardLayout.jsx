import React, { useState } from "react";
import Navigation from "./Navigation";

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState("sale");

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:border-r md:border-gray-200">
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          includeSuppliers={true}
          includeClients={true}
        />
      </aside>

      {/* Sidebar Mobile (overlay con hamburguesa) */}
      <div className="md:hidden">
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          includeSuppliers={true}
          includeClients={true}
        />
      </div>

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto p-6">
        {activeTab === "sale" && <div>🛒 Vista de Venta</div>}
        {activeTab === "products" && <div>📦 Vista de Productos</div>}
        {activeTab === "history" && <div>📑 Historial</div>}
        {activeTab === "suppliers" && <div>🏭 Proveedores</div>}
        {activeTab === "clients" && <div>👥 Clientes</div>}
      </main>
    </div>
  );
};

export default DashboardLayout;
