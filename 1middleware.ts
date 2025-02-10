import { next } from '@vercel/edge';
import { encrypt, decrypt, reportValue } from '@vercel/flags';
// import { createMiddlewareHelpers } from '@sveltejs/adapter-vercel/middleware';

const { matcher, normalizeUrl } = createMiddlewareHelpers();

export const config = { matcher };

export default async function middleware(request: Request) {
	return new Response('Hello from middleware!');
	const { normalized, rewrite } = normalizeUrl(request.url);

	if (normalized.pathname !== '/') return next();

	// Retrieve cookies which contain the feature flags.
	const flags =
		(await decrypt<Record<string, any>>(
			split_cookies(request.headers.get('cookie') ?? '')?.['flags']
		)) ?? {};

	// Fall back to random value if this is a new visitor
	flags.homePageVariant ||= Math.random() > 0.5 ? 'a' : 'b';

	// Report value for integration with Vercels logging etc
	reportValue('homePageVariant', flags.homePageVariant);

	return rewrite(
		// Get destination URL based on the feature flag
		flags.homePageVariant === 'a' ? '/home-a' : '/home-b',
		{
			headers: {
				// Set a cookie to remember the feature flags for this visitor
				'Set-Cookie': `flags=${encrypt(flags)}; Path=/`
			}
		}
	);
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

import { rewrite } from '@vercel/edge';

/**
 * @type {typeof import('./middleware.js').createMiddlewareHelpers}
 */
function createMiddlewareHelpers({ appDir = '_app', base = '' } = {}) {
	const matcher = `^(?!${base}/${appDir}/immutable).*`;

	// the following internal helpers are basically a copy-paste of kit/src/runtime/pathname.js
	const DATA_SUFFIX = '/__data.json';
	const HTML_DATA_SUFFIX = '.html__data.json';

	/** @param {string} pathname */
	function has_data_suffix(pathname) {
		return pathname.endsWith(DATA_SUFFIX) || pathname.endsWith(HTML_DATA_SUFFIX);
	}

	/** @param {string} pathname */
	function add_data_suffix(pathname) {
		if (pathname.endsWith('.html')) return pathname.replace(/\.html$/, HTML_DATA_SUFFIX);
		return pathname.replace(/\/$/, '') + DATA_SUFFIX;
	}

	/** @param {string} pathname */
	function strip_data_suffix(pathname) {
		if (pathname.endsWith(HTML_DATA_SUFFIX)) {
			return pathname.slice(0, -HTML_DATA_SUFFIX.length) + '.html';
		}

		return pathname.slice(0, -DATA_SUFFIX.length);
	}

	const ROUTE_PREFIX = `${base}/${appDir}/route`;

	/**
	 * @param {string} pathname
	 * @returns {boolean}
	 */
	function has_resolution_prefix(pathname) {
		return pathname === `${ROUTE_PREFIX}.js` || pathname.startsWith(`${ROUTE_PREFIX}/`);
	}

	/**
	 * Convert a regular URL to a route to send to SvelteKit's server-side route resolution endpoint
	 * @param {string} pathname
	 * @returns {string}
	 */
	function add_resolution_prefix(pathname) {
		let normalized = pathname.slice(base.length);
		if (normalized.endsWith('/')) normalized = normalized.slice(0, -1);

		return `${ROUTE_PREFIX}${normalized}.js`;
	}

	/**
	 * @param {string} pathname
	 * @returns {string}
	 */
	function strip_resolution_prefix(pathname) {
		return base + (pathname.slice(ROUTE_PREFIX.length, -3) || '/');
	}

	return {
		matcher,
		normalizeUrl: (url) => {
			let normalized = new URL(url);

			const is_route_resolution = has_resolution_prefix(normalized.pathname);
			const is_data_request = has_data_suffix(normalized.pathname);

			if (is_route_resolution) {
				normalized.pathname = strip_resolution_prefix(normalized.pathname);
			} else if (is_data_request) {
				normalized.pathname = strip_data_suffix(normalized.pathname);
			}

			return {
				normalized,
				rewrite: (destination, init) => {
					const rewritten = new URL(destination, url);

					if (rewritten.hostname === normalized.hostname) {
						if (is_route_resolution) {
							rewritten.pathname = add_resolution_prefix(rewritten.pathname);
						} else if (is_data_request) {
							rewritten.pathname = add_data_suffix(rewritten.pathname);
						}

						init ||= {};
						init.headers = new Headers(init.headers);
						init.headers.set('x-sveltekit-vercel-rewrite', rewritten.pathname);
					}

					return rewrite(rewritten, init);
				}
			};
		}
	};
}
