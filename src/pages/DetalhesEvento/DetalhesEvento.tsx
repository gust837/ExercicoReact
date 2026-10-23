import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { comentarioService, eventoService, presencaService } from "../../services/eventPlusService";
import type { Presenca, Evento, Comentario } from "../../types/api";
import { formatarDataCurta, formatarDataLonga } from "../../utils/formatarData";

import imagemPadrao from "../../assets/banner-1.png";
import relogio from "../../assets/icons/relogio.svg";
import predio from "../../assets/icons/predio.svg";
import filtro from "../../assets/icons/filtro.svg";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Botao from "../../components/Botao/Botao";

import "./DetalhesEvento.css";
import { useAuth } from "../../context/Auth";
import { getApiErrorMessage } from "../../services/api";

function DetalhesEvento() {
    const { id = "" } = useParams();

    const navigate = useNavigate();
    const location = useLocation();

    const { autenticado, usuario } = useAuth();
    const [evento, setEvento] = useState<Evento | null>(null);

    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [secaocomentarios, setSecaoComentarios] = useState<boolean>(false);
    const [novoComentario, setNovoComentario] = useState("");
    const [enviandoComentario, setEnviandoComentario] = useState(false);
    const [mensagemComentario, setMensagemComentario] = useState("");

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

    const [modalAnimando, setModalAnimando] = useState(false);
    const timeoutModalRef = useRef<number | undefined>(undefined);

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

    // Limpa o timer do modal ao desmontar a página
    useEffect(() => {
        return () => window.clearTimeout(timeoutModalRef.current);
    }, []);

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

    function abrirModalCancelamento() {
        window.clearTimeout(timeoutModalRef.current);
        setConfirmandoCancelamento(true);
        requestAnimationFrame(() => {
            setModalAnimando(true);
        });
    }

    const fecharModalCancelamento = useCallback(() => {
        window.clearTimeout(timeoutModalRef.current);
        setModalAnimando(false);
        timeoutModalRef.current = window.setTimeout(() => {
            setConfirmandoCancelamento(false);
        }, 300);
    }, []);

    // Fecha o modal ao pressionar a tecla Escape
    useEffect(() => {
        if (!confirmandoCancelamento) return;
        function aoPressionarTecla(e: KeyboardEvent) {
            if (e.key === "Escape" && !enviandoInscricao) {
                fecharModalCancelamento();
            }
        }
        window.addEventListener("keydown", aoPressionarTecla);
        return () => window.removeEventListener("keydown", aoPressionarTecla);
    }, [confirmandoCancelamento, enviandoInscricao, fecharModalCancelamento]);

    async function cancelarInscricao() {
        if (!presenca) return;
        setEnviandoInscricao(true);
        setMensagemInscricao("");
        try {
            await presencaService.excluir(presenca.idPresenca);
            fecharModalCancelamento();
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
                                                <textarea
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

                                        {comentarios.length === 0 ? (
                                            <p className="sem-comentarios">Ainda não há comentários para este evento.</p>
                                        ) : (
                                            <ul className="lista-comentarios">
                                                {comentarios.map((c) => (
                                                    <li key={c.idComentario} className="item-comentario">
                                                        <strong>{c.idUsuarioNavigation?.nome || "Participante"}</strong>
                                                        <span>{formatarDataCurta(c.dataComentario)}</span>
                                                        <p>{c.descricao}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
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
                                    presenca ? abrirModalCancelamento() : void inscrever()
                                }
                            />
                            {confirmandoCancelamento ? (
                                <div
                                    className={`modal-overlay ${modalAnimando ? "aberto" : "fechado"}`}
                                    onClick={() => !enviandoInscricao && fecharModalCancelamento()}
                                >
                                    <div
                                        className="modal-confirmacao"
                                        role="dialog"
                                        aria-modal="true"
                                        aria-labelledby="modal-cancelar-titulo"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="modal-icone">!</div>
                                        <h3 id="modal-cancelar-titulo">Cancelar Inscrição?</h3>
                                        <p>
                                            Tem certeza que deseja cancelar sua inscrição no evento{" "}
                                            <strong>{evento?.nomeEvento}</strong>?
                                        </p>
                                        <div className="confirmar-botoes">
                                            <Botao
                                                className="btn-confirmar-sim"
                                                texto={enviandoInscricao ? "Cancelando..." : "Sim, cancelar"}
                                                type="button"
                                                disabled={enviandoInscricao}
                                                onClick={() => void cancelarInscricao()}
                                            />
                                            <button
                                                type="button"
                                                className="btn-manter-inscricao"
                                                disabled={enviandoInscricao}
                                                onClick={fecharModalCancelamento}
                                            >
                                                Manter inscrição
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
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
