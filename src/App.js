import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Assets from './pages/Assets';
import AssetDetail from './pages/AssetDetail';
import CreateAsset from './pages/CreateAsset';
import Transfer from './pages/Transfer';
import CoOwnership from './pages/CoOwnership';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/assets/new" element={<CreateAsset />} />
          <Route path="/assets/:id" element={<AssetDetail />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/co-ownership" element={<CoOwnership />} />
          {/* legacy routes from the original app */}
          <Route path="/change" element={<Navigate to="/transfer" replace />} />
          <Route path="/multi" element={<Navigate to="/co-ownership" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
