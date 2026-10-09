import { useEffect, useState } from 'react';
import type { Evento } from '../../../types/api';
import { eventoService } from '../../../services/eventPlusService';

import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import CardEvento from '../../../components/CardEvento/CardEvento';

import './Eventos.css';

function Eventos() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [filtroAtivo, setFiltroAtivo] = useState("Todos");

    useEffect(() => {
        async function carregar() {
            const dados = await eventoService.listar();
            setEventos(dados);
        }
        void carregar();
    }, []);

   const categorias = ["Todos", ...new Set(["Programação", "Design", "Tecnologia", ...eventos.map(e => e.idTipoEventoNavigation?.titulo || "Outros")])];

    const eventosFiltrados = filtroAtivo === "Todos" 
        ? eventos 
        : eventos.filter(evento => evento.idTipoEventoNavigation?.titulo === filtroAtivo);

    return (
        <>
            <Header />
            <main className="pagina-eventos">
                <h2>Todos os Eventos</h2>
                <hr className="linha-titulo" />

                <div className="filtros-container">
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
                
                <div className='lista-grid-eventos'>
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
            </main>
            <Footer />
        </>
    );
}

export default Eventos;