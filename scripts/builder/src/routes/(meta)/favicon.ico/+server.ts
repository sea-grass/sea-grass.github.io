import { error } from '@sveltejs/kit';

export async function GET() {
	// TODO: favicon.ico
	throw error(404);
}
