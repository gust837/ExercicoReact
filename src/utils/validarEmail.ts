interface DnsAnswer {
    name: string;
    type: number;
    data: string;
}

interface DnsResponse {
    Status: number;
    Answer?: DnsAnswer[];
}

// Domínios fictícios, de teste ou temporários que não devem ser aceitos em cadastros reais
const DOMINIOS_BLOQUEADOS = new Set([
    "email.com",
    "teste.com",
    "teste.com.br",
    "test.com",
    "example.com",
    "exemplo.com",
    "exemplo.com.br",
    "fake.com",
    "falso.com",
    "asd.com",
    "asdf.com",
    "qwerty.com",
    "mailinator.com",
    "tempmail.com",
    "10minutemail.com",
    "yopmail.com",
    "guerrillamail.com",
    "trashmail.com",
    "sharklasers.com",
]);

// Erros de digitação comuns em provedores populares
const SUGESTOES_DOMINIO: Record<string, string> = {
    "gamil.com": "gmail.com",
    "gmial.com": "gmail.com",
    "gmai.com": "gmail.com",
    "gmail.con": "gmail.com",
    "gmail.com.br": "gmail.com",
    "hotmal.com": "hotmail.com",
    "hotmial.com": "hotmail.com",
    "hotmail.con": "hotmail.com",
    "outlok.com": "outlook.com",
    "outllok.com": "outlook.com",
    "outlook.con": "outlook.com",
    "yaho.com": "yahoo.com",
    "yahooo.com": "yahoo.com",
};

const REGEX_EMAIL_ESTRITO =
    /^[a-zA-Z0-9._%+-]{2,}@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

/**
 * Valida a sintaxe do e-mail, bloqueia domínios fictícios/descartáveis
 * e consulta o DNS público (Google DNS-over-HTTPS) para confirmar que o
 * domínio realmente existe e possui servidor de e-mail (registro MX) ativo.
 */
export async function validarEmailReal(email: string): Promise<string | null> {
    const limpo = email.trim().toLowerCase();

    if (!limpo) {
        return "Informe um endereço de e-mail.";
    }

    if (!REGEX_EMAIL_ESTRITO.test(limpo)) {
        return "Digite um e-mail válido (ex.: seu.nome@gmail.com).";
    }

    const [usuarioLocal, dominio] = limpo.split("@");

    if (
        !usuarioLocal ||
        usuarioLocal.startsWith(".") ||
        usuarioLocal.endsWith(".") ||
        usuarioLocal.includes("..")
    ) {
        return "O formato do nome de usuário antes do @ é inválido.";
    }

    if (SUGESTOES_DOMINIO[dominio]) {
        return `Domínio inválido. Você quis dizer @${SUGESTOES_DOMINIO[dominio]}?`;
    }

    if (DOMINIOS_BLOQUEADOS.has(dominio)) {
        return `O domínio @${dominio} é apenas para testes ou temporário. Use um e-mail real (Gmail, Outlook, institucional, etc.).`;
    }

    // Verifica em tempo real no DNS se o domínio possui servidores de e-mail (MX) válidos
    try {
        const resposta = await fetch(
            `https://dns.google/resolve?name=${encodeURIComponent(dominio)}&type=MX`
        );

        if (resposta.ok) {
            const dados = (await resposta.json()) as DnsResponse;
            const registrosMx =
                dados.Answer?.filter(
                    (registro) =>
                        registro.type === 15 &&
                        registro.data &&
                        registro.data.trim() !== "0 ."
                ) ?? [];

            if (dados.Status !== 0 || registrosMx.length === 0) {
                return `O domínio "@${dominio}" não existe ou não recebe e-mails. Verifique se digitou corretamente.`;
            }
        }
    } catch {
        // Caso o usuário esteja em uma rede que bloqueie a consulta DNS externa, mantém as validações locais
    }

    return null;
}
