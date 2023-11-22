export const prerender = true;
export const entries = () => [''];

export async function GET() {
	// todo: Robots.txt
	return new Response('' + Math.random());
}
