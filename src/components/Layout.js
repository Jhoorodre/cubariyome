// src/components/Layout.js
import React from 'react';
import Navbar from './Navbar';
import AppRouter from '../Router';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-800">
      <Navbar />
      <AppRouter />
      {/* Você pode adicionar um Footer aqui se desejar */}
    </div>
  );
};

export default Layout;
