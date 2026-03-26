import { PUBLIC_API_URL } from '$env/static/public';

/** @type {import('./$types').RequestHandler} */
export async function PUT({ params }) {
	try {
		const res = await fetch(PUBLIC_API_URL + `vagas/ano/${params.anoInicio}/reset`, {
			method: 'PUT'
		});
		if (!res.ok) return new Response('Erro ao limpar dados do ano', { status: 500 });
		const data = await res.json();
		return new Response(JSON.stringify(data), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (e) {
		console.error('Erro PUT /api/vagas/ano/reset', e);
		return new Response('Erro interno', { status: 500 });
	}
}
