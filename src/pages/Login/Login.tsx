import { replace, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Auth";
import logoEvent from "../../assets/logo1.svg";
import { useEffect, useState } from "react";

import Botao from "../../components/Botao/Botao";

import "./Login.css"

function Login() {

    const navigate = useNavigate();
    const location = useLocation();
    const {login, autenticado} = useAuth();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        if(autenticado) navigate("/home", {replace :true})
    }, [autenticado, navigate])

    return (
        <main>
            <img src={logoEvent} alt="Logo eventPlus" />

            <div className="div">
                <label htmlFor="">Email</label>
                <input type="email" name="email" id="email" value={email} placeholder="Digite seu email..." onChange={(event) => setEmail(event.target.value)}/>
            </div>
                
                <div className="">
                    <label htmlFor="">Senha</label>
                    <input type="password" name="senha" id="senha" placeholder="Digite sua senha..." />
                </div>
                <Botao texto={enviando? "Entrando..." : "Entrar"} type="submit" disabled={enviando} /> 
        </main>
    )
}

export default Login;