import { useEffect, useState } from "react";
import type { Evento } from "../../types/api";
import bannerPadrao from "../../assets/banner-1.png";
import "./Carrossel.css";

interface CarrosselProps {
    eventosProximos: Evento[];
    id?: string;
}

function Carrossel({ eventosProximos, id = "carrosselTopo" }: CarrosselProps) {
    const [indiceAtivo, setIndiceAtivo] = useState(0);
    const total = eventosProximos.length;

    useEffect(() => {
        if (total <= 1) return;
        const timer = window.setInterval(() => {
            setIndiceAtivo((atual) => (atual + 1) % total);
        }, 5000);
        return () => window.clearInterval(timer);
    }, [total]);

    function anterior() {
        setIndiceAtivo((atual) => (atual - 1 + total) % total);
    }

    function proximo() {
        setIndiceAtivo((atual) => (atual + 1) % total);
    }

    return (
        <section id={id} className="carrossel-container">
            {total === 0 ? (
                <div className="carrossel-slide ativo">
                    <img src={bannerPadrao} className="carousel-banner-main" alt="Banner padrão" />
                </div>
            ) : (
                eventosProximos.map((evento, index) => {
                    const imagemSrc = evento.imagemUrl || bannerPadrao;
                    const ativo = index === indiceAtivo;

                    return (
                        <div key={evento.idEvento} className={`carrossel-slide ${ativo ? "ativo" : "inativo"}`}>
                            <img src={imagemSrc} className="carousel-bg-blur" alt="" aria-hidden="true" />
                            <img src={imagemSrc} className="carousel-banner-main" alt={`Banner do evento ${evento.nomeEvento}`} />

                            <div className="carousel-legenda">
                                <h3>{evento.nomeEvento}</h3>
                                <p>{new Date(evento.dataEvento).toLocaleDateString("pt-BR")}</p>
                            </div>
                        </div>
                    );
                })
            )}

            {total > 1 && (
                <>
                    <button type="button" onClick={anterior} className="carrossel-seta esquerda">❮</button>
                    <button type="button" onClick={proximo} className="carrossel-seta direita">❯</button>
                </>
            )}
        </section>
    );
}

export default Carrossel;