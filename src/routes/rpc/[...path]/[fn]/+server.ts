import { json } from '@sveltejs/kit';
import manifest from 'sveltekit-rpc/manifest';

export const POST = async ({ params: { path, fn }, request }) => {
	if (!path || !fn) return json({}, { status: 404 });

	const handler = manifest[path]?.[fn];
	if (!handler) return json({}, { status: 404 });

	const args: unknown[] = await request.json();

	const response = await handler(...args);

	return json(response);
};
