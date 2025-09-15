import styles from '../styles/home.module.css';
import LoginForm from '../components/LoginForm';
import TempLoginForm from '../components/TempLoginForm';
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../services/authService';

export default function Home() {
    const [showFormLogin, setShowFormLogin] = useState(false);
    const [showTempFormLogin, setShowTempFormLogin] = useState(false);
    const { isAuthenticated, isInitializing } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isInitializing && isAuthenticated) {
            navigate("/chat", { replace: true });
            window.location.reload();
        }
    }, [isAuthenticated, isInitializing, navigate]);

    if (isInitializing) {
        return <div>Carregando...</div>;
    }

    return (
    <div className="container">
        <div className="header">
            <h1>Chat em Tempo Real</h1>
        </div>
      
        <div className="chat-container">
            <div className={styles.botoes}>
                <button onClick={() => setShowFormLogin(true)}>Login / Registrar-se</button>
                <button onClick={() => setShowTempFormLogin(true)}>Continuar sem conta</button>
            </div>
        </div>
        {showFormLogin && <LoginForm onClose={() => setShowFormLogin(false)} />}
        {showTempFormLogin && <TempLoginForm onClose={() => setShowTempFormLogin(false)} />}
    </div>
    )
}
