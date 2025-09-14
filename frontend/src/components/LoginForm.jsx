import styles from '../styles/home.module.css';
import { useAuth } from '../services/authService';
import { useState, useEffect, useRef } from 'react';

export default function LoginForm({ onClose }) {
    const [nome, setNome] = useState('');
    const [senha, setSenha] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const { login, register } = useAuth();
    const formRef = useRef(null);
    const [dots, setDots] = useState('');



    useEffect(() => {
            function handleClickOutside(event) {
                if (formRef.current && !formRef.current.contains(event.target)) {
                    onClose();
                }
            }
    
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            };
        }, [onClose]);
    
    useEffect(() => {
    if (!isLoading) {
        setDots('');
        return;
    }

    const interval = setInterval(() => {
        setDots(prev => (prev.length < 3 ? prev + '.' : ''));
    }, 500);

    return () => clearInterval(interval);
    }, [isLoading]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (isLogin) {
                await login(nome, senha);
            } else {
                await register(nome, senha);
            }
            onClose();
        } catch (error) {
            setError(isLogin ? 
                `Erro no login ${error.error}. Verifique suas credenciais.` : 
                'Erro no registro. Tente outro nome.'
            );
        }finally {
            setIsLoading(false);
        }
    
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} ref={formRef}>
                <h2>{isLogin ? 'Login' : 'Registrar'}</h2>
                {error && <div className={styles.errorMessage}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Nome de usuário" 
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Senha" 
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                    />
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        gap: '10px',
                        flexDirection: 'column'
                    }}>
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? `Carregando${dots}` : (isLogin ? 'Entrar' : 'Registrar')}
                        </button>
                        
                        <button type="button" onClick={() => setIsLogin(!isLogin)} disabled={isLoading}>
                            {isLogin ? 'Criar nova conta' : 'Já tenho uma conta'}
                        </button>
                        
                        <button type="button" onClick={onClose} disabled={isLoading}>
                            Fechar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}