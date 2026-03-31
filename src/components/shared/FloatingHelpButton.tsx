import React from 'react';
import { Link } from 'react-router-dom';

const FloatingHelpButton = () => {
  return (
    <div className="fixed right-6 bottom-6 z-50">
      <Link 
        to="/buddysafe"
        className="flex flex-col items-center justify-center bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 border border-blue-200"
      >
        <img 
          src="/images/buddysafeicon.png" 
          alt="Get Help" 
          className="w-12 h-12 object-contain mb-1"
        />
        <span className="text-sm font-medium text-blue-600">Get Help!</span>
      </Link>
    </div>
  );
};

export default FloatingHelpButton;
