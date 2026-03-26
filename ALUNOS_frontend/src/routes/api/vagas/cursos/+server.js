import { PUBLIC_API_URL } from '$env/static/public';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	try {
		const res = await fetch(PUBLIC_API_URL + 'vagas/cursos');
		if (!res.ok) return new Response('Erro ao listar cursos', { status: 500 });
		const data = await res.json();
		return new Response(JSON.stringify(data), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (e) {
		console.error('Erro GET /api/vagas/cursos', e);
		return new Response('Erro interno', { status: 500 });
	}
}
