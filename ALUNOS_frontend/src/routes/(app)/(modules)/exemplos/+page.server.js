import { redirect } from '@sveltejs/kit';

/** Redireciona /exemplos → /proposta-vagas (mantém query string). */
/** @type {import('./$types').PageServerLoad} */
export function load({ url }) {
	throw redirect(307, '/proposta-vagas' + url.search);
}
