import { axiosInstance } from "./api";

import type {
    Presenca,
    Evento,
    EventoPayload,
    PresencaPayload,
    LoginPayload,
    LoginResponse,
    Usuario,
    Comentario,
    ComentarioPayload,
    UsuarioPayload,
    TipoEvento,
    TipoUsuario,
    Instituicao,
} from "../types/api";

// Padrão das rotas: nome do controller com inicial maiúscula e sem "/" no começo
// (o baseURL do axios já termina com "/api/").

function montarFormDataEvento(payload: EventoPayload) {
    const formData = new FormData();
    formData.append("NomeEvento", payload.nomeEvento);
    formData.append("Descricao", payload.descricao);
    formData.append("DataEvento", payload.dataEvento);
    formData.append("IdTipoEvento", payload.idTipoEvento);
    formData.append("IdInstituicao", payload.idInstituicao);
    if (payload.arquivoImagem) {
        formData.append("ArquivoImagem", payload.arquivoImagem);
    }
    return formData;
}

export const authService = {
    async login(payload: LoginPayload) {
        const { data } = await axiosInstance.post<LoginResponse>("Login", payload);
        return data;
    },
};

export const eventoService = {
    async listar() {
        const { data } = await axiosInstance.get<Evento[]>("Evento");
        return data;
    },

    async buscar(id: string) {
        const { data } = await axiosInstance.get<Evento>(`Evento/${id}`);
        return data;
    },

    async cadastrar(payload: EventoPayload) {
        const { data } = await axiosInstance.post<Evento>("Evento", montarFormDataEvento(payload));
        return data;
    },

    async atualizar(id: string, payload: EventoPayload) {
        const { data } = await axiosInstance.put<Evento>(`Evento/${id}`, montarFormDataEvento(payload));
        return data;
    },

    async excluir(id: string) {
        await axiosInstance.delete(`Evento/${id}`);
    },
};

export const comentarioService = {
    // O backend já devolve só os comentários do evento, com o autor, do mais recente ao mais antigo
    async listarPorEvento(idEvento: string) {
        const { data } = await axiosInstance.get<Comentario[]>(`Comentario/evento/${idEvento}`);
        return data;
    },

    // Comentários impróprios são recusados pela API com 400; a mensagem chega como ApiError
    async cadastrar(payload: ComentarioPayload) {
        const { data } = await axiosInstance.post<Comentario>("Comentario", payload);
        return data;
    },

    async excluir(id: string) {
        await axiosInstance.delete(`Comentario/${id}`);
    },
};

export const presencaService = {
    // O backend identifica o usuário pelo token JWT e devolve só as presenças dele
    async listarMinhas() {
        const { data } = await axiosInstance.get<Presenca[]>("Presenca/minhas");
        return data;
    },

    async cadastrar(payload: PresencaPayload) {
        const { data } = await axiosInstance.post<Presenca>("Presenca", payload);
        return data;
    },

    async excluir(id: string) {
        await axiosInstance.delete(`Presenca/${id}`);
    },
};

export const usuarioService = {
    async listar() {
        const { data } = await axiosInstance.get<Usuario[]>("Usuario");
        return data;
    },

    async cadastrar(payload: UsuarioPayload) {
        const { data } = await axiosInstance.post<Usuario>("Usuario", payload);
        return data;
    },

    async atualizar(id: string, payload: UsuarioPayload) {
        await axiosInstance.put(`Usuario/${id}`, payload);
    },

    async excluir(id: string) {
        await axiosInstance.delete(`Usuario/${id}`);
    },

    async buscar(id: string) {
        const { data } = await axiosInstance.get<Usuario>(`Usuario/${id}`);
        return data;
    },
};

export const instituicaoService = {
    async listar() {
        const { data } = await axiosInstance.get<Instituicao[]>("Instituicao");
        return data;
    },
};

function tipoService<T extends { titulo: string }>(endpoint: string) {
    return {
        async listar() {
            const { data } = await axiosInstance.get<T[]>(endpoint);
            return data;
        },

        async cadastrar(titulo: string) {
            const { data } = await axiosInstance.post<T[]>(endpoint, { titulo });
            return data;
        },

        async atualizar(id: string, titulo: string) {
            const { data } = await axiosInstance.put(`${endpoint}/${id}`, { titulo });
            return data;
        },

        async excluir(id: string) {
            const data = await axiosInstance.delete(`${endpoint}/${id}`);
            return data;
        },
    };
}

export const tipoUsuarioService = tipoService<TipoUsuario>("TipoUsuario");
export const tipoEventoService = tipoService<TipoEvento>("TipoEvento");
