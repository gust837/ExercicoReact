import { useState, useEffect } from "react";
import type { Evento } from '../../types/api';
import { eventoService } from '../../services/eventPlusService';

import VisaoImg from '../../assets/image.png';
import CardEvento from '../../components/CardEvento/CardEvento';
import Carrossel from '../../components/Carrossel';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './Home.css';

function Home() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [filtroAtivo, setFiltroAtivo] = useState('Todos');

    // Estado separado só para mandar os mais próximos para o Carrossel
    const [eventosCarrossel, setEventosCarrossel] = useState<Evento[]>([]);

    useEffect(() => {
        async function carregar() {
            try {
                const dados = await eventoService.listar(); // Usa a rota normal
                setEventos(dados); 
                
                // Lógica do Carrossel: Pega eventos futuros e ordena do mais próximo pro mais longe
                const futuros = dados
                    .filter(e => new Date(e.dataEvento) >= new Date())
                    .sort((a, b) => new Date(a.dataEvento).getTime() - new Date(b.dataEvento).getTime());
                
                // Manda apenas os 3 mais próximos para ficar rodando no carrossel
                setEventosCarrossel(futuros.slice(0, 3));

            } catch (error) {
                console.error("Erro ao carregar os eventos", error);
            }
        }
        void carregar();
    }, []);

    // Categorias e Filtros para a lista lá embaixo
    const categorias = ["Todos", ...new Set(["Programação", "Design", "Tecnologia", ...eventos.map(e => e.idTipoEventoNavigation?.titulo || "Outros")])];

    const eventosFiltrados = filtroAtivo === "Todos" 
        ? eventos 
        : eventos.filter(evento => evento.idTipoEventoNavigation?.titulo === filtroAtivo);

    return (
        <>
            <Header />
            <main>
                {/* 1. O Carrossel agora recebe os eventos que a gente ordenou! */}
                <Carrossel eventosProximos={eventosCarrossel} />

                <section className="home-visao">
                    <div className='home-visao-container'>
                        <img src={VisaoImg} alt="Pessoas confraternizando" />
                        <div className="home-visao-texto">
                            <h1>Visão</h1>
                            <p>A EventPlus organiza eventos e informações em um interface direta,
                                facilitando a consulta da agenda e a participação do usuários.</p>
                        </div>
                    </div>
                </section>

                {/* 2. Sua sessão de Eventos Restaurada e Conectada na API! */}
                <section id='eventos' className="home-eventos">
                    <div className="home-evento-titulo">
                        <h2>Próximos eventos</h2>
                        <hr />
                    </div>

                    <div className="home-filtros">
                        {categorias.map(categoria => (
                            <button 
                                key={categoria}
                                className={`btn-filtro ${filtroAtivo === categoria ? 'ativo' : ''}`}
                                onClick={() => setFiltroAtivo(categoria)}
                            >
                                {categoria}
                            </button>
                        ))}
                    </div>

                    <div className="home-eventos-lista">
                        {eventosFiltrados.map((evento) => (
                            <CardEvento
                                key={evento.idEvento}
                                id={evento.idEvento}
                                titulo={evento.nomeEvento}
                                imagem={evento.imagemUrl}
                                descricao={evento.descricao}
                                categoria={evento.idTipoEventoNavigation?.titulo || "Evento"}
                            />
                        ))}
                    </div>
                </section>

                <section id='contato' className="home-contato">
                    <div className="home-contato-container">
                        <div className="home-contato-titulo">
                            <h2>Contato</h2>
                            <hr />
                        </div>
                        <div className='home-contato-conteudo'>
                            <div className="home-contato-texto">
                                <p>Rua Niterói, 180 - Centro</p>
                                <p>São Caetano do Sul - SP</p>
                            </div>
                            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.7773370506975!2d-46.5696684!3d-23.6123172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce5cede08f9793%3A0x7198f2701d9db9a4!2sNova%20Karibe%20Lanchonete%20e%20Restaurante!5e0!3m2!1spt-BR!2sbr!4v1791226432392!5m2!1spt-BR!2sbr" loading="lazy"></iframe>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

export default Home;