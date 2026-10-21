import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '../routes';
import { ThemeProvider } from '../features/theme/themeStore';
import { AuthProvider } from '../features/auth/authStore';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
};
