import { PUBLIC_API_URL } from '$env/static/public';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, locals }) {
	try {
		const ano = url.searchParams.get('ano') ?? '';
		const res = await fetch(`${PUBLIC_API_URL}vagas/import/dges/historico?ano=${encodeURIComponent(ano)}`, {
			headers: {
				// @ts-ignore
				Authorization: 'Bearer ' + (locals?.info_utili?.jwt_api ?? ''),
				'Content-Type': 'application/json'
			}
		});

		const text = await res.text();
		return new Response(text, {
			status: res.status,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (e) {
		console.error('Erro no endpoint import/dges/historico', e);
		return new Response(JSON.stringify({ message: 'Erro interno' }), { status: 500 });
	}
}
