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

  // Função para formatar URL da foto
  const formatPhotoUrl = (photoUrl) => {
    if (!photoUrl) return null;
    const hasTimestamp = photoUrl.includes('?t=');
    if (hasTimestamp) return photoUrl;
    
    const separator = photoUrl.includes('?') ? '&' : '?';
    return `${photoUrl}${separator}t=${Date.now()}`;
  };

  useEffect(() => {
    const authService = new AuthService();
    const stored = authService.getStoredInfo();

    if (stored?.token && stored.user) {
      setUser({
        ...stored.user,
        token: stored.token,
        isLogged: true,
        photoUrl: formatPhotoUrl(stored.user.photo_url || stored.user.photoUrl)
      });
    }
    setIsInitializing(false);
  }, []);

  const login = (userData) => {
    const formattedUser = {
      isLogged: true,
      id: userData.id ?? userData.user?.id ?? null,
      name: userData.name ?? userData.user?.name ?? "",
      token: userData.token ?? null,
      photoUrl: formatPhotoUrl(userData.photoUrl || userData.photo_url || userData.user?.photoUrl || userData.user?.photo_url),
      is_temporary: userData.is_temporary ?? userData.user?.is_temporary ?? false,
      expires_at: userData.expires_at ?? userData.user?.expires_at ?? null,
      created_at: userData.created_at ?? userData.user?.created_at ?? null
    };

    setUser(formattedUser);
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
    <AuthContext.Provider value={{ user, setUser, login, logout, isInitializing }}>
      {children}
    </AuthContext.Provider>
  );
};