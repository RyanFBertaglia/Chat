import React, { createContext, useState, useEffect } from "react";
import AuthService from "./services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    isLogged: false,
    id: null,
    name: "",
    token: null,
    photoUrl: null,
    is_temporary: false,
    expires_at: null,
    created_at: null
  });

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const authService = new AuthService();
    const stored = authService.getStoredInfo();

    if (stored?.token && stored.user) {
      setUser({
        ...stored.user,
        token: stored.token,
        isLogged: true,
        photoUrl: stored.user.photo_url || null
      });
    }
    setIsInitializing(false);
  }, []);

  const login = (userData) => {
    setUser({
      isLogged: true,
      id: userData.id ?? userData.user?.id ?? null,
      name: userData.name ?? userData.user?.name ?? "",
      token: userData.token ?? null,
      photoUrl: userData.photo_url ?? userData.user?.photo_url ?? null, // Capture a photo_url
      is_temporary: userData.is_temporary ?? userData.user?.is_temporary ?? false,
      expires_at: userData.expires_at ?? userData.user?.expires_at ?? null,
      created_at: userData.created_at ?? userData.user?.created_at ?? null
    });
  };

  const logout = () => {
    const authService = new AuthService();
    authService.clearInfo();
    setUser({
      isLogged: false,
      id: null,
      name: "",
      token: null,
      photoUrl: null,
      is_temporary: false,
      expires_at: null,
      created_at: null
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isInitializing }}>
      {children}
    </AuthContext.Provider>
  );
};