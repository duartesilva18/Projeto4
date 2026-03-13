import { PUBLIC_API_URL } from "$env/static/public";
import { setupTranslations } from "./translations";

/** @type {import('./$types').PageServerLoad} */
export async function load({depends}) {
    setupTranslations();
	depends("exemplos:editoras")

	const editoras = await fetch(PUBLIC_API_URL + `exemplos/editoras`).then(d => d.json())

    return {
        editoras: editoras
    }
}