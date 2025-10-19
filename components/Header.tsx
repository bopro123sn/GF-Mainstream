import React from 'react';
import { cargillColors } from '../cargillAssets';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10 dark:bg-slate-800 dark:border-b dark:border-slate-700">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Cargill_logo.svg/1280px-Cargill_logo.svg.png" alt="Cargill Logo" className="h-7" />
          <h1 className="text-base md:text-lg font-semibold text-gray-600 dark:text-gray-300">
            Chương Trình Dinh Dưỡng Heo Thịt.
          </h1>
        </div>
        <a 
          href="https://www.cargill.com.vn/vi/thuc-an-chan-nuoi" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm font-semibold hover:underline"
          style={{ color: cargillColors.green }}
        >
          Cargill Dinh Dưỡng Vật Nuôi
        </a>
      </div>
    </header>
  );
};

export default Header;