import React, { createContext, useState, useEffect } from 'react';
import { BackendService } from '../Utils/Api\'s/ApiMiddleWare';
import ApiEndpoints from '../Utils/Api\'s/ApiEndpoints';
import { toast } from 'react-toastify';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const authStatus = async () => {
    try {
      const response = await BackendService(ApiEndpoints.authStatus, {});
      if (response?.data) {
        setUser(response.data);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      setUser(null);
      setIsLoggedIn(false);
      console.error('Auth status error:', error);
    }
  };

  useEffect(() => {
    authStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await BackendService(ApiEndpoints.logout, {});
      setIsLoggedIn(false);
      setUser(null);
      toast.success('Logged out successfully.');
    } catch (error) {
      console.error(error);
      toast.error('Unable to logout. Please try again.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        setUser,
        setIsLoggedIn,
        authStatus,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export { AuthContext, AuthProvider, useAuth };
