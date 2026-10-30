import type { PropsWithChildren } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { perfilEhOrganizador, useAuth } from "../context/Auth";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Home from "../pages/Home/Home";
import Eventos from "../pages/Eventos/Eventos";
import DetalhesEvento from "../pages/DetalhesEvento/DetalhesEvento";
import Login from "../pages/Login/Login";
import Cadastro from "../pages/Cadastro/Cadastro";
import Usuarios from "../pages/Usuario/Usuario";

/**
 * Rota pública exclusiva para visitantes não autenticados (/login e /cadastro).
 * Se o usuário já estiver logado, redireciona para /home.
 */
function RotaPublicaRestrita({ children }: PropsWithChildren) {
    const { autenticado, carregandoSessao } = useAuth();

    if (carregandoSessao) return null;
    if (autenticado) return <Navigate to="/home" replace />;

    return <>{children}</>;
}

/**
 * Rota protegida para Administração e Organização (/usuarios).
 * - Visitantes não logados vão para /login.
 * - Participantes/Comuns logados veem tela de Acesso Restrito.
 * - Organizadores e Administradores têm acesso liberado.
 */
function RotaGestao({ children }: PropsWithChildren) {
    const { autenticado, carregandoSessao, perfil, usuario } = useAuth();

    if (carregandoSessao) return null;
    if (!autenticado) return <Navigate to="/login" replace />;

    if (!perfilEhOrganizador(perfil)) {
        return (
            <>
                <Header />
                <main className="pagina-eventos flex flex-col items-center justify-center text-center gap-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-dark">Acesso Restrito</h2>
                    <hr className="linha-titulo my-1" />
                    <p className="text-text-gray max-w-md text-sm sm:text-base">
                        Olá, <strong>{usuario?.nome || "participante"}</strong>! Seu perfil atual (
                        <strong>{usuario?.idTipoUsuarioNavigation?.titulo || "Participante"}</strong>) permite
                        visualizar eventos, confirmar presença e comentar, mas não possui permissão para acessar o
                        painel de gestão.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                        <Link
                            to="/eventos"
                            className="px-6 py-2.5 rounded-lg font-semibold bg-crimson text-white hover:bg-crimson-dark transition-colors"
                        >
                            Ver Eventos Disponíveis
                        </Link>
                        <Link
                            to="/home"
                            className="px-6 py-2.5 rounded-lg font-semibold border-2 border-crimson text-crimson hover:bg-crimson hover:text-white transition-colors"
                        >
                            Voltar para a Home
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return <>{children}</>;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/eventos/:id" element={<DetalhesEvento />} />
            <Route
                path="/login"
                element={
                    <RotaPublicaRestrita>
                        <Login />
                    </RotaPublicaRestrita>
                }
            />
            <Route
                path="/cadastro"
                element={
                    <RotaPublicaRestrita>
                        <Cadastro />
                    </RotaPublicaRestrita>
                }
            />
            <Route
                path="/usuarios"
                element={
                    <RotaGestao>
                        <Usuarios />
                    </RotaGestao>
                }
            />
            <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
    );
}

export default AppRoutes;
