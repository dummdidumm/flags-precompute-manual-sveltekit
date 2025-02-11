import { encrypt, decrypt, reportValue } from '@vercel/flags';

export const config = {
	matcher: ['/subpage*']
};

export async function middleware({ cookies, url, reroute }) {
	if (url.pathname !== '/') return;

	// Retrieve cookies which contain the feature flags.
	const flags = (await decrypt<Record<string, any>>(cookies.get('flags'))) ?? {};

	// Fall back to random value if this is a new visitor
	flags.homePageVariant ||= Math.random() > 0.5 ? 'a' : 'b';

	// Report value for integration with Vercels logging etc
	reportValue('homePageVariant', flags.homePageVariant);

	// Set a cookie to remember the feature flags for this visitor
	cookies.set('flags', await encrypt(flags), { path: '/' });

	return reroute(
		// Get destination URL based on the feature flag
		flags.homePageVariant === 'a' ? '/home-a' : '/home-b'
	);
}
