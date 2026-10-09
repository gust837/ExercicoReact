import { Link, useParams } from "react-router-dom";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import "./DetalhesEvento.css";

function DetalhesEvento() {
    const { id = "" } = useParams();

    return (
        <>
            <Header />
            <main>
                <Link to="/eventos">Voltar aos eventos</Link>
                <h1>Detalhes do evento</h1>
                <p>ID recebido: {id}</p>
            </main>
            <Footer />
        </>
    )
}

export default DetalhesEvento;