import AuthService from "./authService";
import { AuthContext } from "../AuthContext";
import { useState, useEffect, useRef, useContext } from 'react';

export const useAuth = () => {
  const { user, login: contextLogin, logout: contextLogout } = useContext(AuthContext);
  const authService = useRef(new AuthService()).current;

  const login = async (nome, senha) => {
    try {
      const result = await authService.login(nome, senha);
      contextLogin({
        ...result.user,
        token: result.token,
        is_temporary: Boolean(result.user.is_temporary),
        isLogged: true,
      });

      return result;
    } catch (error) {
      throw error;
    }
  };

  const register = async (nome, senha) => {
    try {
      const result = await authService.register(nome, senha);
      contextLogin(result);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const createTemporaryUser = async (nome) => {
    try {
      const result = await authService.createTemporaryUser(nome);
      contextLogin(result);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.clearInfo();
    contextLogout();
  };

  useEffect(() => {
    const storedInfo = authService.getStoredInfo();
    if (storedInfo.token && storedInfo.user) {
      contextLogin(storedInfo.user);
    }
  }, [contextLogin]);

  return {
    user,
    login,
    register,
    createTemporaryUser,
    logout,
    isAuthenticated: user?.isLogged || false
  };
};