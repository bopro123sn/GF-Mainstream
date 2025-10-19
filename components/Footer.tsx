import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-800 mt-8 py-6 border-t border-gray-200 dark:border-slate-700">
      <div className="container mx-auto px-4 md:px-6 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Cargill, Incorporated. All Rights Reserved.</p>
        <p className="mt-1">
          Chương Trình Dinh Dưỡng Heo Thịt.
        </p>
      </div>
    </footer>
  );
};

export default Footer;