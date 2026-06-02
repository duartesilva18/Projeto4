import { PUBLIC_API_URL } from '$env/static/public';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	try {
		const res = await fetch(`${PUBLIC_API_URL}vagas/import/dges/formatos`);
		const text = await res.text();
		return new Response(text, {
			status: res.status,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (e) {
		console.error('Erro no endpoint import/dges/formatos', e);
		return new Response(JSON.stringify({ message: 'Erro interno' }), { status: 500 });
	}
}
