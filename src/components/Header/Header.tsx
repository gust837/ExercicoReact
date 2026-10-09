import { Link, NavLink } from "react-router-dom";

import LogoEvent from "../../assets/logo1.svg";
import "./Header.css"

function Header() {
    return (
        <header className="header">
            <div className='header-conteudo'>
                <Link to={"/home"}>
                    <img src={LogoEvent} alt="Logo Event+" />
                </Link>

                <nav>
                    <NavLink to="/home">Home</NavLink>
                    <NavLink to="/eventos">Eventos</NavLink>
                    <NavLink to="/usuarios">Usuarios</NavLink>
                    <NavLink to="/home#contato">Contato</NavLink>
                </nav>

                <Link to="/Login">Entrar</Link>
            </div>
        </header>
    )
}

export default Header;