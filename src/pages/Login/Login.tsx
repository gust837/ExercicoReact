import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Auth";
import logoEvent from "../../assets/logo1.svg";
import { useEffect, useState, type FormEvent } from "react";

import Botao from "../../components/Botao/Botao";

import "./Login.css";
import Campo from "../../components/Campo/Campo";
import { getApiErrorMessage } from "../../services/api";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, autenticado } = useAuth();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        if (autenticado) navigate("/home", { replace: true });
    }, [autenticado, navigate]);

    async function entrar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErro("");
        setEnviando(true);
        try {
            await login({ email: email.trim(), senha });
            const state = location.state as { from?: string } | null;
            navigate(state?.from || "/home", { replace: true });
        } catch (error) {
            setErro(getApiErrorMessage(error));
        } finally {
            setEnviando(false);
        }
    }

    return (
        <main className="login-pagina">
            <Link to="/home" aria-label="Voltar para a página inicial">
                <img src={logoEvent} alt="Logo Event+" className="login-logo" />
            </Link>
            <form className="login-form" onSubmit={entrar} noValidate>
                <div className="login-cabecalho">
                    <h1>Entrar</h1>
                    <p>Acesse sua conta para gerenciar inscrições e eventos</p>
                </div>

                <div>
                    <label htmlFor="login-email">Email</label>
                    <Campo
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Login"
                        autoComplete="email"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="login-senha">Senha</label>
                    <Campo
                        id="login-senha"
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

                {erro ? (
                    <p className="login-erro" role="alert">
                        {erro}
                    </p>
                ) : null}

                <div className="login-rodape">
                    <p>
                        Ainda não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
                    </p>
                    <Link to="/home" className="login-voltar-home">
                        ← Voltar para a Home
                    </Link>
                </div>
            </form>
        </main>
    );
}

export default Login;
