import type { Evento } from "../../types/api";
import { formatarDataCurta } from "../../utils/formatarData";
import "../ListaUsuarios/ListaUsuarios.css";

import lapis from "../../assets/icons/lapis.svg";
import lixeira from "../../assets/icons/lixeira.svg";

interface ListaEventosAdminProps {
    eventos: Evento[];
    idEmEdicao: string | null;
    carregando?: boolean;
    onEditar: (evento: Evento) => void;
    onExcluir: (evento: Evento) => void;
}

function ListaEventosAdmin({
    eventos,
    idEmEdicao,
    carregando,
    onEditar,
    onExcluir,
}: ListaEventosAdminProps) {
    return (
        <section className="lista-tipos lista-usuarios">
            <div className="lista-tipos-conteudo">
                <h2>Eventos cadastrados</h2>
                <hr className="lista-tipos-divisor" />
                <div className="lista-tipos-tabela-wrapper">
                    <table className="lista-usuarios-tabela">
                        <thead>
                            <tr>
                                <th>Evento</th>
                                <th>Data</th>
                                <th>Categoria</th>
                                <th>Instituição</th>
                                <th>Editar</th>
                                <th>Excluir</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carregando ? (
                                <tr>
                                    <td colSpan={6} className="lista-tipos-tabela-vazia">
                                        Carregando...
                                    </td>
                                </tr>
                            ) : null}
                            {!carregando && eventos.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="lista-tipos-tabela-vazia">
                                        Nenhum evento cadastrado
                                    </td>
                                </tr>
                            ) : null}
                            {!carregando &&
                                eventos.map((evento) => (
                                    <tr
                                        className={idEmEdicao === evento.idEvento ? "lista-tipos-linha-ativa" : ""}
                                        key={evento.idEvento}
                                    >
                                        <td>{evento.nomeEvento}</td>
                                        <td>{formatarDataCurta(evento.dataEvento)}</td>
                                        <td>{evento.idTipoEventoNavigation?.titulo || "Não informada"}</td>
                                        <td>{evento.idInstituicaoNavigation?.nomeFantasia || "Não informada"}</td>
                                        <td className="coluna-acao">
                                            <button
                                                className="lista-tipos-acao"
                                                type="button"
                                                aria-label={`Editar ${evento.nomeEvento}`}
                                                onClick={() => onEditar(evento)}
                                            >
                                                <img src={lapis} alt="Ícone de editar" />
                                            </button>
                                        </td>
                                        <td className="coluna-acao">
                                            <button
                                                className="lista-tipos-acao"
                                                type="button"
                                                aria-label={`Excluir ${evento.nomeEvento}`}
                                                onClick={() => onExcluir(evento)}
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

export default ListaEventosAdmin;
