import { Link } from "react-router-dom";
import type { Evento } from "../../types/api";
import { useCarrossel } from "../../hooks/useCarrossel";
import { formatarDataLonga } from "../../utils/formatarData";
import bannerPadrao from "../../assets/banner-1.png";
import "./BannerProximosEventos.css";

interface BannerProximosEventosProps {
    eventos: Evento[];
}

function BannerProximosEventos({ eventos }: BannerProximosEventosProps) {
    const total = eventos.length;
    const { indice, anterior, proximo } = useCarrossel(total, 6000);

    if (total === 0) return null;

    return (
        <div className="banner-proximos-container" aria-roledescription="carrossel" aria-label="Próximos eventos">
            <div className="proximo-card">
                {eventos.map((evento, index) => {
                    const imagemSrc = evento.imagemUrl || bannerPadrao;
                    const ativo = index === indice;
                    const dataFormatada = formatarDataLonga(evento.dataEvento);

                    return (
                        <div
                            key={evento.idEvento}
                            className={`proximo-slide ${ativo ? "ativo" : "inativo"}`}
                            aria-hidden={!ativo}
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
                        <button type="button" onClick={anterior} className="proximo-seta esquerda" aria-label="Evento anterior">❮</button>
                        <button type="button" onClick={proximo} className="proximo-seta direita" aria-label="Próximo evento">❯</button>
                    </>
                )}
            </div>
        </div>
    );
}

export default BannerProximosEventos;
