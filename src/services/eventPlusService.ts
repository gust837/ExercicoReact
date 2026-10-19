import { axiosInstance } from "./api";

import type {  Presenca,  Evento,  PresencaPayload,  LoginPayload,  LoginResponse,  Usuario,  Comentario,  ComentarioPayload,  MensagemModeracao } from "../types/api";

export const authService = {
    async login(payload: LoginPayload) {
        const {data} = await axiosInstance.post<LoginResponse>("Login", payload);
        return data;
    }
}

export const eventoService = {
    async listar(){
        const {data} = await axiosInstance.get<Evento[]>("evento");
        return data;
    },

    async listarProximos(){
        const {data} = await axiosInstance.get<Evento[]>("evento/proximos");
        return data; 
    },

    async buscar(id: string){
        const {data} = await axiosInstance.get<Evento>(`evento/${id}`);
        return data;
    }
}

export const comentarioService = {
    async listarPorEvento(idEvento: string){
        const {data} = await axiosInstance.get<Comentario[]>("Comentario");
        return data.filter(c => c.idEvento === idEvento);
    },

    async cadastrar(payload: ComentarioPayload){
        const {data} = await axiosInstance.post<Comentario | MensagemModeracao>("Comentario", payload);
        return data;
    }
}

export const presencaService = {
    async listarPorUsuario(idUsuario: string){
        const {data} = await axiosInstance.get<Presenca[]>("Presenca");
        return data.filter(p => p.idUsuario === idUsuario);
    },

    async cadastrar(payload: PresencaPayload){
        const {data} = await axiosInstance.post<Presenca>("/Presenca", payload);
        return data;
    },

    async excluir(id: string){
        await axiosInstance.delete(`Presenca/${id}`);
    }
}

export const usuarioService = {
    async buscar(id: string){
        const {data} = await axiosInstance.get<Usuario>(`Usuario/${id}`)
        return data;
    }
}