// src/components/Text.js
import React from 'react';

const Text = ({ children, text }) => {
  return (
    <section className="w-full flex-grow pt-2">
      <div className="w-full flex-grow">
        <p className="text-base text-gray-700 dark:text-gray-300 font-normal leading-loose">
          {text || children}
        </p>
      </div>
    </section>
  );
};

export default Text;