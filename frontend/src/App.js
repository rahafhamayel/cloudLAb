
import React from 'react';
import MainLayout from './components/MainLayout'; // Assuming this is the correct path
import { AuthProvider } from './AuthContext';  

function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;