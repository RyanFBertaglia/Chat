import { useState, useEffect, useRef, useContext } from 'react';

export default class AuthService {
    constructor() {
        this.baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api`;
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

    async uploadUserPhoto(userId, file) {
        try {
            const formData = new FormData();
            formData.append('photo', file);

            const response = await fetch(`${this.baseUrl}/user/${userId}/photo`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getStoredInfo().token}`
                },
                body: formData
            });

            if (!response.ok) {
                console.log(response.message)
                throw new Error('Erro ao fazer upload da foto', response);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro no upload:', error);
            throw error;
        }
    }

    async deleteUserPhoto(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/user/${userId}/photo`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.getStoredInfo().token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao deletar foto');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao deletar foto:', error);
            throw error;
        }
    }

    getUserPhotoUrl(userId) {
        return `${this.baseUrl}/uploads/user_${userId}_*.jpg`;
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