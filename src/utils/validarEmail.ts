interface DnsAnswer {
    name: string;
    type: number;
    data: string;
}

interface DnsResponse {
    Status: number;
    Answer?: DnsAnswer[];
}

/**
 * Normaliza textos para comparação insensível a maiúsculas/minúsculas,
 * acentos e espaços extras (ex.: "  FEIRA  " === "Feira" === "feira").
 */
export function normalizarTexto(texto: string): string {
    return texto
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
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

// Erros de digitação comuns em provedores populares e institucionais
const SUGESTOES_DOMINIO: Record<string, string> = {
    "gamil.com": "gmail.com",
    "gmial.com": "gmail.com",
    "gmai.com": "gmail.com",
    "gmaill.com": "gmail.com",
    "ggmail.com": "gmail.com",
    "gmal.com": "gmail.com",
    "gmail.con": "gmail.com",
    "gmail.co": "gmail.com",
    "gmail.com.br": "gmail.com",
    "hotmal.com": "hotmail.com",
    "hotmial.com": "hotmail.com",
    "hotmaill.com": "hotmail.com",
    "hotmail.con": "hotmail.com",
    "outlok.com": "outlook.com",
    "outllok.com": "outlook.com",
    "outlookk.com": "outlook.com",
    "outlook.con": "outlook.com",
    "yaho.com": "yahoo.com",
    "yahooo.com": "yahoo.com",
    "senai.aluno.br": "aluno.senai.br",
    "senai.docente.br": "docente.senai.br",
    "aluno.senai.com": "aluno.senai.br",
    "sp.senai.com": "sp.senai.br",
};

// Provedores conhecidos que só existem em extensões específicas
const PROVEDORES_OFICIAIS: Record<string, string[]> = {
    gmail: ["gmail.com"],
    googlemail: ["googlemail.com"],
    hotmail: ["hotmail.com", "hotmail.com.br", "hotmail.co.uk", "hotmail.fr", "hotmail.es"],
    outlook: ["outlook.com", "outlook.com.br", "outlook.pt"],
    live: ["live.com", "live.com.br"],
    icloud: ["icloud.com"],
    yahoo: ["yahoo.com", "yahoo.com.br"],
    uol: ["uol.com.br"],
    bol: ["bol.com.br"],
    terra: ["terra.com.br"],
};

// Palavras de teste ou inválidas na parte local do e-mail (antes do @)
const USUARIOS_TESTE_BLOQUEADOS = new Set([
    "teste",
    "test",
    "admin",
    "administrador",
    "usuario",
    "user",
    "fake",
    "falso",
    "nenhum",
    "nadaver",
    "qqcoisa",
    "qualquercoisa",
    "asdf",
    "asdfgh",
    "asdfghjkl",
    "qwerty",
    "qwertyuiop",
    "zxcvbn",
    "123456",
    "12345678",
]);

const REGEX_EMAIL_ESTRITO =
    /^[a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,10}$/;

function calcularDistanciaEdicao(a: string, b: string): number {
    const matriz: number[][] = Array.from({ length: a.length + 1 }, () =>
        Array(b.length + 1).fill(0)
    );
    for (let i = 0; i <= a.length; i++) matriz[i][0] = i;
    for (let j = 0; j <= b.length; j++) matriz[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const custo = a[i - 1] === b[j - 1] ? 0 : 1;
            matriz[i][j] = Math.min(
                matriz[i - 1][j] + 1,
                matriz[i][j - 1] + 1,
                matriz[i - 1][j - 1] + custo
            );
        }
    }
    return matriz[a.length][b.length];
}

function pareceDigitacaoAleatoria(usuarioLocal: string): boolean {
    const apenasLetras = usuarioLocal.replace(/[^a-z]/g, "");
    if (apenasLetras.length < 2) return true;

    // 4 ou mais caracteres idênticos seguidos (ex.: "aaaa", "1111")
    if (/(.)\1{3,}/.test(usuarioLocal)) return true;

    // 5 ou mais consoantes seguidas sem nenhuma vogal (ex.: "ufhruiheuirhfui", "sdfghjk")
    if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(apenasLetras)) return true;

    // Sequências longas alternando apenas 2 ou 3 letras do meio do teclado (ex.: "ufhruih...")
    if (apenasLetras.length >= 10) {
        const letrasUnicas = new Set(apenasLetras.split("")).size;
        if (letrasUnicas <= 4) return true;
        const vogais = (apenasLetras.match(/[aeiou]/g) || []).length;
        const proporcaoVogais = vogais / apenasLetras.length;
        if (proporcaoVogais < 0.15 || proporcaoVogais > 0.8) return true;
    }

    return false;
}

async function consultarMxDns(dominio: string): Promise<boolean | null> {
    const urls = [
        `https://dns.google/resolve?name=${encodeURIComponent(dominio)}&type=MX`,
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(dominio)}&type=MX`,
    ];

    for (const url of urls) {
        try {
            const resposta = await fetch(url, {
                headers: { Accept: "application/dns-json" },
            });
            if (!resposta.ok) continue;

            const dados = (await resposta.json()) as DnsResponse;
            if (dados.Status !== 0) return false;

            const registrosMx =
                dados.Answer?.filter(
                    (registro) =>
                        registro.type === 15 &&
                        Boolean(registro.data) &&
                        registro.data.trim() !== "0 ."
                ) ?? [];

            return registrosMx.length > 0;
        } catch {
            // Tenta o próximo provedor DNS
        }
    }

    return null;
}

/**
 * Valida a sintaxe do e-mail, detecta digitação aleatória/falsa,
 * bloqueia domínios fictícios ou com erro de digitação e consulta
 * servidores DNS (Google e Cloudflare) para confirmar que o domínio recebe e-mails.
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

    const usuarioSemNumeros = usuarioLocal.replace(/[0-9._+-]/g, "");
    if (
        USUARIOS_TESTE_BLOQUEADOS.has(usuarioLocal) ||
        USUARIOS_TESTE_BLOQUEADOS.has(usuarioSemNumeros) ||
        pareceDigitacaoAleatoria(usuarioLocal)
    ) {
        return "Informe um endereço de e-mail real e válido (evite textos de teste ou caracteres aleatórios).";
    }

    if (SUGESTOES_DOMINIO[dominio]) {
        return `Domínio inválido. Você quis dizer @${SUGESTOES_DOMINIO[dominio]}?`;
    }

    if (DOMINIOS_BLOQUEADOS.has(dominio)) {
        return `O domínio @${dominio} não é permitido. Use um e-mail real (Gmail, Outlook, institucional, etc.).`;
    }

    // Verifica se o nome principal do domínio é um erro de digitação de um grande provedor (ex.: "gmaill", "hotmaill")
    const primeiroPedacoDominio = dominio.split(".")[0];
    for (const [provedor, dominiosValidos] of Object.entries(PROVEDORES_OFICIAIS)) {
        if (primeiroPedacoDominio === provedor) {
            if (!dominiosValidos.includes(dominio)) {
                return `O domínio @${dominio} é inválido. Você quis dizer @${dominiosValidos[0]}?`;
            }
        } else if (
            Math.abs(primeiroPedacoDominio.length - provedor.length) <= 2 &&
            calcularDistanciaEdicao(primeiroPedacoDominio, provedor) === 1
        ) {
            return `Domínio "@${dominio}" parece conter um erro de digitação. Você quis dizer @${dominiosValidos[0]}?`;
        }
    }

    // Verifica em tempo real no DNS (Google + Cloudflare) se o domínio possui servidores de e-mail (MX) ativos
    const possuiMx = await consultarMxDns(dominio);
    if (possuiMx === false) {
        return `O domínio "@${dominio}" não existe ou não recebe e-mails. Verifique se digitou corretamente.`;
    }

    return null;
}
