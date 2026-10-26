import type { PropsWithChildren } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { perfilEhAdministrador, useAuth } from "../context/Auth";
import Home from "../pages/Home/Home";
import Eventos from "../pages/Eventos/Eventos";
import DetalhesEvento from "../pages/DetalhesEvento/DetalhesEvento";
import Login from "../pages/Login/Login";
import Usuarios from "../pages/Usuario/Usuario";

function RotaAdmin({ children }: PropsWithChildren) {
    const { autenticado, carregandoSessao, perfil } = useAuth();

    if (carregandoSessao) return null;
    if (!autenticado) return <Navigate to="/login" replace />;
    if (!perfilEhAdministrador(perfil)) return <Navigate to="/home" replace />;

    return <>{children}</>;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/eventos/:id" element={<DetalhesEvento />} />
            <Route path="/login" element={<Login />} />
            <Route
                path="/usuarios"
                element={
                    <RotaAdmin>
                        <Usuarios />
                    </RotaAdmin>
                }
            />
            <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
    );
}

export default AppRoutes;
