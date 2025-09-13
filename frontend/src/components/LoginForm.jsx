import styles from '../styles/home.module.css';
import { useAuth } from '../services/authService';
import { useState } from 'react';

export default function LoginForm({ onClose }) {
    const [nome, setNome] = useState('');
    const [senha, setSenha] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const { login, register } = useAuth();

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
            <div className={styles.modalContent}>
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
                            {isLoading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Registrar')}
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