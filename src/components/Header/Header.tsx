import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { perfilEhAdministrador, perfilEhOrganizador, useAuth } from "../../context/Auth";

import LogoEvent from "../../assets/logo1.svg";
import "./Header.css";

function Header() {
    const { autenticado, perfil, usuario, logout } = useAuth();
    const [menuAberto, setMenuAberto] = useState(false);

    const navigate = useNavigate();
    const administrador = perfilEhAdministrador(perfil);
    const organizador = perfilEhOrganizador(perfil);

    function fecharMenu() {
        setMenuAberto(false);
    }

    function sair() {
        fecharMenu();
        logout();
        navigate("/login");
    }

    return (
        <header className="header">
            <div className="header-conteudo">
                <div className="header-topo-mobile">
                    <Link to="/home" onClick={fecharMenu}>
                        <img src={LogoEvent} alt="Logo Event+" />
                    </Link>

                    <button
                        type="button"
                        className="header-menu-btn"
                        aria-label={menuAberto ? "Fechar menu de navegação" : "Abrir menu de navegação"}
                        aria-expanded={menuAberto}
                        onClick={() => setMenuAberto((prev) => !prev)}
                    >
                        {menuAberto ? "✕" : "☰"}
                    </button>
                </div>

                <div className={`header-navegacao ${menuAberto ? "aberto" : ""}`}>
                    <nav>
                        <NavLink to="/home" onClick={fecharMenu}>Home</NavLink>
                        <NavLink to="/eventos" onClick={fecharMenu}>Eventos</NavLink>
                        {organizador && (
                            <NavLink to="/usuarios" onClick={fecharMenu}>
                                {administrador ? "Administração" : "Gerenciar Eventos"}
                            </NavLink>
                        )}
                        <NavLink to="/home#contato" onClick={fecharMenu}>Contato</NavLink>
                    </nav>

                    <div className="header-acoes">
                        {autenticado ? (
                            <>
                                <span className="header-usuario-info">
                                    {usuario?.nome?.split(" ")[0] || "Usuário"}
                                    <small className="header-usuario-badge">
                                        {usuario?.idTipoUsuarioNavigation?.titulo || "Participante"}
                                    </small>
                                </span>
                                <button type="button" onClick={sair}>Sair</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={fecharMenu}>Entrar</Link>
                                <Link to="/cadastro" className="header-btn-cadastro" onClick={fecharMenu}>
                                    Cadastrar
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
