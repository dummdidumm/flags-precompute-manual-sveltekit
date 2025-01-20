# Features flags for ISR'd pages using SvelteKit

This repository shows how to manually implement feature flags on Vercel for pages that are ISR'd using SvelteKit.

Flow:

1. Request comes to `middleware.ts`. A flag cookie is looked up to see what value it is. For first time visitors the value is computed randomly.
2. Based on the cookie value and the URL a rewrite is determined (in this example, `/` goes either to `/home-a` or `/home-b`)
3. Request comes to ISR'd SvelteKit page, serving either `/home-a` or `/home-b`
4. Flag cookie is sent along with the response (it's set in `middleware.ts`, so ISR/SvelteKit itself never sees it, which is important), so revisiting user gets the same flag value
5. On client side navigation changes, SvelteKit's `reroute` hook in `hooks.ts` is invoked, also reading from that cookie to determine where to go to when navigating to `/`
