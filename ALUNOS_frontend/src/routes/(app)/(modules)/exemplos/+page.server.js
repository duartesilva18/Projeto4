import { PUBLIC_API_URL } from "$env/static/public";
import { setupTranslations } from "./translations";

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    setupTranslations();

    // Ir buscar sempre um array (nunca null) à API de vagas
    let linhas = [];
    try {
        const res = await fetch(PUBLIC_API_URL + "vagas/tabela");
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
                linhas = data;
            }
        }
    } catch (e) {
        // Se der erro na API, mantemos linhas = []
        console.error("Erro a carregar vagas/tabela", e);
    }

    return {
        linhas
    };
}