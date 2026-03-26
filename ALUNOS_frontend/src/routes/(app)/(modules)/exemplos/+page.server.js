import { PUBLIC_API_URL } from "$env/static/public";
import { setupTranslations } from "./translations";

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    setupTranslations();

    const fetchJson = async (path) => {
        try {
            const res = await fetch(PUBLIC_API_URL + path);
            if (res.ok) {
                const data = await res.json();
                return Array.isArray(data) ? data : [];
            }
        } catch (e) {
            console.error(`Erro a carregar ${path}`, e);
        }
        return [];
    };

    const [linhas, escolas, cursos] = await Promise.all([
        fetchJson("vagas/tabela"),
        fetchJson("vagas/escolas"),
        fetchJson("vagas/cursos")
    ]);

    return { linhas, escolas, cursos };
}