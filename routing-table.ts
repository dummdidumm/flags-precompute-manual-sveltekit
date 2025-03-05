export const routesWithVariants = new Set(['/']);

export function decide(pathname: string, flags: Record<string, string>) {
	if (pathname === '/') {
		return flags.homePageVariant === 'a' ? '/home-a' : '/home-b';
	}

	// Add more decisions here if needed

	return pathname;
}
