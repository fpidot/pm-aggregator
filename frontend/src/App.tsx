import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store';
import theme from './theme';
import Home from './pages/Home';
import AdminPanel from './components/AdminPanel';
import PasswordProtectedRoute from './components/PasswordProtectedRoute';

function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/admin" 
              element={
                <PasswordProtectedRoute 
                  isAuthenticated={isAdminAuthenticated}
                  onAuthenticate={() => setIsAdminAuthenticated(true)}
                >
                  <AdminPanel />
                </PasswordProtectedRoute>
              } 
            />
            {/* Add more routes here as needed */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;