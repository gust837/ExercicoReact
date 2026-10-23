import { useEffect, useMemo, useState } from "react";
import type { Evento } from "../../types/api";
import { eventoService } from "../../services/eventPlusService";
import { getApiErrorMessage } from "../../services/api";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import CardEvento from "../../components/CardEvento/CardEvento";

import "./Eventos.css";

function Eventos() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [filtroAtivo, setFiltroAtivo] = useState("Todos");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function carregar() {
            setCarregando(true);
            setErro("");
            try {
                const dados = await eventoService.listar();
                setEventos(dados);
            } catch (error) {
                setErro(getApiErrorMessage(error));
            } finally {
                setCarregando(false);
            }
        }
        void carregar();
    }, []);

    const categorias = useMemo(() => {
        const titulos = eventos.map((e) => e.idTipoEventoNavigation?.titulo || "Outros");
        return ["Todos", ...new Set(["Programação", "Design", "Tecnologia", ...titulos])];
    }, [eventos]);

    const eventosFiltrados = useMemo(() => {
        if (filtroAtivo === "Todos") return eventos;
        return eventos.filter(
            (evento) => (evento.idTipoEventoNavigation?.titulo || "Outros") === filtroAtivo
        );
    }, [eventos, filtroAtivo]);

    return (
        <>
            <Header />
            <main className="pagina-eventos">
                <h2>Todos os Eventos</h2>
                <hr className="linha-titulo" />

                <div className="filtros-container">
                    {categorias.map((categoria) => (
                        <button
                            key={categoria}
                            type="button"
                            className={`btn-filtro ${filtroAtivo === categoria ? "ativo" : ""}`}
                            onClick={() => setFiltroAtivo(categoria)}
                        >
                            {categoria}
                        </button>
                    ))}
                </div>

                {carregando ? (
                    <p className="eventos-estado">Carregando eventos...</p>
                ) : erro ? (
                    <p className="eventos-estado erro" role="alert">{erro}</p>
                ) : eventosFiltrados.length === 0 ? (
                    <p className="eventos-estado">Nenhum evento encontrado para esta categoria.</p>
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
