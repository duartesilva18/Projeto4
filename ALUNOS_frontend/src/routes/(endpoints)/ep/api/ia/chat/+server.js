import { PUBLIC_API_URL } from '$env/static/public';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }) {
	try {
		const body = await request.json();
		const res = await fetch(`${PUBLIC_API_URL}ia/chat`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				// @ts-ignore
				Authorization: 'Bearer ' + (locals?.info_utili?.jwt_api ?? '')
			},
			body: JSON.stringify(body)
		});

		const text = await res.text();
		return new Response(text, {
			status: res.status,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (e) {
		console.error('Erro no endpoint ia/chat', e);
		return new Response(JSON.stringify({ message: 'Erro interno' }), { status: 500 });
	}
}
