import { useMemo, useState } from "react";
import { normalizarTexto } from "../../utils/validarEmail";
import "../ListaUsuarios/ListaUsuarios.css";

import lapis from "../../assets/icons/lapis.svg";
import lixeira from "../../assets/icons/lixeira.svg";

export interface ItemTipoAdmin {
    id: string;
    titulo: string;
}

interface ListaTiposAdminProps {
    tituloSecao: string;
    colunaTitulo: string;
    mensagemVazia: string;
    itens: ItemTipoAdmin[];
    idEmEdicao: string | null;
    carregando?: boolean;
    onEditar: (item: ItemTipoAdmin) => void;
    onExcluir: (item: ItemTipoAdmin) => void;
}

function ListaTiposAdmin({
    tituloSecao,
    colunaTitulo,
    mensagemVazia,
    itens,
    idEmEdicao,
    carregando,
    onEditar,
    onExcluir,
}: ListaTiposAdminProps) {
    const [busca, setBusca] = useState("");

    const itensFiltrados = useMemo(() => {
        const termo = normalizarTexto(busca);
        if (!termo) return itens;
        return itens.filter((item) => normalizarTexto(item.titulo).includes(termo));
    }, [itens, busca]);

    return (
        <section className="lista-tipos lista-usuarios">
            <div className="lista-tipos-conteudo">
                <h2>{tituloSecao}</h2>
                <hr className="lista-tipos-divisor" />

                <div className="lista-filtro-barra">
                    <input
                        type="search"
                        className="lista-filtro-input"
                        placeholder={`Filtrar por ${colunaTitulo.toLowerCase()}...`}
                        aria-label={`Filtrar ${tituloSecao}`}
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>

                <div className="lista-tipos-tabela-wrapper">
                    <table className="lista-usuarios-tabela">
                        <thead>
                            <tr>
                                <th>{colunaTitulo}</th>
                                <th>Editar</th>
                                <th>Excluir</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carregando ? (
                                <tr>
                                    <td colSpan={3} className="lista-tipos-tabela-vazia">
                                        Carregando...
                                    </td>
                                </tr>
                            ) : null}
                            {!carregando && itensFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="lista-tipos-tabela-vazia">
                                        {busca.trim()
                                            ? "Nenhum item encontrado para este filtro"
                                            : mensagemVazia}
                                    </td>
                                </tr>
                            ) : null}
                            {!carregando &&
                                itensFiltrados.map((item) => (
                                    <tr
                                        className={idEmEdicao === item.id ? "lista-tipos-linha-ativa" : ""}
                                        key={item.id}
                                    >
                                        <td>{item.titulo}</td>
                                        <td>
                                            <button
                                                className="lista-tipos-acao"
                                                type="button"
                                                aria-label={`Editar ${item.titulo}`}
                                                onClick={() => onEditar(item)}
                                            >
                                                <img src={lapis} alt="Ícone de editar" />
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="lista-tipos-acao"
                                                type="button"
                                                aria-label={`Excluir ${item.titulo}`}
                                                onClick={() => onExcluir(item)}
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

export default ListaTiposAdmin;
