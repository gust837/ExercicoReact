import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Auth";
import logoEvent from "../../assets/logo1.svg";
import { useEffect, useState, type FormEvent } from "react";

import Botao from "../../components/Botao/Botao";

import "./Login.css"
import Campo from "../../components/Campo/Campo";
import { getApiErrorMessage } from "../../services/api";

function Login() {

    const navigate = useNavigate();
    const location = useLocation();
    const { login, autenticado } = useAuth();
    const [email, setEmail] = useState("teste@email.com");
    const [senha, setSenha] = useState("Senai@134");
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        if (autenticado) navigate("/home", { replace: true })
    }, [autenticado, navigate]);

    async function entrar(event:FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErro("");
        setEnviando(true);
        try{
            await login({email: email.trim(), senha})
            const state = location.state as {from?: string} | null
            navigate(state?.from || "/home", {replace: true})
        } catch(error){
            setErro(getApiErrorMessage(error));
        }finally{
            setEnviando(false);
        }
    }

    return (
        <main className="login-pagina">
            <img src={logoEvent} alt="Logo eventPlus" className="login-logo"/>
            <form className="login-form" onSubmit={entrar} noValidate>

                <div>
                    <label htmlFor="login-email">Email</label>
                    <Campo id="login-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Login"
                        autoComplete="email"
                        required />
                </div>

                <div>
                    <label htmlFor="login-senha">Senha</label>
                    <Campo id="login-senha"
                        type="password"
                        value={senha}
                        onChange={(event) => setSenha(event.target.value)}
                        placeholder="Senha"
                        autoComplete="current-password"
                        minLength={8}
                        required
                    />
                </div>
                <Botao texto={enviando ? "Entrando..." : "Entrar"} type="submit" disabled={enviando} />

                {erro ? <p className="login-erro" role="alert" >{erro}</p> : null}
            </form>
        </main>
    )
}

export default Login;