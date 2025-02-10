export async function middleware({ cookies, url, reroute }) {
	if (url.pathname !== '/') return;

	// Retrieve cookies which contain the feature flags.
	// const flags = (await decrypt<Record<string, any>>(cookies.get('flags'))) ?? {};
	const flag = cookies.get('homePageVariant') || (Math.random() > 0.5 ? 'a' : 'b');

	// Set a cookie to remember the feature flags for this visitor
	cookies.set('homePageVariant', flag, { path: '/' });

	return reroute(
		// Get destination URL based on the feature flag
		flag === 'a' ? '/home-a' : '/home-b'
	);
}
