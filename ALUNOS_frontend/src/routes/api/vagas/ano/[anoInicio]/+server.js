import { PUBLIC_API_URL } from '$env/static/public';

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params }) {
	try {
		const res = await fetch(PUBLIC_API_URL + `vagas/ano/${params.anoInicio}`, {
			method: 'DELETE'
		});
		if (!res.ok) return new Response('Erro ao apagar ano', { status: 500 });
		const data = await res.json();
		return new Response(JSON.stringify(data), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (e) {
		console.error('Erro DELETE /api/vagas/ano/', e);
		return new Response('Erro interno', { status: 500 });
	}
}
