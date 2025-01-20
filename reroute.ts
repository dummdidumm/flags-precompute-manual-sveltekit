export function reroute(url: URL, flags: Record<string, string>) {
	if (url.pathname !== '/') return;

	const home_page_flag = flags['home-page-flag'];

	if (home_page_flag === 'a') {
		return '/home-a';
	} else {
		return '/home-b';
	}
}

export function split_cookies(cookies: string) {
	return cookies.split(';').reduce(
		(acc, cookie) => {
			const [name, value] = cookie.trim().split('=');
			acc[name] = value;
			return acc;
		},
		{} as Record<string, string>
	);
}
