import { rewrite, next } from '@vercel/edge';
import { reroute, split_cookies } from './reroute';

export default function middleware(request: Request) {
	// Retrieve cookies which contain the feature flag. Fall back to random value if this is a new visitor
	const home_page_flag =
		split_cookies(request.headers.get('cookie') ?? '')?.['home-page-flag'] ??
		(Math.random() > 0.5 ? 'a' : 'b');

	// Get destination URL based on the feature flag
	const result = reroute(new URL(request.url), {
		'home-page-flag': home_page_flag
	});

	if (!result) return next();

	return rewrite(result, {
		headers: {
			// Set a cookie to remember the feature flag for this visitor
			'Set-Cookie': `home-page-flag=${home_page_flag}; Path=/`
		}
	});
}
