import React from 'react';
import { Route, Routes } from 'react-router-dom';

import NewWorkNotification from '@/components/layout/NewWorkNotification';
import Category from '@/components/pages/Category';
import Home from '@/components/pages/Home';
import Login from '@/components/pages/Login';
import MyFavorites from '@/components/pages/MyFavorites';
import Register from '@/components/pages/Register';
import Work from '@/components/pages/Work';
import ProtectedRoute from '@/core/ProtectedRoute';

function RootContainer() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/categories/:id" element={<Category />} />
        <Route path="/works/:id" element={<Work />} />
        <Route
          path="/favorites"
          element={(
            <ProtectedRoute>
              <MyFavorites />
            </ProtectedRoute>
          )}
        />
      </Routes>
      <NewWorkNotification />
    </>
  );
}

export default RootContainer;
