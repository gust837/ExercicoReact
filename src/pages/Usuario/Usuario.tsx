import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./Usuario.css";
import type { Evento, Instituicao, TipoEvento, TipoUsuario, Usuario } from "../../types/api";
import Campo from "../../components/Campo/Campo";
import Botao from "../../components/Botao/Botao";
import {
    eventoService,
    instituicaoService,
    tipoEventoService,
    tipoUsuarioService,
    usuarioService,
} from "../../services/eventPlusService";
import { getApiErrorMessage } from "../../services/api";
import Modal from "../../components/Modal/Modal";
import ListaUsuarios from "../../components/ListaUsuarios/ListaUsuarios";
import ListaEventosAdmin from "../../components/ListaEventosAdmin/ListaEventosAdmin";
import ListaTiposAdmin, { type ItemTipoAdmin } from "../../components/ListaTiposAdmin/ListaTiposAdmin";
import UsuarioImg from "../../assets/AdmUsuario.svg";
import EventoImg from "../../assets/AdmEvento.svg";
import TipoEventoImg from "../../assets/tipoEventoImg.png";
import TipoUsuarioImg from "../../assets/tipoUsuarioImg.png";

type AbaAdmin = "usuarios" | "eventos" | "tiposEvento" | "tiposUsuario";

interface FormularioUsuario {
    nome: string;
    email: string;
    senha: string;
    idTipoUsuario: string;
}

interface FormularioEvento {
    nomeEvento: string;
    dataEvento: string;
    descricao: string;
    idTipoEvento: string;
    idInstituicao: string;
}

const inicialUsuario: FormularioUsuario = {
    nome: "",
    email: "",
    idTipoUsuario: "",
    senha: "",
};

const inicialEvento: FormularioEvento = {
    nomeEvento: "",
    dataEvento: "",
    descricao: "",
    idTipoEvento: "",
    idInstituicao: "",
};

function paraDataInput(valor: string) {
    if (!valor) return "";
    return valor.slice(0, 10);
}

function Usuarios() {
    const [abaAtiva, setAbaAtiva] = useState<AbaAdmin>("usuarios");

    // ==================== ESTADO DE USUÁRIOS ====================
    const [formulario, setFormulario] = useState(inicialUsuario);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [tipos, setTipos] = useState<TipoUsuario[]>([]);
    const [idEmEdicao, setIdEmEdicao] = useState<string | null>(null);
    const [selecionado, setSelecionado] = useState<Usuario | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [mensagem, setMensagem] = useState("");

    // ==================== ESTADO DE EVENTOS ====================
    const [formEvento, setFormEvento] = useState(inicialEvento);
    const [arquivoImagem, setArquivoImagem] = useState<File | null>(null);
    const inputArquivoRef = useRef<HTMLInputElement | null>(null);
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
    const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
    const [idEventoEmEdicao, setIdEventoEmEdicao] = useState<string | null>(null);
    const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(null);
    const [carregandoEventos, setCarregandoEventos] = useState(true);
    const [enviandoEvento, setEnviandoEvento] = useState(false);
    const [mensagemEvento, setMensagemEvento] = useState("");

    // ==================== ESTADO DE TIPOS DE EVENTO ====================
    const [tituloTipoEvento, setTituloTipoEvento] = useState("");
    const [idTipoEventoEmEdicao, setIdTipoEventoEmEdicao] = useState<string | null>(null);
    const [tipoEventoSelecionado, setTipoEventoSelecionado] = useState<ItemTipoAdmin | null>(null);
    const [enviandoTipoEvento, setEnviandoTipoEvento] = useState(false);
    const [mensagemTipoEvento, setMensagemTipoEvento] = useState("");

    // ==================== ESTADO DE TIPOS DE USUÁRIO ====================
    const [tituloTipoUsuario, setTituloTipoUsuario] = useState("");
    const [idTipoUsuarioEmEdicao, setIdTipoUsuarioEmEdicao] = useState<string | null>(null);
    const [tipoUsuarioSelecionado, setTipoUsuarioSelecionado] = useState<ItemTipoAdmin | null>(null);
    const [enviandoTipoUsuario, setEnviandoTipoUsuario] = useState(false);
    const [mensagemTipoUsuario, setMensagemTipoUsuario] = useState("");

    const carregarUsuarios = useCallback(async () => {
        setCarregando(true);
        try {
            const [usuariosApi, tiposApi] = await Promise.all([
                usuarioService.listar(),
                tipoUsuarioService.listar(),
            ]);
            setUsuarios(usuariosApi);
            setTipos(tiposApi);
            setFormulario((value) => ({
                ...value,
                idTipoUsuario: value.idTipoUsuario || tiposApi[0]?.idTipoUsuario || "",
            }));
        } catch (error) {
            setMensagem(getApiErrorMessage(error));
        } finally {
            setCarregando(false);
        }
    }, []);

    const carregarEventos = useCallback(async () => {
        setCarregandoEventos(true);
        try {
            const [eventosApi, tiposEventoApi, instituicoesApi] = await Promise.all([
                eventoService.listar(),
                tipoEventoService.listar(),
                instituicaoService.listar(),
            ]);
            setEventos(eventosApi);
            setTiposEvento(tiposEventoApi);
            setInstituicoes(instituicoesApi);
            setFormEvento((value) => ({
                ...value,
                idTipoEvento: value.idTipoEvento || tiposEventoApi[0]?.idTipoEvento || "",
                idInstituicao: value.idInstituicao || instituicoesApi[0]?.idInstituicao || "",
            }));
        } catch (error) {
            setMensagemEvento(getApiErrorMessage(error));
        } finally {
            setCarregandoEventos(false);
        }
    }, []);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            void carregarUsuarios();
            void carregarEventos();
        }, 0);
        return () => window.clearTimeout(timeout);
    }, [carregarUsuarios, carregarEventos]);

    // ==================== FUNÇÕES DE USUÁRIOS ====================
    function atualizar(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setFormulario((value) => ({ ...value, [event.target.name]: event.target.value }));
    }

    function limpar() {
        setFormulario({ ...inicialUsuario, idTipoUsuario: tipos[0]?.idTipoUsuario || "" });
        setIdEmEdicao(null);
        setMensagem("");
    }

    async function salvar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setEnviando(true);
        setMensagem("");
        try {
            const payload = {
                nome: formulario.nome.trim(),
                email: formulario.email.trim(),
                senha: formulario.senha.trim() || undefined,
                idTipoUsuario: formulario.idTipoUsuario || null,
            };

            const editando = Boolean(idEmEdicao);
            if (idEmEdicao) await usuarioService.atualizar(idEmEdicao, payload);
            else await usuarioService.cadastrar(payload);
            limpar();
            await carregarUsuarios();
            setMensagem(editando ? "Usuário atualizado com sucesso!" : "Usuário cadastrado com sucesso!");
        } catch (error) {
            setMensagem(getApiErrorMessage(error));
        } finally {
            setEnviando(false);
        }
    }

    function editar(usuario: Usuario) {
        setIdEmEdicao(usuario.idUsuario);
        setFormulario({
            nome: usuario.nome,
            email: usuario.email,
            idTipoUsuario: usuario.idTipoUsuario || "",
            senha: "",
        });
        setMensagem("Editando usuário. Deixe a senha em branco caso não queira alterá-la.");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function excluir() {
        if (!selecionado) return;
        setEnviando(true);
        try {
            await usuarioService.excluir(selecionado.idUsuario);
            if (idEmEdicao === selecionado.idUsuario) limpar();
            setSelecionado(null);
            await carregarUsuarios();
        } catch (error) {
            setMensagem(getApiErrorMessage(error));
            setSelecionado(null);
        } finally {
            setEnviando(false);
        }
    }

    // ==================== FUNÇÕES DE EVENTOS ====================
    function atualizarEvento(
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) {
        setFormEvento((value) => ({ ...value, [event.target.name]: event.target.value }));
    }

    function limparEvento() {
        setFormEvento({
            ...inicialEvento,
            idTipoEvento: tiposEvento[0]?.idTipoEvento || "",
            idInstituicao: instituicoes[0]?.idInstituicao || "",
        });
        setArquivoImagem(null);
        if (inputArquivoRef.current) inputArquivoRef.current.value = "";
        setIdEventoEmEdicao(null);
        setMensagemEvento("");
    }

    async function salvarEvento(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setEnviandoEvento(true);
        setMensagemEvento("");
        try {
            const payload = {
                nomeEvento: formEvento.nomeEvento.trim(),
                descricao: formEvento.descricao.trim(),
                dataEvento: formEvento.dataEvento,
                idTipoEvento: formEvento.idTipoEvento,
                idInstituicao: formEvento.idInstituicao,
                arquivoImagem,
            };

            const editando = Boolean(idEventoEmEdicao);
            if (idEventoEmEdicao) {
                await eventoService.atualizar(idEventoEmEdicao, payload);
            } else {
                await eventoService.cadastrar(payload);
            }

            limparEvento();
            await carregarEventos();
            setMensagemEvento(
                editando ? "Evento atualizado com sucesso!" : "Evento cadastrado com sucesso!"
            );
        } catch (error) {
            setMensagemEvento(getApiErrorMessage(error));
        } finally {
            setEnviandoEvento(false);
        }
    }

    function editarEvento(evento: Evento) {
        setIdEventoEmEdicao(evento.idEvento);
        setFormEvento({
            nomeEvento: evento.nomeEvento,
            dataEvento: paraDataInput(evento.dataEvento),
            descricao: evento.descricao,
            idTipoEvento: evento.idTipoEvento || tiposEvento[0]?.idTipoEvento || "",
            idInstituicao: evento.idInstituicao || instituicoes[0]?.idInstituicao || "",
        });
        setArquivoImagem(null);
        if (inputArquivoRef.current) inputArquivoRef.current.value = "";
        setMensagemEvento("Editando evento. Envie uma nova imagem apenas se quiser substituir a atual.");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function excluirEvento() {
        if (!eventoSelecionado) return;
        setEnviandoEvento(true);
        try {
            await eventoService.excluir(eventoSelecionado.idEvento);
            if (idEventoEmEdicao === eventoSelecionado.idEvento) limparEvento();
            setEventoSelecionado(null);
            await carregarEventos();
        } catch (error) {
            setMensagemEvento(getApiErrorMessage(error));
            setEventoSelecionado(null);
        } finally {
            setEnviandoEvento(false);
        }
    }

    // ==================== FUNÇÕES DE TIPOS DE EVENTO ====================
    function limparTipoEvento() {
        setTituloTipoEvento("");
        setIdTipoEventoEmEdicao(null);
        setMensagemTipoEvento("");
    }

    async function salvarTipoEvento(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const tituloLimpo = tituloTipoEvento.trim();
        if (!tituloLimpo) return;

        setEnviandoTipoEvento(true);
        setMensagemTipoEvento("");
        try {
            const editando = Boolean(idTipoEventoEmEdicao);
            if (idTipoEventoEmEdicao) {
                await tipoEventoService.atualizar(idTipoEventoEmEdicao, tituloLimpo);
            } else {
                await tipoEventoService.cadastrar(tituloLimpo);
            }
            limparTipoEvento();
            await carregarEventos();
            setMensagemTipoEvento(
                editando
                    ? "Tipo de evento atualizado com sucesso!"
                    : "Tipo de evento cadastrado com sucesso!"
            );
        } catch (error) {
            setMensagemTipoEvento(getApiErrorMessage(error));
        } finally {
            setEnviandoTipoEvento(false);
        }
    }

    function editarTipoEvento(item: ItemTipoAdmin) {
        setIdTipoEventoEmEdicao(item.id);
        setTituloTipoEvento(item.titulo);
        setMensagemTipoEvento("Editando tipo de evento.");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function excluirTipoEvento() {
        if (!tipoEventoSelecionado) return;
        setEnviandoTipoEvento(true);
        try {
            await tipoEventoService.excluir(tipoEventoSelecionado.id);
            if (idTipoEventoEmEdicao === tipoEventoSelecionado.id) limparTipoEvento();
            setTipoEventoSelecionado(null);
            await carregarEventos();
        } catch (error) {
            setMensagemTipoEvento(getApiErrorMessage(error));
            setTipoEventoSelecionado(null);
        } finally {
            setEnviandoTipoEvento(false);
        }
    }

    // ==================== FUNÇÕES DE TIPOS DE USUÁRIO ====================
    function limparTipoUsuario() {
        setTituloTipoUsuario("");
        setIdTipoUsuarioEmEdicao(null);
        setMensagemTipoUsuario("");
    }

    async function salvarTipoUsuario(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const tituloLimpo = tituloTipoUsuario.trim();
        if (!tituloLimpo) return;

        setEnviandoTipoUsuario(true);
        setMensagemTipoUsuario("");
        try {
            const editando = Boolean(idTipoUsuarioEmEdicao);
            if (idTipoUsuarioEmEdicao) {
                await tipoUsuarioService.atualizar(idTipoUsuarioEmEdicao, tituloLimpo);
            } else {
                await tipoUsuarioService.cadastrar(tituloLimpo);
            }
            limparTipoUsuario();
            await carregarUsuarios();
            setMensagemTipoUsuario(
                editando
                    ? "Tipo de usuário atualizado com sucesso!"
                    : "Tipo de usuário cadastrado com sucesso!"
            );
        } catch (error) {
            setMensagemTipoUsuario(getApiErrorMessage(error));
        } finally {
            setEnviandoTipoUsuario(false);
        }
    }

    function editarTipoUsuario(item: ItemTipoAdmin) {
        setIdTipoUsuarioEmEdicao(item.id);
        setTituloTipoUsuario(item.titulo);
        setMensagemTipoUsuario("Editando tipo de usuário.");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function excluirTipoUsuario() {
        if (!tipoUsuarioSelecionado) return;
        setEnviandoTipoUsuario(true);
        try {
            await tipoUsuarioService.excluir(tipoUsuarioSelecionado.id);
            if (idTipoUsuarioEmEdicao === tipoUsuarioSelecionado.id) limparTipoUsuario();
            setTipoUsuarioSelecionado(null);
            await carregarUsuarios();
        } catch (error) {
            setMensagemTipoUsuario(getApiErrorMessage(error));
            setTipoUsuarioSelecionado(null);
        } finally {
            setEnviandoTipoUsuario(false);
        }
    }

    return (
        <>
            <Header />
            <main className="cadastro-usuario-page">
                <section className="cadastro-usuario-formulario-section">
                    <h1 className="section-title">Painel de Administração</h1>
                    <hr className="section-divider" />

                    {/* Abas de alternância do Painel de Administração */}
                    <div className="admin-abas">
                        <button
                            type="button"
                            className={`admin-aba-btn ${abaAtiva === "usuarios" ? "ativa" : ""}`}
                            onClick={() => setAbaAtiva("usuarios")}
                        >
                            Gerenciar Usuários
                        </button>
                        <button
                            type="button"
                            className={`admin-aba-btn ${abaAtiva === "eventos" ? "ativa" : ""}`}
                            onClick={() => setAbaAtiva("eventos")}
                        >
                            Gerenciar Eventos
                        </button>
                        <button
                            type="button"
                            className={`admin-aba-btn ${abaAtiva === "tiposEvento" ? "ativa" : ""}`}
                            onClick={() => setAbaAtiva("tiposEvento")}
                        >
                            Tipos de Evento
                        </button>
                        <button
                            type="button"
                            className={`admin-aba-btn ${abaAtiva === "tiposUsuario" ? "ativa" : ""}`}
                            onClick={() => setAbaAtiva("tiposUsuario")}
                        >
                            Tipos de Usuário
                        </button>
                    </div>

                    {/* ABA 1: GERENCIAR USUÁRIOS */}
                    {abaAtiva === "usuarios" && (
                        <div className="cadastro-usuario-conteudo">
                            <img
                                src={UsuarioImg}
                                alt="Ilustração de administração de usuários"
                                className="cadastro-usuario-ilustracao"
                            />
                            <form className="cadastro-usuario-formulario" onSubmit={salvar}>
                                <h2>{idEmEdicao ? "Editar usuário" : "Cadastrar usuário"}</h2>

                                <label className="visually-hidden" htmlFor="usuario-email">Email</label>
                                <Campo
                                    id="usuario-email"
                                    type="email"
                                    name="email"
                                    value={formulario.email}
                                    onChange={atualizar}
                                    placeholder="Email"
                                    required
                                />

                                <label className="visually-hidden" htmlFor="usuario-nome">Nome</label>
                                <Campo
                                    id="usuario-nome"
                                    type="text"
                                    name="nome"
                                    value={formulario.nome}
                                    onChange={atualizar}
                                    placeholder="Nome"
                                    maxLength={100}
                                    required
                                />

                                <div className="cadastro-usuario-grid">
                                    <label htmlFor="usuario-tipo" className="visually-hidden">Tipo de usuário</label>
                                    <select
                                        name="idTipoUsuario"
                                        id="usuario-tipo"
                                        value={formulario.idTipoUsuario}
                                        onChange={atualizar}
                                        required
                                    >
                                        {tipos.map((tipo) => (
                                            <option value={tipo.idTipoUsuario} key={tipo.idTipoUsuario}>
                                                {tipo.titulo}
                                            </option>
                                        ))}
                                    </select>

                                    <div>
                                        <label htmlFor="usuario-senha" className="visually-hidden">Senha</label>
                                        <Campo
                                            id="usuario-senha"
                                            name="senha"
                                            type="password"
                                            value={formulario.senha}
                                            onChange={atualizar}
                                            placeholder={
                                                idEmEdicao
                                                    ? "Nova senha (opcional — deixe em branco para manter)"
                                                    : "Senha"
                                            }
                                            minLength={8}
                                            maxLength={60}
                                            required={!idEmEdicao}
                                        />
                                    </div>

                                    <div className="cadastro-usuario-acoes">
                                        <Botao
                                            texto={enviando ? "Salvando..." : idEmEdicao ? "Salvar" : "Cadastrar"}
                                            type="submit"
                                            disabled={enviando}
                                        />
                                        {idEmEdicao ? (
                                            <button
                                                className="cadastro-usuario-cancelar"
                                                type="button"
                                                onClick={limpar}
                                            >
                                                Cancelar edição
                                            </button>
                                        ) : null}
                                    </div>

                                    {mensagem ? (
                                        <p className="cadastro-usuario-mensagem" role="alert">
                                            {mensagem}
                                        </p>
                                    ) : null}
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ABA 2: GERENCIAR EVENTOS */}
                    {abaAtiva === "eventos" && (
                        <div className="cadastro-usuario-conteudo">
                            <img
                                src={EventoImg}
                                alt="Ilustração de administração de eventos"
                                className="cadastro-usuario-ilustracao"
                            />
                            <form className="cadastro-usuario-formulario" onSubmit={salvarEvento}>
                                <h2>{idEventoEmEdicao ? "Editar evento" : "Cadastrar evento"}</h2>

                                <label className="visually-hidden" htmlFor="evento-nome">Nome do evento</label>
                                <Campo
                                    id="evento-nome"
                                    type="text"
                                    name="nomeEvento"
                                    value={formEvento.nomeEvento}
                                    onChange={atualizarEvento}
                                    placeholder="Nome do evento"
                                    maxLength={100}
                                    required
                                />

                                <label className="visually-hidden" htmlFor="evento-data">Data do evento</label>
                                <Campo
                                    id="evento-data"
                                    type="date"
                                    name="dataEvento"
                                    value={formEvento.dataEvento}
                                    onChange={atualizarEvento}
                                    required
                                />

                                <div className="cadastro-usuario-grid">
                                    <label htmlFor="evento-tipo" className="visually-hidden">Categoria do evento</label>
                                    <select
                                        name="idTipoEvento"
                                        id="evento-tipo"
                                        value={formEvento.idTipoEvento}
                                        onChange={atualizarEvento}
                                        required
                                    >
                                        {tiposEvento.map((tipo) => (
                                            <option value={tipo.idTipoEvento} key={tipo.idTipoEvento}>
                                                {tipo.titulo}
                                            </option>
                                        ))}
                                    </select>

                                    <label htmlFor="evento-instituicao" className="visually-hidden">Instituição</label>
                                    <select
                                        name="idInstituicao"
                                        id="evento-instituicao"
                                        value={formEvento.idInstituicao}
                                        onChange={atualizarEvento}
                                        required
                                    >
                                        {instituicoes.map((inst) => (
                                            <option value={inst.idInstituicao} key={inst.idInstituicao}>
                                                {inst.nomeFantasia}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="campo-arquivo-wrapper">
                                        <label htmlFor="evento-imagem" className="campo-arquivo-label">
                                            Banner do evento {idEventoEmEdicao ? "(opcional)" : ""}
                                        </label>
                                        <input
                                            ref={inputArquivoRef}
                                            id="evento-imagem"
                                            type="file"
                                            accept="image/*"
                                            className="campo-arquivo"
                                            onChange={(e) => setArquivoImagem(e.target.files?.[0] || null)}
                                        />
                                    </div>

                                    <label htmlFor="evento-descricao" className="visually-hidden">Descrição</label>
                                    <textarea
                                        id="evento-descricao"
                                        name="descricao"
                                        value={formEvento.descricao}
                                        onChange={atualizarEvento}
                                        placeholder="Descrição do evento"
                                        rows={3}
                                        required
                                    />

                                    <div className="cadastro-usuario-acoes">
                                        <Botao
                                            texto={
                                                enviandoEvento
                                                    ? "Salvando..."
                                                    : idEventoEmEdicao
                                                        ? "Salvar evento"
                                                        : "Cadastrar evento"
                                            }
                                            type="submit"
                                            disabled={enviandoEvento}
                                        />
                                        {idEventoEmEdicao ? (
                                            <button
                                                className="cadastro-usuario-cancelar"
                                                type="button"
                                                onClick={limparEvento}
                                            >
                                                Cancelar edição
                                            </button>
                                        ) : null}
                                    </div>

                                    {mensagemEvento ? (
                                        <p className="cadastro-usuario-mensagem" role="alert">
                                            {mensagemEvento}
                                        </p>
                                    ) : null}
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ABA 3: TIPOS DE EVENTO */}
                    {abaAtiva === "tiposEvento" && (
                        <div className="cadastro-usuario-conteudo">
                            <img
                                src={TipoEventoImg}
                                alt="Ilustração de tipos de evento"
                                className="cadastro-usuario-ilustracao"
                            />
                            <form className="cadastro-usuario-formulario" onSubmit={salvarTipoEvento}>
                                <h2>
                                    {idTipoEventoEmEdicao
                                        ? "Editar tipo de evento"
                                        : "Cadastrar tipo de evento"}
                                </h2>

                                <label className="visually-hidden" htmlFor="tipo-evento-titulo">
                                    Título do tipo de evento
                                </label>
                                <Campo
                                    id="tipo-evento-titulo"
                                    type="text"
                                    name="tituloTipoEvento"
                                    value={tituloTipoEvento}
                                    onChange={(e) => setTituloTipoEvento(e.target.value)}
                                    placeholder="Ex: Workshop, Hackathon, Palestra..."
                                    maxLength={100}
                                    required
                                />

                                <div className="cadastro-usuario-grid">
                                    <div className="cadastro-usuario-acoes">
                                        <Botao
                                            texto={
                                                enviandoTipoEvento
                                                    ? "Salvando..."
                                                    : idTipoEventoEmEdicao
                                                        ? "Salvar tipo"
                                                        : "Cadastrar tipo"
                                            }
                                            type="submit"
                                            disabled={enviandoTipoEvento}
                                        />
                                        {idTipoEventoEmEdicao ? (
                                            <button
                                                className="cadastro-usuario-cancelar"
                                                type="button"
                                                onClick={limparTipoEvento}
                                            >
                                                Cancelar edição
                                            </button>
                                        ) : null}
                                    </div>

                                    {mensagemTipoEvento ? (
                                        <p className="cadastro-usuario-mensagem" role="alert">
                                            {mensagemTipoEvento}
                                        </p>
                                    ) : null}
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ABA 4: TIPOS DE USUÁRIO */}
                    {abaAtiva === "tiposUsuario" && (
                        <div className="cadastro-usuario-conteudo">
                            <img
                                src={TipoUsuarioImg}
                                alt="Ilustração de tipos de usuário"
                                className="cadastro-usuario-ilustracao"
                            />
                            <form className="cadastro-usuario-formulario" onSubmit={salvarTipoUsuario}>
                                <h2>
                                    {idTipoUsuarioEmEdicao
                                        ? "Editar tipo de usuário"
                                        : "Cadastrar tipo de usuário"}
                                </h2>

                                <label className="visually-hidden" htmlFor="tipo-usuario-titulo">
                                    Título do tipo de usuário
                                </label>
                                <Campo
                                    id="tipo-usuario-titulo"
                                    type="text"
                                    name="tituloTipoUsuario"
                                    value={tituloTipoUsuario}
                                    onChange={(e) => setTituloTipoUsuario(e.target.value)}
                                    placeholder="Ex: Administrador, Comum, Palestrante..."
                                    maxLength={100}
                                    required
                                />

                                <div className="cadastro-usuario-grid">
                                    <div className="cadastro-usuario-acoes">
                                        <Botao
                                            texto={
                                                enviandoTipoUsuario
                                                    ? "Salvando..."
                                                    : idTipoUsuarioEmEdicao
                                                        ? "Salvar tipo"
                                                        : "Cadastrar tipo"
                                            }
                                            type="submit"
                                            disabled={enviandoTipoUsuario}
                                        />
                                        {idTipoUsuarioEmEdicao ? (
                                            <button
                                                className="cadastro-usuario-cancelar"
                                                type="button"
                                                onClick={limparTipoUsuario}
                                            >
                                                Cancelar edição
                                            </button>
                                        ) : null}
                                    </div>

                                    {mensagemTipoUsuario ? (
                                        <p className="cadastro-usuario-mensagem" role="alert">
                                            {mensagemTipoUsuario}
                                        </p>
                                    ) : null}
                                </div>
                            </form>
                        </div>
                    )}
                </section>

                {/* LISTAGEM E MODAL DE CADA ABA */}
                {abaAtiva === "usuarios" && (
                    <>
                        <ListaUsuarios
                            usuarios={usuarios}
                            idEmEdicao={idEmEdicao}
                            carregando={carregando}
                            onEditar={editar}
                            onExcluir={setSelecionado}
                        />

                        <Modal
                            aberto={Boolean(selecionado)}
                            titulo="Excluir Usuário?"
                            textoConfirmar="Sim, excluir"
                            textoCancelar="Cancelar"
                            carregando={enviando}
                            aoConfirmar={() => void excluir()}
                            aoFechar={() => setSelecionado(null)}
                        >
                            <p>
                                Tem certeza que deseja excluir o usuário{" "}
                                <strong>{selecionado?.nome}</strong>?
                            </p>
                        </Modal>
                    </>
                )}

                {abaAtiva === "eventos" && (
                    <>
                        <ListaEventosAdmin
                            eventos={eventos}
                            idEmEdicao={idEventoEmEdicao}
                            carregando={carregandoEventos}
                            onEditar={editarEvento}
                            onExcluir={setEventoSelecionado}
                        />

                        <Modal
                            aberto={Boolean(eventoSelecionado)}
                            titulo="Excluir Evento?"
                            textoConfirmar="Sim, excluir"
                            textoCancelar="Cancelar"
                            carregando={enviandoEvento}
                            aoConfirmar={() => void excluirEvento()}
                            aoFechar={() => setEventoSelecionado(null)}
                        >
                            <p>
                                Tem certeza que deseja excluir o evento{" "}
                                <strong>{eventoSelecionado?.nomeEvento}</strong>?
                            </p>
                        </Modal>
                    </>
                )}

                {abaAtiva === "tiposEvento" && (
                    <>
                        <ListaTiposAdmin
                            tituloSecao="Tipos de eventos cadastrados"
                            colunaTitulo="Categoria / Tipo de Evento"
                            mensagemVazia="Nenhum tipo de evento cadastrado"
                            itens={tiposEvento.map((t) => ({ id: t.idTipoEvento, titulo: t.titulo }))}
                            idEmEdicao={idTipoEventoEmEdicao}
                            carregando={carregandoEventos}
                            onEditar={editarTipoEvento}
                            onExcluir={setTipoEventoSelecionado}
                        />

                        <Modal
                            aberto={Boolean(tipoEventoSelecionado)}
                            titulo="Excluir Tipo de Evento?"
                            textoConfirmar="Sim, excluir"
                            textoCancelar="Cancelar"
                            carregando={enviandoTipoEvento}
                            aoConfirmar={() => void excluirTipoEvento()}
                            aoFechar={() => setTipoEventoSelecionado(null)}
                        >
                            <p>
                                Tem certeza que deseja excluir o tipo de evento{" "}
                                <strong>{tipoEventoSelecionado?.titulo}</strong>?
                            </p>
                        </Modal>
                    </>
                )}

                {abaAtiva === "tiposUsuario" && (
                    <>
                        <ListaTiposAdmin
                            tituloSecao="Tipos de usuários cadastrados"
                            colunaTitulo="Perfil / Tipo de Usuário"
                            mensagemVazia="Nenhum tipo de usuário cadastrado"
                            itens={tipos.map((t) => ({ id: t.idTipoUsuario, titulo: t.titulo }))}
                            idEmEdicao={idTipoUsuarioEmEdicao}
                            carregando={carregando}
                            onEditar={editarTipoUsuario}
                            onExcluir={setTipoUsuarioSelecionado}
                        />

                        <Modal
                            aberto={Boolean(tipoUsuarioSelecionado)}
                            titulo="Excluir Tipo de Usuário?"
                            textoConfirmar="Sim, excluir"
                            textoCancelar="Cancelar"
                            carregando={enviandoTipoUsuario}
                            aoConfirmar={() => void excluirTipoUsuario()}
                            aoFechar={() => setTipoUsuarioSelecionado(null)}
                        >
                            <p>
                                Tem certeza que deseja excluir o tipo de usuário{" "}
                                <strong>{tipoUsuarioSelecionado?.titulo}</strong>?
                            </p>
                        </Modal>
                    </>
                )}
            </main>
            <Footer />
        </>
    );
}

export default Usuarios;
