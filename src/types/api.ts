export interface TipoEvento {
    idTipoEvento: string;
    titulo: string;
}

export interface TipoUsuario {
    idTipoUsuario: string;
    titulo: string;

}

export interface Instituicao {
    idInstituicao: string;
    cnpj: string;
    nomeFantasia: string;
    endereco: string;
}

export interface Usuario {
    idUsuario: string;
    nome: string;
    email: string;
    idTipoUsuario: string;
    idTipoUsuarioNavigation?: TipoUsuario | null;
}

export interface Evento {
    idEvento: string
    nomeEvento: string
    descricao: string;
    dataEvento: string;
    imagemUrl?: string | null;
    idTipoEvento?: string | null;
    idInstituicao?: string | null;
    idTipoEventoNavigation?: TipoEvento | null;
    idInstituicaoNavigation?: Instituicao | null;
}

export interface Comentario{
    idComentario: string;
    descricao: string;
    dataComentario: string;
    exibe: boolean;
    idEvento: string;
    idUsuario?: string | null;
    idUsuarioNavigation: Usuario | null;
}

export interface Presenca {
    idPresenca: string;
    situacao: boolean;
    idEvento: string;
    idUsuario: string | null;
    idEventoNavigation?: Evento | null;
}

export interface LoginPayload{
    email: string;
    senha: string;
}

export interface LoginResponse{
    token: string;
    expiracao: string;
    usuario: Usuario;
}

export type AuthSession = LoginResponse;

export interface UsuarioPayload{
    nome: string;
    email: string;
    senha: string;
    idTipoUsuario: string | null;
}

export interface ComentarioPayload{
    descricao: string;
    idEvento: string;
    idUsuario: string;
}

export interface PresencaPayload {
    situacao: boolean;
    idEvento: string;
    idUsuario: string | null;
}
