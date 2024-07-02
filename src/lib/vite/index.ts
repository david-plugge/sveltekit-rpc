import type { Plugin } from 'vite';
import { fdir } from 'fdir';
import picomatch from 'picomatch';
import path from 'path';
import { getExports } from './getExports.js';

const MANIFEST_ID = 'sveltekit-rpc/manifest';

export interface SvelteKitRpcOptions {
	baseDir?: string;
	pattern?: string;
	client?: string;
}

export default function sveltekitRpc({
	baseDir = 'src',
	pattern = '*.rpc.*',
	client = 'src/lib/rpc.client.ts'
}: SvelteKitRpcOptions = {}): Plugin {
	let root: string;

	let crawler: fdir;
	let isMatch: picomatch.Matcher;

	return {
		name: 'vite-plugin-sveltekit-rpc',
		enforce: 'pre',

		configResolved(config) {
			root = config.root;

			const globPattern = path.join(root, baseDir, '**', `${pattern}`);

			crawler = new fdir().glob(globPattern).withPathSeparator('/').withFullPaths();
			isMatch = picomatch(globPattern);
			client = path.resolve(root, client);
		},

		resolveId(source) {
			if (source === MANIFEST_ID) {
				return `virtual:${MANIFEST_ID}`;
			}
		},

		async load(id) {
			if (id !== `virtual:${MANIFEST_ID}`) return;

			const items = await crawler.crawl(root).withPromise();

			const lines: string[] = [];

			items.forEach((id, i) => {
				lines.push(`import * as i${i} from '${id}';`);
			});

			lines.push(`export default {`);
			items.forEach((id, i) => {
				lines.push(`\t'${idToPath(id)}': i${i}`);
			});
			lines.push('};');

			return lines.join('\n');
		},

		async transform(code, id, options) {
			if (options?.ssr) return;
			if (!isMatch(id)) return;

			const lines: string[] = [];

			lines.push(`import { handleRequest as __handleRequest__ } from '${client}'`);

			getExports(code).forEach((name) => {
				lines.push(
					`export const ${name} = (...args) => __handleRequest__('${idToPath(id)}', '${name}', args);`
				);
			});

			return lines.join('\n');
		}
	};

	function idToPath(id: string) {
		const { dir, name } = path.posix.parse(path.relative(path.join(root, baseDir), id));
		return `${path.join(dir, name)}`;
	}
}
