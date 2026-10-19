import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Evento } from "../../types/api";
import bannerPadrao from "../../assets/banner-1.png";
import "./BannerProximosEventos.css";

interface BannerProximosEventosProps {
    eventos: Evento[];
}

function BannerProximosEventos({ eventos }: BannerProximosEventosProps) {
    const [indiceAtivo, setIndiceAtivo] = useState(0);
    const total = eventos.length;

    useEffect(() => {
        if (total <= 1) return;
        const timer = window.setInterval(() => {
            setIndiceAtivo((atual) => (atual + 1) % total);
        }, 6000);
        return () => window.clearInterval(timer);
    }, [total]);

    if (total === 0) return null;

    function anterior() {
        setIndiceAtivo((atual) => (atual - 1 + total) % total);
    }

    function proximo() {
        setIndiceAtivo((atual) => (atual + 1) % total);
    }

    return (
        <div className="banner-proximos-container">
            <div className="proximo-card">
                {eventos.map((evento, index) => {
                    const imagemSrc = evento.imagemUrl || bannerPadrao;
                    const ativo = index === indiceAtivo;
                    const dataFormatada = new Date(evento.dataEvento).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric"
                    });

                    return (
                        <div
                            key={evento.idEvento}
                            className={`proximo-slide ${ativo ? "ativo" : "inativo"}`}
                        >
                            <img src={imagemSrc} className="proximo-card-bg" alt="" aria-hidden="true" />

                            <div className="proximo-card-conteudo">
                                <div className="proximo-card-imagem">
                                    <img src={imagemSrc} alt={evento.nomeEvento} />
                                    <span className="proximo-badge-data">📅 {dataFormatada}</span>
                                </div>

                                <div className="proximo-card-info">
                                    <span className="proximo-tag-categoria">
                                        {evento.idTipoEventoNavigation?.titulo || "Evento"}
                                    </span>
                                    <h3>{evento.nomeEvento}</h3>
                                    <p>{evento.descricao}</p>

                                    <Link to={`/eventos/${evento.idEvento}`} className="btn-conectar-evento">
                                        Ver detalhes do evento
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {total > 1 && (
                    <>
                        <button type="button" onClick={anterior} className="proximo-seta esquerda">❮</button>
                        <button type="button" onClick={proximo} className="proximo-seta direita">❯</button>
                    </>
                )}
            </div>
        </div>
    );
}

export default BannerProximosEventos;