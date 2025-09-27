import styles from '../styles/home.module.css';
import { useAuth } from '../services/useAuth';
import { useState, useEffect, useRef } from 'react';

export default function TempLoginForm({ onClose }) {
    const [nome, setNome] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { createTemporaryUser } = useAuth();
    const formRef = useRef(null);

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



    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await createTemporaryUser(nome);
            onClose();
        } catch (error) {
            setError('Erro ao criar usuário temporário.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay} >
            <div className={styles.modalContent} ref={formRef}>
                <h2>Continuar sem conta</h2>
                {error && <div className={styles.errorMessage}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Escolha um nome: " 
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                    />
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        gap: '50px',
                    }}>
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Carregando...' : 'Entrar'}
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