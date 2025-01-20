import type { Config } from '@sveltejs/adapter-vercel';

// Use ISR to cache the result (and also to get rewrite from middleware.ts to work).
// Alternatively you could use `export prerender = true` for fully static content that rarely needs redeploys.
export const config: Config = {
	isr: {
		expiration: 60
	}
};
