// `reroute` is called on both the server and client during dev, because `middleware.ts` is unknown to SvelteKit.
// In production, for the `/` route it's called on the client only because `middleware.ts` will handle the first page visit.
// As a result, when visiting `/` you'll get rerouted accordingly on both dev and prod.
export async function reroute({ url }) {
	if (url.pathname === '/') {
		const result = await fetch(url.protocol + '//' + url.host + '/api/reroute').then((response) =>
			response.json()
		);
		return result.pathname;
	}
}
