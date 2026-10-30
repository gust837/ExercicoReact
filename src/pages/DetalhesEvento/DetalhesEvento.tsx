import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { comentarioService, eventoService, presencaService } from "../../services/eventPlusService";
import type { Presenca, Evento, Comentario } from "../../types/api";
import { formatarDataCurta, formatarDataLonga } from "../../utils/formatarData";
import { normalizarTexto } from "../../utils/validarEmail";

import imagemPadrao from "../../assets/banner-1.png";
import relogio from "../../assets/icons/relogio.svg";
import predio from "../../assets/icons/predio.svg";
import filtro from "../../assets/icons/filtro.svg";
import deletar from "../../assets/icons/deletar.svg";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Botao from "../../components/Botao/Botao";
import Modal from "../../components/Modal/Modal";

import "./DetalhesEvento.css";
import { perfilEhAdministrador, useAuth } from "../../context/Auth";
import { getApiErrorMessage } from "../../services/api";

function DetalhesEvento() {
    const { id = "" } = useParams();

    const navigate = useNavigate();
    const location = useLocation();

    const { autenticado, usuario, perfil } = useAuth();
    const ehAdmin = autenticado && perfilEhAdministrador(perfil);
    const [evento, setEvento] = useState<Evento | null>(null);

    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [secaocomentarios, setSecaoComentarios] = useState<boolean>(false);
    const [novoComentario, setNovoComentario] = useState("");
    const [enviandoComentario, setEnviandoComentario] = useState(false);
    const [mensagemComentario, setMensagemComentario] = useState("");
    const [comentarioParaExcluir, setComentarioParaExcluir] = useState<Comentario | null>(null);
    const [excluindoComentario, setExcluindoComentario] = useState(false);

    // Estado único para presença vinculada à chave (usuario:evento), evitando setState síncrono no useEffect
    const [presencaInfo, setPresencaInfo] = useState<{ chave: string; presenca: Presenca | null }>({
        chave: "",
        presenca: null,
    });
    const chavePresenca = autenticado && usuario && id ? `${usuario.idUsuario}:${id}` : "";
    const presenca = presencaInfo.chave === chavePresenca ? presencaInfo.presenca : null;
    const checandoPresenca = Boolean(chavePresenca && presencaInfo.chave !== chavePresenca);

    const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false);
    const [enviandoInscricao, setEnviandoInscricao] = useState(false);
    const [mensagemInscricao, setMensagemInscricao] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");

    const carregar = useCallback(async () => {
        if (!id) return;
        setCarregando(true);
        setErro("");

        try {
            const [eventoAtual, comentariosAtuais] = await Promise.all([
                eventoService.buscar(id),
                comentarioService.listarPorEvento(id),
            ]);
            setEvento(eventoAtual);
            setComentarios(comentariosAtuais.filter((c) => c.exibe !== false));
        } catch (error) {
            setErro(getApiErrorMessage(error));
        } finally {
            setCarregando(false);
        }
    }, [id]);

    useEffect(() => {
        const timeout = window.setTimeout(() => void carregar(), 0);
        return () => window.clearTimeout(timeout);
    }, [carregar]);

    function exigirLogin() {
        if (autenticado && usuario?.idUsuario) return false;
        navigate("/login", { state: { from: location.pathname } });
        return true;
    }

    async function inscrever() {
        if (exigirLogin()) return;
        setEnviandoInscricao(true);
        setMensagemInscricao("");
        try {
            const novaPresenca = await presencaService.cadastrar({
                situacao: true,
                idEvento: evento?.idEvento || id,
                idUsuario: usuario!.idUsuario,
            });
            setPresencaInfo({ chave: chavePresenca, presenca: novaPresenca });
            setMensagemInscricao("Inscrição realizada com sucesso.");
        } catch (error) {
            setMensagemInscricao(getApiErrorMessage(error));
        } finally {
            setEnviandoInscricao(false);
        }
    }

    async function cancelarInscricao() {
        if (!presenca) return;
        setEnviandoInscricao(true);
        setMensagemInscricao("");
        try {
            await presencaService.excluir(presenca.idPresenca);
            setConfirmandoCancelamento(false);
            setPresencaInfo({ chave: chavePresenca, presenca: null });
            setMensagemInscricao("Inscrição cancelada com sucesso.");
        } catch (error) {
            setMensagemInscricao(getApiErrorMessage(error));
        } finally {
            setEnviandoInscricao(false);
        }
    }

    async function enviarComentario(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (exigirLogin()) return;

        if (!presenca) {
            setMensagemComentario("Você precisa estar inscrito neste evento para comentar.");
            return;
        }

        if (!novoComentario.trim()) {
            setMensagemComentario("Digite um comentário antes de enviar.");
            return;
        }

        const comentarioRepetido = comentarios.some(
            (c) =>
                c.idUsuario === usuario?.idUsuario &&
                normalizarTexto(c.descricao) === normalizarTexto(novoComentario)
        );
        if (comentarioRepetido) {
            setMensagemComentario("Você já publicou este mesmo comentário neste evento.");
            return;
        }

        setEnviandoComentario(true);
        setMensagemComentario("");

        try {
            await comentarioService.cadastrar({
                descricao: novoComentario.trim(),
                idEvento: evento?.idEvento || id,
                idUsuario: usuario!.idUsuario,
            });

            const comentariosAtualizados = await comentarioService.listarPorEvento(id);
            setComentarios(comentariosAtualizados.filter((c) => c.exibe !== false));
            setNovoComentario("");
            setMensagemComentario("Comentário publicado com sucesso!");
        } catch (error) {
            setMensagemComentario(getApiErrorMessage(error));
        } finally {
            setEnviandoComentario(false);
        }
    }

    async function confirmarExclusaoComentario() {
        if (!comentarioParaExcluir) return;
        setExcluindoComentario(true);
        setMensagemComentario("");

        try {
            await comentarioService.excluir(comentarioParaExcluir.idComentario);
            setComentarios((atual) =>
                atual.filter((c) => c.idComentario !== comentarioParaExcluir.idComentario)
            );
            setComentarioParaExcluir(null);
            setMensagemComentario("Comentário excluído pelo administrador.");
        } catch (error) {
            setMensagemComentario(getApiErrorMessage(error));
        } finally {
            setExcluindoComentario(false);
        }
    }

    useEffect(() => {
        if (!chavePresenca) return;
        let ativo = true;
        presencaService
            .listarMinhas()
            .then((lista) => {
                if (!ativo) return;
                const encontrada = lista.find((item) => item.idEvento === id && item.situacao) || null;
                setPresencaInfo({ chave: chavePresenca, presenca: encontrada });
            })
            .catch(() => {
                if (!ativo) return;
                setPresencaInfo({ chave: chavePresenca, presenca: null });
            });
        return () => {
            ativo = false;
        };
    }, [chavePresenca, id]);

    return (
        <>
            <Header />
            <main className="detalhes-evento-pagina">
                {carregando ? (
                    <p className="detalhes-estado">Carregando detalhes do evento...</p>
                ) : erro ? (
                    <p className="detalhes-estado erro" role="alert">{erro}</p>
                ) : (
                    <>
                        {/* Coluna da Esquerda: Banner, Título, Abas e Conteúdo */}
                        <section className="detalhes-evento-conteudo">
                            <div className="detalhes-banner-wrapper">
                                <img
                                    src={evento?.imagemUrl || imagemPadrao}
                                    alt={evento?.nomeEvento || "Banner do evento"}
                                    className="detalhes-banner"
                                />
                            </div>
                            <h1 className="detalhes-titulo">{evento?.nomeEvento}</h1>
                            <div className="detalhes-abas">
                                <button
                                    type="button"
                                    className={`aba-btn ${!secaocomentarios ? "ativa" : ""}`}
                                    onClick={() => setSecaoComentarios(false)}
                                >
                                    Sobre o Evento
                                </button>
                                <button
                                    type="button"
                                    className={`aba-btn ${secaocomentarios ? "ativa" : ""}`}
                                    onClick={() => setSecaoComentarios(true)}
                                >
                                    Comentários ({comentarios.length})
                                </button>
                            </div>
                            <div className="detalhes-aba-painel">
                                {secaocomentarios ? (
                                    <div className="detalhes-comentarios">
                                        <h2>Comentários</h2>

                                        {/* Só exibe o formulário se o usuário estiver logado e inscrito no evento */}
                                        {autenticado && presenca ? (
                                            <form className="form-comentario" onSubmit={enviarComentario}>
                                                <label
                                                    htmlFor="comentario-texto"
                                                    className="text-sm font-semibold text-text-dark"
                                                >
                                                    Seu comentário sobre o evento
                                                </label>
                                                <textarea
                                                    id="comentario-texto"
                                                    placeholder="Escreva sua avaliação ou comentário sobre o evento..."
                                                    value={novoComentario}
                                                    onChange={(e) => setNovoComentario(e.target.value)}
                                                    rows={3}
                                                    disabled={enviandoComentario}
                                                />
                                                <div className="form-comentario-acoes">
                                                    <Botao
                                                        texto={enviandoComentario ? "Enviando..." : "Publicar comentário"}
                                                        type="submit"
                                                        disabled={enviandoComentario}
                                                    />
                                                </div>
                                                {mensagemComentario ? (
                                                    <p className="detalhe-evento-mensagem">{mensagemComentario}</p>
                                                ) : null}
                                            </form>
                                        ) : (
                                            <p className="aviso-inscricao-comentario">
                                                Apenas participantes inscritos neste evento podem publicar comentários.
                                            </p>
                                        )}

                                        { !autenticado || !presenca ? (
                                            mensagemComentario ? (
                                                <p className="detalhe-evento-mensagem mb-4" role="status">
                                                    {mensagemComentario}
                                                </p>
                                            ) : null
                                        ) : null}

                                        {comentarios.length === 0 ? (
                                            <p className="sem-comentarios">Ainda não há comentários para este evento.</p>
                                        ) : (
                                            <ul className="lista-comentarios">
                                                {comentarios.map((c) => (
                                                    <li key={c.idComentario} className="item-comentario">
                                                        <div className="item-comentario-topo">
                                                            <div className="item-comentario-autor">
                                                                <strong>
                                                                    {c.idUsuarioNavigation?.nome || "Participante"}
                                                                </strong>
                                                                <span>{formatarDataCurta(c.dataComentario)}</span>
                                                            </div>
                                                            {ehAdmin && (
                                                                <button
                                                                    type="button"
                                                                    className="btn-excluir-comentario"
                                                                    onClick={() => setComentarioParaExcluir(c)}
                                                                    title="Excluir comentário (Administrador)"
                                                                    aria-label={`Excluir comentário de ${c.idUsuarioNavigation?.nome || "Participante"}`}
                                                                >
                                                                    <img src={deletar} alt="" />
                                                                    <span>Excluir</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p>{c.descricao}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        <Modal
                                            aberto={Boolean(comentarioParaExcluir)}
                                            titulo="Excluir Comentário?"
                                            textoConfirmar="Sim, excluir"
                                            textoCancelar="Cancelar"
                                            carregando={excluindoComentario}
                                            aoConfirmar={() => void confirmarExclusaoComentario()}
                                            aoFechar={() => setComentarioParaExcluir(null)}
                                        >
                                            <p>
                                                Tem certeza que deseja excluir o comentário de{" "}
                                                <strong>
                                                    {comentarioParaExcluir?.idUsuarioNavigation?.nome || "Participante"}
                                                </strong>
                                                ?
                                            </p>
                                            {comentarioParaExcluir?.descricao ? (
                                                <p className="mt-2 italic text-text-gray">
                                                    "{comentarioParaExcluir.descricao}"
                                                </p>
                                            ) : null}
                                        </Modal>
                                    </div>
                                ) : (
                                    <p className="detalhes-descricao">{evento?.descricao}</p>
                                )}
                            </div>
                        </section>

                        {/* Coluna da Direita: Card de Informações Principais e Inscrição */}
                        <aside className="detalhes-evento-card-info">
                            <h2>Informações principais</h2>
                            <hr />
                            <div className="info-item">
                                <img src={relogio} alt="Data" />
                                <span>
                                    {evento?.dataEvento
                                        ? formatarDataLonga(evento.dataEvento)
                                        : "Data não informada"}
                                </span>
                            </div>
                            <div className="info-item">
                                <img src={predio} alt="Instituição" />
                                <span>{evento?.idInstituicaoNavigation?.nomeFantasia || "Instituição não informada"}</span>
                            </div>
                            <div className="info-item">
                                <img src={filtro} alt="Categoria" />
                                <span>{evento?.idTipoEventoNavigation?.titulo || "Categoria não informada"}</span>
                            </div>
                            <Botao
                                className={presenca ? "detalhes-evento-cancelar" : "detalhes-evento-inscrever"}
                                texto={
                                    checandoPresenca
                                        ? "Verificando inscrição..."
                                        : enviandoInscricao
                                            ? "Processando..."
                                            : presenca
                                                ? "Cancelar inscrição"
                                                : "Se inscrever"
                                }
                                type="button"
                                disabled={checandoPresenca || enviandoInscricao}
                                onClick={() =>
                                    presenca ? setConfirmandoCancelamento(true) : void inscrever()
                                }
                            />

                            <Modal
                                aberto={confirmandoCancelamento}
                                titulo="Cancelar Inscrição?"
                                textoConfirmar="Sim, cancelar"
                                textoCancelar="Manter inscrição"
                                carregando={enviandoInscricao}
                                aoConfirmar={() => void cancelarInscricao()}
                                aoFechar={() => setConfirmandoCancelamento(false)}
                            >
                                <p>
                                    Tem certeza que deseja cancelar sua inscrição no evento{" "}
                                    <strong>{evento?.nomeEvento}</strong>?
                                </p>
                            </Modal>

                            {mensagemInscricao ? (
                                <p className="detalhe-evento-mensagem" role="status">
                                    {mensagemInscricao}
                                </p>
                            ) : null}
                        </aside>
                    </>
                )}
            </main>
            <Footer />
        </>
    );
}

export default DetalhesEvento;
