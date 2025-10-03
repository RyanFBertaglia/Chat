import styles from '../styles/account.module.css';
import { useAuth } from '../services/useAuth';
import React, { useState, useRef, useEffect } from "react";

export default function MyAccount({ onClose }) {
    const { user, setUser, uploadPhoto, deletePhoto } = useAuth();
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState('');
    const fileInputRef = useRef(null);
    const containerRef = useRef(null);

    const backendUrl = "http://localhost:3000";

    // Cache busting - adiciona parametro para url para burlar cache do navegador
    const getFullPhotoUrl = (photoUrl) => {
      if (!photoUrl) return '/default.png';
      
      if (photoUrl.startsWith('http')) {
        const hasTimestamp = photoUrl.includes('?t=');
        if (hasTimestamp) return photoUrl;
        return `${photoUrl}?t=${Date.now()}`;
      }
      
      const fullUrl = `${backendUrl}${photoUrl}`;
      const hasTimestamp = fullUrl.includes('?t=');
      if (hasTimestamp) return fullUrl;
      return `${fullUrl}?t=${Date.now()}`;
    };

    useEffect(() => {
      if (selectedFile) return;
      
      if (user?.photoUrl) {
        setPreviewUrl(getFullPhotoUrl(user.photoUrl));
      } else {
        setPreviewUrl('/default.png');
      }
    }, [user?.photoUrl, selectedFile]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setMessage('Por favor, selecione um arquivo de imagem');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage('A imagem deve ter menos de 5MB');
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setMessage('');
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setMessage('Por favor, selecione uma imagem');
            return;
        }

        setIsUploading(true);
        setMessage('');

        try {
            const result = await uploadPhoto(selectedFile);
            if (result.success) {
                setSelectedFile(null);
                setMessage('Foto enviada com sucesso!');
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else {
                setMessage(result.error || 'Erro ao enviar foto');
            }
        } catch (error) {
            setMessage(error.message || 'Erro ao enviar foto');
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscapeKey);
        
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [onClose]);

    const handleDelete = async () => {
        if (!window.confirm('Tem certeza que deseja remover sua foto?')) return;

        setIsUploading(true);

        try {
            const result = await deletePhoto();
            if (result.success) {
                setMessage('Foto removida com sucesso!');
                setPreviewUrl('/default.png');
            } else {
                setMessage(result.error || 'Erro ao remover foto');
            }
        } catch (error) {
            setMessage(error.message || 'Erro ao remover foto');
        } finally {
            setIsUploading(false);
        }
    };

    const clearSelection = () => {
        setSelectedFile(null);
        setPreviewUrl(user?.photoUrl ? getFullPhotoUrl(user.photoUrl) : '/default.png');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setMessage('');
    };

    return (
        <div className={styles.overlay}>
            <div ref={containerRef} className={styles.container}>
                <h1>Minha conta</h1>
                <h2>Nome: {user?.name}</h2>

                <div className={styles.photoSection}>
                    <h2>Foto do perfil</h2>
                    <div className={styles.previewContainer}>
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className={previewUrl && previewUrl !== '/default.png' ? styles.hasImg : styles.noImg}
                            onError={(e) => {
                                e.target.src = '/default.png';
                            }}
                        />
                    </div>

                    {message && <div className={styles.message}>{message}</div>}

                    <div className={styles.controls}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            disabled={isUploading}
                        />

                        {selectedFile && (
                            <div className={styles.uploadControls}>
                                <button
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                    className={styles.uploadBtn}
                                >
                                    {isUploading ? 'Enviando...' : 'Confirmar Upload'}
                                </button>
                                <button
                                    onClick={clearSelection}
                                    disabled={isUploading}
                                    className={styles.cancelBtn}
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}

                        {(!selectedFile && user?.photoUrl) && (
                            <button
                                onClick={handleDelete}
                                disabled={isUploading}
                                className={styles.deleteBtn}
                            >
                                Remover Foto
                            </button>
                        )}
                    </div>

                    <div className={styles.info}>
                        <p>A imagem será cortada para 300x300 pixels (formato quadrado)</p>
                    </div>
                </div>

                <button className={styles.fechar} onClick={onClose}>Fechar</button>
            </div>
        </div>
    );
}