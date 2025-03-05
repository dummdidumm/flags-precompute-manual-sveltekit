import { next, rewrite } from '@vercel/edge';
import { parse } from 'cookie';
import { normalizeUrl } from '@sveltejs/kit';
import { encrypt, decrypt, reportValue } from '@vercel/flags';

export const config = {
	// Either run middleware on all but the internal asset paths ...
	// matcher: '/((?!_app/|favicon.ico|favicon.png).*)'
	// ... or only run it where you actually need it.
	matcher: '/'
};

export default async function middleware(request: Request) {
	const { url, denormalize } = normalizeUrl(request.url);

	// this part is only needed if you use the commented-out matcher above instead
	// if (url.pathname !== '/') return next();

	// Retrieve cookies which contain the feature flags.
	const flags =
		(await decrypt<Record<string, any>>(parse(request.headers.get('cookie') ?? '').flags)) ?? {};

	// Fall back to random value if this is a new visitor
	flags.homePageVariant ||= Math.random() > 0.5 ? 'a' : 'b';

	// Report value for integration with Vercels logging etc
	reportValue('homePageVariant', flags.homePageVariant);

	return rewrite(
		// Get destination URL based on the feature flag
		denormalize(flags.homePageVariant === 'a' ? '/home-a' : '/home-b'),
		{
			headers: {
				// Set a cookie to remember the feature flags for this visitor
				'Set-Cookie': `flags=${encrypt(flags)}; Path=/`
			}
		}
	);
}

// x-sveltekit-vercel-rewrite
