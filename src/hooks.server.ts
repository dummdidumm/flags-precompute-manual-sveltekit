export function handle({ event, resolve }) {
	console.log('this is what I see', Object.entries([...event.request.headers]));
	return resolve(event);
}
