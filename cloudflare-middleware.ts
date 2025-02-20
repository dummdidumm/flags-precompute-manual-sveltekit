import { normalizeUrl } from '@sveltejs/kit';

export async function onRequest({ request, next }) {
	if (request.url.includes('/middleware')) return new Response('Hello from middleware!');

	const { url, denormalize } = normalizeUrl(request.url);

	console.log('hi there!', url.pathname);
	if (url.pathname !== '/') return next();

	// Retrieve cookies which contain the feature flags.
	let flag = split_cookies(request.headers.get('cookie') ?? '')?.['flags'];

	// Fall back to random value if this is a new visitor
	flag ||= Math.random() > 0.5 ? 'a' : 'b';

	// Get destination URL based on the feature flag
	request = new Request(denormalize(flag === 'a' ? '/home-a' : '/home-b'), request);

	const response = await next(request);

	// Set a cookie to remember the feature flags for this visitor
	response.headers.set('Set-Cookie', `flags=${flag}; Path=/`);

	return response;
}

function split_cookies(cookies: string) {
	return cookies.split(';').reduce(
		(acc, cookie) => {
			const [name, value] = cookie.trim().split('=');
			acc[name] = value;
			return acc;
		},
		{} as Record<string, string>
	);
}
