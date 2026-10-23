import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import type { Evento } from "../../types/api";
import { eventoService } from "../../services/eventPlusService";
import { obterTempo } from "../../utils/formatarData";

import VisaoImg from "../../assets/image.png";
import Carrossel from "../../components/Carrossel/Carrossel";
import BannerProximosEventos from "../../components/BannerProximosEventos/BannerProximosEventos";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./Home.css";

function Home() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const location = useLocation();

    useEffect(() => {
        async function carregar() {
            try {
                const dados = await eventoService.listar();
                setEventos(dados);
            } catch (error) {
                console.error("Erro ao carregar os eventos:", error);
            }
        }
        void carregar();
    }, []);

    // Rola suavemente até a seção caso exista hash na URL (ex.: /home#contato)
    useEffect(() => {
        if (!location.hash) return;
        const idAlvo = location.hash.replace("#", "");
        const elemento = document.getElementById(idAlvo);
        if (elemento) {
            elemento.scrollIntoView({ behavior: "smooth" });
        }
    }, [location.hash]);

    // Filtra e ordena apenas os eventos futuros pela data mais próxima (com fallback caso todos sejam passados)
    const listaProximos = useMemo(() => {
        const inicioHoje = new Date().setHours(0, 0, 0, 0);
        const ordenados = [...eventos].sort(
            (a, b) => obterTempo(a.dataEvento) - obterTempo(b.dataEvento)
        );
        const futuros = ordenados.filter((e) => obterTempo(e.dataEvento) >= inicioHoje);
        return futuros.length > 0 ? futuros : ordenados;
    }, [eventos]);

    return (
        <>
            <Header />
            <main>
                {/* 1. CARROSSEL DO TOPO (DESTAQUES / INSTITUCIONAL) */}
                <Carrossel id="CarrosselTopo" eventos={eventos} />

                {/* 2. VISÃO */}
                <section className="home-visao">
                    <div className="home-visao-container">
                        <img src={VisaoImg} alt="Pessoas confraternizando" />
                        <div className="home-visao-texto">
                            <h1>Visão</h1>
                            <p>
                                A EventPlus organiza eventos e informações em uma interface direta,
                                facilitando a consulta da agenda e a participação dos usuários.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3. SEÇÃO PRÓXIMOS EVENTOS COM SEU BANNER PRÓPRIO */}
                <section id="eventos" className="home-eventos">
                    <div className="home-evento-titulo">
                        <h2>Próximos eventos</h2>
                        <hr />
                    </div>

                    <BannerProximosEventos eventos={listaProximos} />
                </section>

                <section id="contato" className="home-contato">
                    <div className="home-contato-container">
                        <div className="home-contato-titulo">
                            <h2>Contato</h2>
                            <hr />
                        </div>
                        <div className="home-contato-conteudo">
                            <div className="home-contato-texto">
                                <p>Rua Niterói, 180 - Centro</p>
                                <p>São Caetano do Sul - SP</p>
                            </div>
                            <iframe
                                title="Mapa de localização EventPlus"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.7773370506975!2d-46.5696684!3d-23.6123172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce5cede08f9793%3A0x7198f2701d9db9a4!2sNova%20Karibe%20Lanchonete%20e%20Restaurante!5e0!3m2!1spt-BR!2sbr!4v1791226432392!5m2!1spt-BR!2sbr"
                                loading="lazy"
                            ></iframe>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

export default Home;
