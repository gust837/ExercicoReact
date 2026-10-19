import { Link, NavLink, useNavigate } from "react-router-dom";
import { perfilEhAdministrador, perfilEhOrgamizador, useAuth } from "../../context/Auth";

import LogoEvent from "../../assets/logo1.svg";
import "./Header.css"

function Header() {
    const { autenticado, usuario, perfil, logout } = useAuth();

    const navigate = useNavigate();
    const administrador = perfilEhAdministrador(perfil);
    const organizador = perfilEhOrgamizador(perfil);

    function sair() {
        logout();
        navigate("/Login");
    }

    return (
        <header className="header">
            <div className='header-conteudo'>
                <Link to={"/home"}>
                    <img src={LogoEvent} alt="Logo Event+" />
                </Link>

                <nav>
                    <NavLink to="/home">Home</NavLink>
                    <NavLink to="/eventos">Eventos</NavLink>
                   { administrador && <NavLink to="/usuarios">Usuarios</NavLink>}
                    <NavLink to="/home#contato">Contato</NavLink>
                </nav>

                {autenticado ?
                <>
                    <Link to="/Conta">Minha conta</Link>
                    <Link onClick={sair} to="/Login">Sair</Link>
                </>
                :
                    <Link to="/Login">Entrar</Link>
                }
            </div>
        </header>
    )
}

export default Header;