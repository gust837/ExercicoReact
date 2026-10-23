/**
 * Converte a data que vem da API em um objeto Date.
 * Se a API mandar só a data ("2026-10-25"), o JavaScript a trataria como UTC
 * e, no Brasil (UTC-3), o evento apareceria um dia antes. Por isso, nesse caso,
 * montamos a data no fuso local.
 */
function converterData(valor: string) {
    const somenteData = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
    if (somenteData) {
        const [, ano, mes, dia] = somenteData;
        return new Date(Number(ano), Number(mes) - 1, Number(dia));
    }
    return new Date(valor);
}

/** Ex.: 25/10/2026 */
export function formatarDataCurta(valor: string) {
    return converterData(valor).toLocaleDateString("pt-BR");
}

/** Ex.: 25 de outubro de 2026 */
export function formatarDataLonga(valor: string) {
    return converterData(valor).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}

/** Timestamp da data, útil para ordenar e comparar. */
export function obterTempo(valor: string) {
    return converterData(valor).getTime();
}
