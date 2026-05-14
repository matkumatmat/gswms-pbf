/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/dashboard/Dashboard';
import CustomerPage from './pages/directory/CustomerPage';
import ProductPage from './pages/directory/ProductPage';
import BatchPage from './pages/directory/BatchPage';
import ShippingEmbalagePage from './pages/directory/ShippingEmbalage';
import ProductEmbalageDirPage from './pages/directory/ProductEmbalage';
import ProductReceiving from './pages/inventory-control/ProductReceiving';
import ProductDist from './pages/inventory-control/ProductDist';
import ProductConsignment from './pages/inventory-control/ProductConsignment';
import ShippingEmbalageTx from './pages/inventory-control/ShippingEmbalage';
import ProductEmbalageTx from './pages/inventory-control/ProductEmbalage';
import ProductHistory from './pages/history/ProductHistory';
import ShippingEmbalageHistory from './pages/history/ShippingEmbalageHistory';
import ProductEmbalageHistory from './pages/history/ProductEmbalageHistory';
import ArchievePage from './pages/directory/ArchievePage';
import Layout from './components/layout/Layout';
import { getAuth } from './service/Auth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = getAuth();
  if (!auth) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route path="directory">
            <Route path="customers" element={<CustomerPage />} />
            <Route path="products" element={<ProductPage />} />
            <Route path="batches" element={<BatchPage />} />
            <Route path="shipping-embalage" element={<ShippingEmbalagePage />} />
            <Route path="product-embalage" element={<ProductEmbalageDirPage />} />
          </Route>

          <Route path="inventory">
            <Route path="receiving" element={<ProductReceiving />} />
            <Route path="distribution" element={<ProductDist />} />
            <Route path="consignment" element={<ProductConsignment />} />
            <Route path="shipping-embalage" element={<ShippingEmbalageTx />} />
            <Route path="product-embalage" element={<ProductEmbalageTx />} />
          </Route>

          <Route path="history">
            <Route path="product" element={<ProductHistory />} />
            <Route path="shipping-embalage" element={<ShippingEmbalageHistory />} />
            <Route path="product-embalage" element={<ProductEmbalageHistory />} />
          </Route>

          <Route path="archieve" element={<ArchievePage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
