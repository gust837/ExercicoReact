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
                        <img src={bannerPadrao} className="carousel-banner" alt="Banner padrão" />
                    </div>
                ) : (
                    /* Se tiver eventos, faz um loop criando os slides */
                    eventosProximos.map((evento, index) => (
                        <div key={evento.idEvento} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                            <img 
                                src={evento.imagemUrl || bannerPadrao} 
                                className="carousel-banner" 
                                alt={`Banner do evento ${evento.nomeEvento}`} 
                                style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                            />
                            {/* Legenda com o Nome e Data do Evento */}
                            <div className="carousel-caption d-none d-md-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '8px', padding: '10px' }}>
                                <h3>{evento.nomeEvento}</h3>
                                <p>{new Date(evento.dataEvento).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>
                    ))
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