import { Link, NavLink, useNavigate } from "react-router-dom";
import { perfilEhAdministrador, useAuth } from "../../context/Auth";

import LogoEvent from "../../assets/logo1.svg";
import "./Header.css";

function Header() {
    const { autenticado, perfil, logout } = useAuth();

    const navigate = useNavigate();
    const administrador = perfilEhAdministrador(perfil);

    function sair() {
        logout();
        navigate("/login");
    }

    return (
        <header className="header">
            <div className="header-conteudo">
                <Link to="/home">
                    <img src={LogoEvent} alt="Logo Event+" />
                </Link>

                <nav>
                    <NavLink to="/home">Home</NavLink>
                    <NavLink to="/eventos">Eventos</NavLink>
                    {administrador && <NavLink to="/usuarios">Administração</NavLink>}
                    <NavLink to="/home#contato">Contato</NavLink>
                </nav>

                <div className="header-acoes">
                    {autenticado ? (
                        <>
                            <Link to="/Conta">Minha conta</Link>
                            <button type="button" onClick={sair}>Sair</button>
                        </>
                    ) : (
                        <Link to="/login">Entrar</Link>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
