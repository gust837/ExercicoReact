import { axiosInstance } from "./api";

import { type Presenca, type Evento, type PresencaPayload, type LoginPayload, type LoginResponse, type Usuario, type Comentario, type ComentarioPayload, type UsuarioPayload,type TipoEvento, type TipoUsuario } from "../types/api";
// Padrão das rotas: nome do controller com inicial maiúscula e sem "/" no começo
// (o baseURL do axios já termina com "/api/").

export const authService = {
    async login(payload: LoginPayload) {
        const { data } = await axiosInstance.post<LoginResponse>("Login", payload);
        return data;
    }
}

export const eventoService = {
    async listar() {
        const { data } = await axiosInstance.get<Evento[]>("Evento");
        return data;
    },

    async buscar(id: string) {
        const { data } = await axiosInstance.get<Evento>(`Evento/${id}`);
        return data;
    }
}

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
    }
}

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
    }
}

export const usuarioService = {

    async listar(){
        const {data} = await axiosInstance.get<Usuario[]>("Usuario");
        return data;
    },

    async cadastrar(payload: UsuarioPayload){
        const {data} = await axiosInstance.post<Usuario>("Usuario", payload);
        return data;
    },

    async atualizar(id: string, payload: UsuarioPayload){
        await axiosInstance.put(`Usuario/${id}`, payload)
    },

    async excluir(id: string){
        await axiosInstance.delete(`Usuario/${id}`);
    },

    async buscar(id: string) {
        const { data } = await axiosInstance.get<Usuario>(`Usuario/${id}`);
        return data;
    }
}

function tipoService<T extends {titulo: string}>(endpoint: string){
    return{
        async listar(){
            const { data } = await axiosInstance.get<T[]>(endpoint);
            return data;
        },

        async cadastrasr(titulo: string){
            const {data} = await axiosInstance.post<T[]>(endpoint, {titulo});
            return data;
        },

        async atualizar(id: string, titulo: string){
            const {data} = await axiosInstance.put(`${endpoint}/${id}`, {titulo});
            return data;
        },

        async excluir(id: string){
            const data = await axiosInstance.delete(`${endpoint}/${id}`);
            return data;
        }
    }
}

export const tipoUsuarioService = tipoService<TipoUsuario>("TipoUsuario")