import { PUBLIC_API_URL } from '$env/static/public';

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ params, request }) {
	try {
		const body = await request.json();
		const res = await fetch(`${PUBLIC_API_URL}vagas/reingresso-mudanca/${params.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});

		if (!res.ok) {
			return new Response('Erro ao guardar reingresso/mudança na API', { status: res.status });
		}

		const data = await res.json().catch(() => ({}));
		return new Response(JSON.stringify(data), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (e) {
		console.error('Erro no endpoint /api/vagas/reingresso-mudanca/:id', e);
		return new Response('Erro interno', { status: 500 });
	}
}

