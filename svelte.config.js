import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		paths: { relative: false },
		router: {
			// By using server-side route resolution we're making sure that every navigation first goes through the
			// backend to check where to go to, which gives us the ability to intercept these in middleware.
			resolution: 'server'
		}
	}
};

export default config;
