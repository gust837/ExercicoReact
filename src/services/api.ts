import axios from 'axios';

export const SESSION_STORAGE_KEY = "eventplus:session"
export const UNAUTHORIZED_EVENT = "eventplus:unauthorized"

export class ApiError extends Error{
    status?: number;
    validationErrors?: Record<string, string[]>;

    constructor(
        message: string,
        status?: number,
        validationErrors?: Record<string, string[]>,
    ){
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.validationErrors = validationErrors;
    }
}

export const axiosInstance = axios.create({
    // Pega a URL do arquivo .env; se não existir, usa a porta 7266 como padrão
    baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7266/api/',
    timeout: 15000,
    headers: {
        Accept: "application/json"
    }
});

// 1. INTERCEPTOR DE REQUISIÇÃO: Coloca o Token JWT antes de sair do React
axiosInstance.interceptors.request.use((config) => {
    const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (rawSession) {
        try {
            const session = JSON.parse(rawSession);
            if (session?.token) {
                config.headers.Authorization = `Bearer ${session.token}`;
            }
        } catch {
            localStorage.removeItem(SESSION_STORAGE_KEY);
        }
    }
    return config;
});

// 2. INTERCEPTOR DE RESPOSTA: Captura erros da API e converte para ApiError
axiosInstance.interceptors.response.use(
    (response) => response, // Se deu tudo certo (200/201), só devolve a resposta
    (error) => {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const data = error.response?.data;

            // Se o erro for 401 (Token vencido ou inválido) e não for na própria tela de Login:
            if (status === 401 && !error.config?.url?.toLowerCase().includes("login")) {
                localStorage.removeItem(SESSION_STORAGE_KEY);
                window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
            }

            // Descobre a mensagem que o C# enviou (seja texto direto ou objeto de validação)
            const mensagemDaApi =
                typeof data === "string" && data.trim() !== ""
                    ? data
                    : data?.mensagem || data?.title || "Não foi possível concluir a operação.";

            return Promise.reject(new ApiError(mensagemDaApi, status, data?.errors));
        }

        return Promise.reject(error);
    }
);

export function getApiErrorMessage(error: unknown){
    return error instanceof ApiError ? error.message : "Ocorreu um erro inesperado. Tente novamente."
}