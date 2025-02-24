export default async function middleware(request, { next, cookies }) {
	const url = new URL(request.url);
	console.log('invoked', url.pathname);

	if (url.pathname !== '/') return next();

	// Retrieve feature flag from cookies
	let flag = cookies.get('homePageVariant');

	// Fall back to random value if this is a new visitor
	flag ||= Math.random() > 0.5 ? 'a' : 'b';

	// Set a cookie to remember the feature flags for this visitor
	cookies.set('homePageVariant', flag);

	// Get destination URL based on the feature flag
	return new URL(flag === 'a' ? '/home-a' : '/home-b', url);
}
