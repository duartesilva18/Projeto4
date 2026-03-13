import { PUBLIC_API_URL } from '$env/static/public';

/** @type {import('./$types').RequestHandler} */
export async function POST() {
	try {
		const res = await fetch(PUBLIC_API_URL + 'vagas/novo-ano', {
			method: 'POST'
		});

		if (!res.ok) {
			return new Response('Erro ao criar novo ano letivo na API', { status: 500 });
		}

		const data = await res.json();
		return new Response(JSON.stringify(data), {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (e) {
		console.error('Erro no endpoint /api/vagas/novo-ano', e);
		return new Response('Erro interno', { status: 500 });
	}
}

