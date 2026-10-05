import LogoEvent from '../../assets/logo1.svg';
import BannerEvento1 from '../../assets/banner-1.png';
import BannerEvento2 from '../../assets/banner-2.png';
import BannerEvento3 from '../../assets/banner-3.png';
import VisaoImg from '../../assets/image.png';
import Carrossel from '../../components/Carrossel';
import './Home.css';

function Home() {
    return (
        <>
            <header className="home-header">
                <div className='home-header-conteudo'>
                    <img src={LogoEvent} alt="Logo Event+" />

                    <nav>
                        <a href="#inicio">Home</a>
                        <a href="#eventos">Eventos</a>
                        <a href="#usuarios">Usuarios</a>
                        <a href="#contato">Contato</a>
                    </nav>

                    <button>Entrar</button>
                </div>
            </header>

            <main>
                <Carrossel/>

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

                <section id='eventos' className="home-eventos">
                    <div className="home-evento-titulo">
                        <h2>Próximos eventos</h2>
                        <hr />
                    </div>

                    <div className="home-eventos-lista">
                        <article className='home-evento-card'>
                            <img src={BannerEvento1} alt="Evento Tec" />
                            <span>Tecnologia</span>
                            <div className="home-evento-card-info">
                                <h3>Evento de tecnologia</h3>
                                <p>Conheça novidades e tendencias</p>
                                <button type='button'>Ver evento</button>
                            </div>
                        </article>

                        <article className='home-evento-card'>
                            <img src={BannerEvento2} alt="Workshop de dev" />
                            <span>Workshop</span>
                            <div className="home-evento-card-info">
                                <h3>Workshop de desenvolvimento</h3>
                                <p>Pratique desenvolvimento com atividades guiadas.</p>
                                <button type='button'>Ver evento</button>
                            </div>
                        </article>

                        <article className='home-evento-card'>
                            <img src={BannerEvento3} alt="Meetup de inteligencia" />
                            <span>Meetup</span>
                            <div className="home-evento-card-info">
                                <h3>Meetup de IA</h3>
                                <p>Discussões sobre aplicações de inteligencia artificial</p>
                                <button type='button'>Ver evento</button>
                            </div>
                        </article>
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
                            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.7773370506975!2d-46.5696684!3d-23.6123172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce5cede08f9793%3A0x7198f2701d9db9a4!2sNova%20Karibe%20Lanchonete%20e%20Restaurante!5e0!3m2!1spt-BR!2sbr!4v1791226432392!5m2!1spt-BR!2sbr"  loading="lazy"></iframe>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="home-footer">
                <p>Escola Senai de informatica - 2026</p>
            </footer>
        </>
    );
}

export default Home;