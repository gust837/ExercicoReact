import { useEffect, useMemo, useState } from "react";
import type { Evento, TipoEvento } from "../../types/api";
import { eventoService, tipoEventoService } from "../../services/eventPlusService";
import { getApiErrorMessage } from "../../services/api";
import { normalizarTexto } from "../../utils/validarEmail";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import CardEvento from "../../components/CardEvento/CardEvento";

import "./Eventos.css";

function Eventos() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
    const [filtroAtivo, setFiltroAtivo] = useState("Todos");
    const [busca, setBusca] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function carregar() {
            setCarregando(true);
            setErro("");
            try {
                const [dadosEventos, dadosTipos] = await Promise.all([
                    eventoService.listar(),
                    tipoEventoService.listar().catch(() => [] as TipoEvento[]),
                ]);
                setEventos(dadosEventos);
                setTiposEvento(dadosTipos);
            } catch (error) {
                setErro(getApiErrorMessage(error));
            } finally {
                setCarregando(false);
            }
        }
        void carregar();
    }, []);

    // Monta a lista de categorias sem duplicar maiúsculas/minúsculas
    const categorias = useMemo(() => {
        const mapa = new Map<string, string>();
        for (const tipo of tiposEvento) {
            const chave = normalizarTexto(tipo.titulo);
            if (chave && !mapa.has(chave)) {
                mapa.set(chave, tipo.titulo.trim());
            }
        }
        for (const ev of eventos) {
            const titulo = ev.idTipoEventoNavigation?.titulo?.trim();
            if (titulo) {
                const chave = normalizarTexto(titulo);
                if (chave && !mapa.has(chave)) {
                    mapa.set(chave, titulo);
                }
            }
        }
        return ["Todos", ...Array.from(mapa.values())];
    }, [eventos, tiposEvento]);

    const eventosFiltrados = useMemo(() => {
        const chaveCategoria = filtroAtivo === "Todos" ? "" : normalizarTexto(filtroAtivo);
        const termoBusca = normalizarTexto(busca);

        return eventos.filter((evento) => {
            const categoriaEvento = normalizarTexto(
                evento.idTipoEventoNavigation?.titulo || "Outros"
            );
            const bateCategoria = !chaveCategoria || categoriaEvento === chaveCategoria;

            if (!bateCategoria) return false;
            if (!termoBusca) return true;

            const nome = normalizarTexto(evento.nomeEvento);
            const descricao = normalizarTexto(evento.descricao);
            const instituicao = normalizarTexto(
                evento.idInstituicaoNavigation?.nomeFantasia || ""
            );

            return (
                nome.includes(termoBusca) ||
                descricao.includes(termoBusca) ||
                instituicao.includes(termoBusca)
            );
        });
    }, [eventos, filtroAtivo, busca]);

    return (
        <>
            <Header />
            <main className="pagina-eventos">
                <h2>Todos os Eventos</h2>
                <hr className="linha-titulo" />

                <div className="eventos-busca-wrapper">
                    <input
                        type="search"
                        className="eventos-busca-input"
                        placeholder="Buscar evento por nome, descrição ou instituição..."
                        aria-label="Buscar evento por nome, descrição ou instituição"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>

                <div className="filtros-container">
                    {categorias.map((categoria) => (
                        <button
                            key={categoria}
                            type="button"
                            className={`btn-filtro ${
                                normalizarTexto(filtroAtivo) === normalizarTexto(categoria)
                                    ? "ativo"
                                    : ""
                            }`}
                            onClick={() => setFiltroAtivo(categoria)}
                        >
                            {categoria}
                        </button>
                    ))}
                </div>

                {carregando ? (
                    <p className="eventos-estado">Carregando eventos...</p>
                ) : erro ? (
                    <p className="eventos-estado erro" role="alert">
                        {erro}
                    </p>
                ) : eventosFiltrados.length === 0 ? (
                    <p className="eventos-estado">Nenhum evento encontrado para este filtro.</p>
                ) : (
                    <div className="lista-grid-eventos">
                        {eventosFiltrados.map((evento) => (
                            <CardEvento
                                key={evento.idEvento}
                                id={evento.idEvento}
                                imagem={evento.imagemUrl}
                                categoria={evento.idTipoEventoNavigation?.titulo || "Evento"}
                                titulo={evento.nomeEvento}
                                descricao={evento.descricao}
                            />
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}

export default Eventos;
