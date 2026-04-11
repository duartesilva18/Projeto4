import { redirect } from '@sveltejs/kit';

/** Redireciona /exemplos/... → /proposta-vagas/... */
/** @type {import('./$types').PageServerLoad} */
export function load({ params, url }) {
	const tail = params.rest;
	const path = Array.isArray(tail) ? tail.join('/') : tail ?? '';
	throw redirect(307, `/proposta-vagas/${path}` + url.search);
}
