// src/components/Layout.js
import React, { useRef } from 'react';
import Navbar from './Navbar';
import AppRouter from '../Router';

const Layout = () => {
  const scrollableContainerRef = useRef(null);

  return (
    <div className="min-h-screen h-full flex flex-col bg-gray-100 dark:bg-gray-800">
      <Navbar />
      <div 
        ref={scrollableContainerRef} 
        className="flex-1 overflow-y-auto" 
      >
        <AppRouter scrollableContainerRef={scrollableContainerRef} />
      </div>
    </div>
  );
};

export default Layout;
