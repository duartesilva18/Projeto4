import { PUBLIC_API_URL } from '$env/static/public';

/** @type {import('./$types').PageServerLoad} */
export const load = async () => {
	try {
		const res = await fetch(PUBLIC_API_URL + 'vagas/anos');
		if (!res.ok) return { anos: [] };
		const anos = await res.json();
		return { anos };
	} catch {
		return { anos: [] };
	}
};
