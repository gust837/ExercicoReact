import type { Evento } from "../types/api";
import bannerPadrao from "../assets/banner-1.png";
import "./Carrossel.css";

// Dizemos que o Carrossel vai receber uma lista de eventos
interface CarrosselProps {
    eventosProximos: Evento[];
}

function Carrossel({ eventosProximos }: CarrosselProps) {
    return (
        <section id="carrosselEventPlus"
            className="carousel slide"
            data-bs-ride="carousel"
            data-bs-interval="5000">

            <div className="carousel-inner">
                {/* Se não tiver evento nenhum, mostra a imagem padrão */}
                {eventosProximos.length === 0 ? (
                    <div className="carousel-item active">
                        <div className="carousel-banner-wrapper">
                            <img src={bannerPadrao} className="carousel-banner-main" alt="Banner padrão" />
                        </div>
                    </div>

                ) : (
                    /* Se tiver eventos, faz um loop criando os slides */
                    eventosProximos.map((evento, index) => {
                        const imagemSrc = evento.imagemUrl || bannerPadrao;
                        return (
                            <div key={evento.idEvento} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                                <div className="carousel-banner-wrapper">
                                    {/* 1. Imagem de fundo desfocada (preenche tudo) */}
                                    <img
                                        src={imagemSrc}
                                        className="carousel-bg-blur"
                                        alt=""
                                        aria-hidden="true"
                                    />
                                    {/* 2. Imagem principal inteira (sem cortes) */}
                                    <img
                                        src={imagemSrc}
                                        className="carousel-banner-main"
                                        alt={`Banner do evento ${evento.nomeEvento}`}
                                    />
                                </div>
                                {/* Legenda estilizada */}
                                <div className="carousel-legenda">
                                    <h3>{evento.nomeEvento}</h3>
                                    <p>{new Date(evento.dataEvento).toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <button className="carousel-control-prev" type="button" data-bs-target="#carrosselEventPlus" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true" />
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#carrosselEventPlus" data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true" />
            </button>
        </section>
    )
}

export default Carrossel;