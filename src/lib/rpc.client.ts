export async function handleRequest(path: string, fn: string, args: unknown[]) {
	const response = await fetch(`/rpc/${path}/${fn}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		credentials: 'same-origin',
		body: JSON.stringify(args)
	});

	return await response.json();
}
