export async function reroute({ url }) {
	if (url.pathname === '/') {
		const result = await fetch(url.protocol + '//' + url.host + '/api/reroute').then((response) =>
			response.json()
		);
		return result.pathname;
	}
}
