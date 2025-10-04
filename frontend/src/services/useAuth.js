import AuthService from "./authService";
import { AuthContext } from "../AuthContext";
import { useEffect, useRef, useContext } from 'react';

export const useAuth = () => {
  const { user, login: contextLogin, setUser, logout: contextLogout } = useContext(AuthContext);
  const authService = useRef(new AuthService()).current;

  const formatPhotoUrl = (photoUrl) => {
    if (!photoUrl) return null;
    const hasTimestamp = photoUrl.includes('?t=');
    if (hasTimestamp) {
      return photoUrl;
    }
    const separator = photoUrl.includes('?') ? '&' : '?';
    return `${photoUrl}${separator}t=${Date.now()}`;
  };

  const login = async (nome, senha) => {
    try {
      const result = await authService.login(nome, senha);

      const formattedUser = {
        ...result.user,
        token: result.token,
        is_temporary: Boolean(result.user.is_temporary),
        isLogged: true,
        photoUrl: formatPhotoUrl(result.user.photo_url || result.user.photoUrl)
      };

      contextLogin(formattedUser);

      localStorage.setItem("userInfo", JSON.stringify({
        user: formattedUser,
        token: result.token
      }));

      return result;
    } catch (error) {
      throw error;
    }
  };

  const register = async (nome, senha) => {
    try {
      const result = await authService.register(nome, senha);

      const formattedUser = {
        ...result.user,
        token: result.token,
        isLogged: true,
        photoUrl: formatPhotoUrl(result.user.photo_url || result.user.photoUrl)
      };

      contextLogin(formattedUser);

      localStorage.setItem("userInfo", JSON.stringify({
        user: formattedUser,
        token: result.token
      }));

      return result;
    } catch (error) {
      throw error;
    }
  };

  const createTemporaryUser = async (nome) => {
    try {
      const result = await authService.createTemporaryUser(nome);

      const formattedUser = {
        ...result.user,
        token: result.token,
        is_temporary: true,
        isLogged: true,
        photoUrl: formatPhotoUrl(result.user.photo_url || result.user.photoUrl)
      };

      contextLogin(formattedUser);

      localStorage.setItem("userInfo", JSON.stringify({
        user: formattedUser,
        token: result.token
      }));

      return result;
    } catch (error) {
      throw error;
    }
  };

  const uploadPhoto = async (file) => {
    if (!user?.id) throw new Error("Usuário não autenticado");

    try {
      const result = await authService.uploadUserPhoto(user.id, file);
      if (result.success) {
        const updatedUser = { 
          ...user, 
          photoUrl: formatPhotoUrl(result.data.url) 
        };

        contextLogin(updatedUser);

        localStorage.setItem("userInfo", JSON.stringify({
          user: updatedUser,
          token: user.token
        }));
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const deletePhoto = async () => {
    if (!user?.id) throw new Error("Usuário não autenticado");

    try {
      const result = await authService.deleteUserPhoto(user.id);
      if (result.success) {
        const updatedUser = { ...user, photoUrl: null };

        contextLogin(updatedUser);

        localStorage.setItem("userInfo", JSON.stringify({
          user: updatedUser,
          token: user.token
        }));
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.clearInfo();
    localStorage.removeItem("userInfo");
    contextLogout();
  };

  useEffect(() => {
    const storedInfo = authService.getStoredInfo();
    if (storedInfo?.token && storedInfo?.user) {
      const formattedUser = {
        ...storedInfo.user,
        token: storedInfo.token,
        isLogged: true,
        photoUrl: formatPhotoUrl(storedInfo.user.photo_url || storedInfo.user.photoUrl)
      };
      
      contextLogin(formattedUser);
    }
  }, [contextLogin]);

  const getUserPhoto = async (userId) => {
    
    if (!userId) return "/default.png";
    if (photoCache.has(userId)) return photoCache.get(userId);

    try {
      const response = await fetch(`${backendUrl}/api/user/${userId}/photo`);

      if (!response.ok) {
        if (response.status === 404) {
          photoCache.set(userId, "/default.png");
          return "/default.png";
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data?.url) {
        const fullUrl = `${backendUrl}${data.data.url}`;
        photoCache.set(userId, fullUrl);
        return fullUrl;
      }
      photoCache.set(userId, "/default.png");
      return "/default.png";
    } catch (error) {
      console.error(`Erro ao buscar foto do usuário ${userId}:`, error.message);
      photoCache.set(userId, "/default.png");
      return "/default.png";
    }
  };


  return {
    user,
    setUser,
    login,
    register,
    createTemporaryUser,
    uploadPhoto,
    getUserPhoto,
    deletePhoto,
    logout,
    isAuthenticated: user?.isLogged || false
  };
};