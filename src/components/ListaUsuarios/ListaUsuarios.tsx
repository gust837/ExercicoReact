import { useMemo, useState } from "react";
import type { Usuario } from "../../types/api";
import { formatarNomePerfil } from "../../context/Auth";
import { normalizarTexto } from "../../utils/validarEmail";
import "./ListaUsuarios.css";

import lapis from "../../assets/icons/lapis.svg";
import lixeira from "../../assets/icons/lixeira.svg";

interface ListaUsuariosProps {
    usuarios: Usuario[];
    idEmEdicao: string | null;
    carregando?: boolean;
    onEditar: (usuario: Usuario) => void;
    onExcluir: (usuario: Usuario) => void;
}

function ListaUsuarios({ usuarios, idEmEdicao, carregando, onEditar, onExcluir }: ListaUsuariosProps) {
    const [busca, setBusca] = useState("");

    const usuariosFiltrados = useMemo(() => {
        const termo = normalizarTexto(busca);
        if (!termo) return usuarios;
        return usuarios.filter((u) => {
            const nome = normalizarTexto(u.nome);
            const email = normalizarTexto(u.email);
            const cargo = normalizarTexto(formatarNomePerfil(u.idTipoUsuarioNavigation?.titulo));
            return nome.includes(termo) || email.includes(termo) || cargo.includes(termo);
        });
    }, [usuarios, busca]);

    return (
        <section className="lista-tipos lista-usuarios">
            <div className="lista-tipos-conteudo">
                <h2>Usuários cadastrados</h2>
                <hr className="lista-tipos-divisor" />

                <div className="lista-filtro-barra">
                    <input
                        type="search"
                        className="lista-filtro-input"
                        placeholder="Filtrar usuários por nome, e-mail ou cargo..."
                        aria-label="Filtrar usuários por nome, e-mail ou cargo"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>

                <div className="lista-tipos-tabela-wrapper">
                    <table className="lista-usuarios-tabela">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Cargo / Tipo</th>
                                <th>Editar</th>
                                <th>Excluir</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carregando ? (
                                <tr>
                                    <td colSpan={5} className="lista-tipos-tabela-vazia">
                                        Carregando...
                                    </td>
                                </tr>
                            ) : null}
                            {!carregando && usuariosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="lista-tipos-tabela-vazia">
                                        {busca.trim()
                                            ? "Nenhum usuário encontrado para este filtro"
                                            : "Nenhum usuário cadastrado"}
                                    </td>
                                </tr>
                            ) : null}
                            {!carregando &&
                                usuariosFiltrados.map((usuario) => (
                                    <tr
                                        className={idEmEdicao === usuario.idUsuario ? "lista-tipos-linha-ativa" : ""}
                                        key={usuario.idUsuario}
                                    >
                                        <td>{usuario.nome}</td>
                                        <td>{usuario.email}</td>
                                        <td>{formatarNomePerfil(usuario.idTipoUsuarioNavigation?.titulo)}</td>
                                        <td>
                                            <button
                                                className="lista-tipos-acao"
                                                type="button"
                                                aria-label={`Editar ${usuario.nome}`}
                                                onClick={() => onEditar(usuario)}
                                            >
                                                <img src={lapis} alt="Ícone de editar" />
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="lista-tipos-acao"
                                                type="button"
                                                aria-label={`Excluir ${usuario.nome}`}
                                                onClick={() => onExcluir(usuario)}
                                            >
                                                <img src={lixeira} alt="Ícone de excluir" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

export default ListaUsuarios;
