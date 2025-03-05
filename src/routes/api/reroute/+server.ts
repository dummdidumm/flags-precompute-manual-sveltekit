import { json } from '@sveltejs/kit';
import { decrypt, encrypt, reportValue } from '@vercel/flags';
import { FLAGS_SECRET } from '$env/static/private';

export async function GET({ cookies, setHeaders }) {
	// Retrieve cookies which contain the feature flags.
	const flags =
		(await decrypt<Record<string, any>>(cookies.get('flags') ?? '', FLAGS_SECRET)) ?? {};

	const flagUnset = !('homePageVariant' in flags);

	if (flagUnset) {
		// Fall back to random value if this is a new visitor
		flags.homePageVariant ||= Math.random() > 0.5 ? 'a' : 'b';

		// Set cookie to remember the feature flags for this visitor
		cookies.set('flags', await encrypt(flags, FLAGS_SECRET), { path: '/' });
	}

	// Report value for integration with Vercels logging etc
	reportValue('homePageVariant', flags.homePageVariant);

	// Add cache headers to not request the API as much (as the visitor id is not changing)
	setHeaders({ 'Cache-Control': 'private, max-age=300, stale-while-revalidate=600' });

	return json({ pathname: flags.homePageVariant === 'a' ? '/home-a' : '/home-b' });
}
