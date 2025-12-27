import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation();
  const isLabRoute = (location.pathname || '').startsWith('/lab');

  return (
    <div className="min-h-screen flex flex-col">
      {!isLabRoute && <Header />}
      <main className="flex-grow">
        <Outlet />
      </main>
      {!isLabRoute && <Footer />}
    </div>
  );
};

export default Layout;
