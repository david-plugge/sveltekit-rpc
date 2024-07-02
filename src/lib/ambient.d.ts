declare module 'sveltekit-rpc/manifest' {
	declare const manifest: Record<string, Record<string, (...args: unknown[]) => unknown>>;
	export default manifest;
}
