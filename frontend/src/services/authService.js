import { AuthContext } from "../AuthContext";
import { useState, useEffect, useRef, useContext } from 'react';

class AuthService {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
    }

    async login(nome, senha) {
        try {
            const response = await fetch(`${this.baseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: nome, password: senha })
            });

            if (!response.ok) {
                throw new Error('Erro no login');
            }

            const data = await response.json();
            this.saveInfo(data);
            return data;
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    }

    async register(nome, senha) {
        try {
            const response = await fetch(`${this.baseUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: nome, password: senha })
            });

            if (!response.ok) {
                throw new Error('Erro no registro');
            }

            const data = await response.json();
            this.saveInfo(data);
            return data;
        } catch (error) {
            console.error('Erro no registro:', error);
            throw error;
        }
    }

    async createTemporaryUser(nome) {
        try {
            const response = await fetch(`${this.baseUrl}/login-temporario`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: nome })
            });

            if (!response.ok) {
                throw new Error(`Erro ao criar usuário temporário, tente outro nome`);
            }

            const data = await response.json();
            this.saveInfo(data);
            return data;
        } catch (error) {
            console.error('Erro ao criar usuário temporário:', error);
            throw error;
        }
    }

    saveInfo(authData) {
        if (authData && authData.token) {
            localStorage.setItem('authToken', authData.token);
            localStorage.setItem('userInfo', JSON.stringify(authData.user));
        }
    }

    getStoredInfo() {
        const token = localStorage.getItem('authToken');
        const userInfo = localStorage.getItem('userInfo');
        
        return {
            token,
            user: userInfo ? JSON.parse(userInfo) : null
        };
    }

    clearInfo() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
    }
}



export default AuthService;