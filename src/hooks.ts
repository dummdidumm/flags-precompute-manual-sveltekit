import { browser } from '$app/environment';
import { reroute as _reroute, split_cookies } from '../reroute';

export function reroute({ url }) {
	// Don't run this on the server, as Vercel edge middleware + ISR will handle it already
	if (!browser) return;

	// On the client side, we gotta do rewrites based on flags similar to middleware.ts,
	// so that SvelteKit's router knows where to go
	return _reroute(url, split_cookies(document.cookie));
}
