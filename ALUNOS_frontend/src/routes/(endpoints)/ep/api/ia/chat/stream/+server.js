import { PUBLIC_API_URL } from '$env/static/public';

/** Reencaminha o stream SSE do backend (chat IA) diretamente para o browser. */
/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }) {
	try {
		const body = await request.json();
		const res = await fetch(`${PUBLIC_API_URL}ia/chat/stream`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				// @ts-ignore
				Authorization: 'Bearer ' + (locals?.info_utili?.jwt_api ?? '')
			},
			body: JSON.stringify(body)
		});

		if (!res.ok || !res.body) {
			const text = await res.text().catch(() => '');
			return new Response(text || JSON.stringify({ message: 'Erro no chat' }), {
				status: res.status || 502,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		return new Response(res.body, {
			status: 200,
			headers: {
				'Content-Type': 'text/event-stream; charset=utf-8',
				'Cache-Control': 'no-cache, no-transform'
			}
		});
	} catch (e) {
		console.error('Erro no endpoint ia/chat/stream', e);
		return new Response(JSON.stringify({ message: 'Erro interno' }), { status: 500 });
	}
}
