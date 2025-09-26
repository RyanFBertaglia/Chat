import styles from '../styles/account.module.css';
import { useAuth } from '../services/authService';
import React, { useState } from "react";


export default function MyAccount() {
    const {user} = useAuth();
    const [file, setFile] = useState();
    const [hasImg, setHasImg] = useState();

    function handleChange(e) {
        setHasImg(true);
        setFile(URL.createObjectURL(e.target.files[0]));
    }
    function removeImg(e) {
        setHasImg(false)
        setFile(null);
    }


    return( <div className={styles.container}>
    <h1>Minha conta</h1>
    <h2>Nome: {user.name}</h2>
    <h2>Definir foto:</h2>
    <input type="file" onChange={handleChange} />
    <button onClick={removeImg}>X</button>
    <img src={file} className={hasImg ? styles.hasImg : ""}/>

    <button className={styles.fechar}>Fechar</button>
    <button className={styles.logout}>Logout</button>
    </div>);
}

/*
    - Pegar id do context
    - Buscar foto por id
    - Opção set photo independente
    - Preview com corte que será realizado
*/