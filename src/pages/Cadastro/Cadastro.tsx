import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Auth";
import logoEvent from "../../assets/logo1.svg";
import Botao from "../../components/Botao/Botao";
import Campo from "../../components/Campo/Campo";
import { getApiErrorMessage } from "../../services/api";
import { tipoUsuarioService, usuarioService } from "../../services/eventPlusService";
import { validarEmailReal } from "../../utils/validarEmail";
import "../Login/Login.css";

function Cadastro() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    async function cadastrarConta(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErro("");

        const nomeLimpo = nome.trim();
        const emailLimpo = email.trim();

        if (!nomeLimpo || !emailLimpo) {
            setErro("Preencha seu nome e e-mail.");
            return;
        }

        if (senha.length < 8) {
            setErro("A senha deve ter pelo menos 8 caracteres.");
            return;
        }

        if (senha !== confirmarSenha) {
            setErro("As senhas digitadas não coincidem.");
            return;
        }

        setEnviando(true);
        try {
            const erroEmail = await validarEmailReal(emailLimpo);
            if (erroEmail) {
                setErro(erroEmail);
                return;
            }

            // Busca os tipos de usuário disponíveis e vincula automaticamente ao perfil Participante
            const tipos = await tipoUsuarioService.listar();
            const tipoParticipante =
                tipos.find((t) => {
                    const titulo = t.titulo.trim().toLowerCase();
                    return titulo === "participante" || titulo === "comum" || titulo === "aluno";
                }) ||
                tipos.find((t) => {
                    const titulo = t.titulo.trim().toLowerCase();
                    return titulo !== "administrador" && titulo !== "admin" && titulo !== "organizador";
                }) ||
                null;

            await usuarioService.cadastrar({
                nome: nomeLimpo,
                email: emailLimpo,
                senha,
                idTipoUsuario: tipoParticipante?.idTipoUsuario || null,
            });

            // Autentica o novo usuário automaticamente e redireciona para a Home
            await login({ email: emailLimpo, senha });
            navigate("/home", { replace: true });
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

            <form className="login-form" onSubmit={cadastrarConta} noValidate>
                <div className="login-cabecalho">
                    <h1>Criar conta</h1>
                    <p>Cadastre-se para participar e se inscrever nos eventos</p>
                </div>

                <div>
                    <label htmlFor="cadastro-nome">Nome completo</label>
                    <Campo
                        id="cadastro-nome"
                        type="text"
                        value={nome}
                        onChange={(event) => setNome(event.target.value)}
                        placeholder="Seu nome completo"
                        autoComplete="name"
                        maxLength={100}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="cadastro-email">Email</label>
                    <Campo
                        id="cadastro-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="seu@email.com"
                        autoComplete="email"
                        maxLength={100}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="cadastro-senha">Senha</label>
                    <Campo
                        id="cadastro-senha"
                        type="password"
                        value={senha}
                        onChange={(event) => setSenha(event.target.value)}
                        placeholder="Mínimo de 8 caracteres"
                        autoComplete="new-password"
                        minLength={8}
                        maxLength={60}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="cadastro-confirmar-senha">Confirmar senha</label>
                    <Campo
                        id="cadastro-confirmar-senha"
                        type="password"
                        value={confirmarSenha}
                        onChange={(event) => setConfirmarSenha(event.target.value)}
                        placeholder="Repita sua senha"
                        autoComplete="new-password"
                        minLength={8}
                        maxLength={60}
                        required
                    />
                </div>

                <Botao
                    texto={enviando ? "Criando conta..." : "Cadastrar"}
                    type="submit"
                    disabled={enviando}
                />

                {erro ? (
                    <p className="login-erro" role="alert">
                        {erro}
                    </p>
                ) : null}

                <div className="login-rodape">
                    <p>
                        Já possui uma conta? <Link to="/login">Entrar</Link>
                    </p>
                    <Link to="/home" className="login-voltar-home">
                        ← Voltar para a Home
                    </Link>
                </div>
            </form>
        </main>
    );
}

export default Cadastro;
