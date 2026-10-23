import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import type { AuthSession, LoginPayload } from "../types/api";
import { SESSION_STORAGE_KEY, UNAUTHORIZED_EVENT } from "../services/api";
import { authService, usuarioService } from "../services/eventPlusService";
import { AuthContext } from "./Auth";

function readSession() {
    try {
        const value = localStorage.getItem(SESSION_STORAGE_KEY);
        if (!value) return null;
        const session = JSON.parse(value) as AuthSession;
        if (!session.token || new Date(session.expiracao).getTime() <= Date.now()) {
            localStorage.removeItem(SESSION_STORAGE_KEY);
            return null;
        }
        return session;
    } catch {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
    }
}

export function AuthProvider({ children }: PropsWithChildren) {
    const [session, setSession] = useState<AuthSession | null>(() => readSession());
    const sessionRef = useRef(session);
    const initialSession = useRef(session);
    const [carregandoSessao, setCarregandoSessao] = useState(Boolean(session));

    const persist = useCallback((next: AuthSession | null) => {
        sessionRef.current = next;
        setSession(next);
        if (next) localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
        else localStorage.removeItem(SESSION_STORAGE_KEY);
    }, []);

    const atualizarUsuario = useCallback(async () => {
        const atual = sessionRef.current;
        if (!atual) return;
        const usuario = await usuarioService.buscar(atual.usuario.idUsuario);
        persist({ ...atual, usuario });
    }, [persist]);

    const login = useCallback(async (payload: LoginPayload) => {
        const loginResponse = await authService.login(payload);
        const baseSession: AuthSession = loginResponse;
        persist(baseSession);
        try {
            const usuario = await usuarioService.buscar(loginResponse.usuario.idUsuario);
            persist({ ...baseSession, usuario });
        } catch {
            // Mantém os dados básicos retornados no login caso a busca detalhada falhe
        }
    }, [persist]);

    const logout = useCallback(() => {
        persist(null);
    }, [persist]);

    useEffect(() => {
        const handleUnauthorized = () => persist(null);

        window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);

        return () =>
            window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    }, [persist]);

    useEffect(() => {
        const restored = initialSession.current;

        if (!restored) return;
        usuarioService
            .buscar(restored.usuario.idUsuario)
            .then((usuario) => {
                persist({ ...restored, usuario });
            })
            .catch(() => undefined)
            .finally(() => setCarregandoSessao(false));
    }, [persist]);

    const perfil = session?.usuario.idTipoUsuarioNavigation?.titulo.toLowerCase() ?? "";

    const contextValue = useMemo(
        () => ({
            session,
            usuario: session?.usuario ?? null,
            perfil,
            autenticado: Boolean(session),
            carregandoSessao,
            login,
            logout,
            atualizarUsuario,
        }),
        [session, perfil, carregandoSessao, login, logout, atualizarUsuario]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}
