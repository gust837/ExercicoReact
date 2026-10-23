import type { Evento } from "../../types/api";
import { useCarrossel } from "../../hooks/useCarrossel";
import { formatarDataCurta } from "../../utils/formatarData";
import bannerPadrao from "../../assets/banner-1.png";
import "./Carrossel.css";

interface CarrosselProps {
    eventos: Evento[];
    id?: string;
}

function Carrossel({ eventos, id = "carrosselTopo" }: CarrosselProps) {
    const total = eventos.length;
    const { indice, anterior, proximo } = useCarrossel(total, 5000);

    return (
        <section id={id} className="carrossel-container" aria-roledescription="carrossel" aria-label="Destaques">
            {total === 0 ? (
                <div className="carrossel-slide ativo">
                    <img src={bannerPadrao} className="carousel-banner-main" alt="Banner padrão" />
                </div>
            ) : (
                eventos.map((evento, index) => {
                    const imagemSrc = evento.imagemUrl || bannerPadrao;
                    const ativo = index === indice;

                    return (
                        <div
                            key={evento.idEvento}
                            className={`carrossel-slide ${ativo ? "ativo" : "inativo"}`}
                            aria-hidden={!ativo}
                        >
                            <img src={imagemSrc} className="carousel-bg-blur" alt="" aria-hidden="true" />
                            <img src={imagemSrc} className="carousel-banner-main" alt={`Banner do evento ${evento.nomeEvento}`} />

                            <div className="carousel-legenda">
                                <h3>{evento.nomeEvento}</h3>
                                <p>{formatarDataCurta(evento.dataEvento)}</p>
                            </div>
                        </div>
                    );
                })
            )}

            {total > 1 && (
                <>
                    <button type="button" onClick={anterior} className="carrossel-seta esquerda" aria-label="Slide anterior">❮</button>
                    <button type="button" onClick={proximo} className="carrossel-seta direita" aria-label="Próximo slide">❯</button>
                </>
            )}
        </section>
    );
}

export default Carrossel;
