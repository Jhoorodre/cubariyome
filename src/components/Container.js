// src/components/Container.js
import React from 'react';
import { classNames } from '../utils/strings'; // Supondo que você tenha uma função auxiliar para classes

const Container = ({ children, className }) => {
  return (
    <div className={classNames("container mx-auto my-auto max-w-7xl px-2 sm:px-6 lg:px-8", className)}>
      <div className="w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default Container;