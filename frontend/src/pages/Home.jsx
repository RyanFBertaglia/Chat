import styles from '../styles/home.module.css'
import LoginForm from '../components/LoginForm';
import TempLoginForm from '../components/TempLoginForm'
import { useState } from 'react';


export default function Home() {
    const [showFormLogin, setShowFormLogin] = useState(false);
    const [showTempFormLogin, setShowTempFormLogin] = useState(false);

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
