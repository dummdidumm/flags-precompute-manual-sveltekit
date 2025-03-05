# Features flags for ISR'd pages using SvelteKit

This repository shows how to manually implement feature flags on Vercel for pages that are ISR'd using SvelteKit.

Deployed example: https://flags-precompute-manual-sveltekit.vercel.app/

Prerequisites:

This example uses Vercel flags to en/decrypt feature flags. Make sure to have `FLAGS_SECRET` setup in your Vercel project and pull it to an `.env` file so you can work with it locally aswell. (Alternatively if that's none of your concern, you can remove that logic and no longer need that env variable).

Flow:

1. Request comes to `middleware.ts`. A flag cookie is looked up to see what value it is. For first time visitors the value is computed randomly.
2. Based on the cookie value and the URL a rewrite is determined (in this example, `/` goes either to `/home-a` or `/home-b`)
3. Request comes to ISR'd SvelteKit page, serving either `/home-a` or `/home-b`
4. Flag cookie is sent along with the response (it's set in `middleware.ts`, so ISR/SvelteKit itself never sees it, which is important), so revisiting user gets the same flag value
5. On the client, we make use of async `reroute` to request a server endpoint we created (that is not prerendered or ISR'd) which determines the route for us (using similar logic to that in `middleware.ts`)
