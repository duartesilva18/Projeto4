import { PUBLIC_API_URL } from '$env/static/public';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }) {
	try {
		const formData = await request.formData();
		const res = await fetch(`${PUBLIC_API_URL}vagas/import/dges/preview`, {
			method: 'POST',
			headers: {
				// @ts-ignore
				Authorization: 'Bearer ' + (locals?.info_utili?.jwt_api ?? '')
			},
			body: formData
		});

		const text = await res.text();
		return new Response(text, {
			status: res.status,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (e) {
		console.error('Erro no endpoint import/dges/preview', e);
		return new Response(JSON.stringify({ message: 'Erro interno' }), { status: 500 });
	}
}
