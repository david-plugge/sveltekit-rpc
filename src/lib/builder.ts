/* eslint-disable @typescript-eslint/no-explicit-any */

type MaybePromise<T> = T | Promise<T>;
type Prettify<T> = { [K in keyof T]: T[K] } & {};
type Merge<A, B> = Omit<A, keyof B> & B;

type GenericContext = {
	[K: string]: any;
};

type GenericReturn = {
	type: string;
	[K: string]: any;
};

const DECORATE = Symbol('decorate');
type Decorate<T extends GenericContext> = {
	[DECORATE]: T;
};

function decorate<T extends GenericContext>(decorators: T) {
	return {
		[DECORATE]: decorators
	};
}

export function defineMiddleware<
	const LocalContext extends GenericContext,
	const LocalReturn extends GenericReturn = never
>(
	fn: (
		context: GenericContext,
		decorate: <T extends GenericContext>(decorators: T) => Decorate<T>
	) => MaybePromise<Decorate<LocalContext> | LocalReturn>
) {
	return fn;
}

export class RpcBuilder<
	Context extends GenericContext = { input: unknown },
	Return extends GenericReturn = never
> {
	#middleware: any[] = [];

	extend<LocalContext extends GenericContext, LocalReturn extends GenericReturn>(
		other: RpcBuilder<LocalContext, LocalReturn>
	) {
		const builder = new RpcBuilder<
			Prettify<Merge<Context, LocalContext>>,
			Return | (GenericReturn extends LocalReturn ? never : LocalReturn)
		>();
		builder.#middleware = [...this.#middleware, ...other.#middleware];
		return builder;
	}

	use<const LocalContext extends GenericContext, const LocalReturn extends GenericReturn = never>(
		fn: (
			context: Context,
			decorate: <T extends GenericContext>(decorators: T) => Decorate<T>
		) => MaybePromise<Decorate<LocalContext> | LocalReturn>
	): RpcBuilder<
		Prettify<Merge<Context, LocalContext>>,
		Return | (GenericReturn extends LocalReturn ? never : LocalReturn)
	>;
	use<const LocalContext extends GenericContext, const LocalReturn extends GenericReturn = never>(
		other: RpcBuilder<LocalContext, LocalReturn>
	): RpcBuilder<
		Prettify<Merge<Context, LocalContext>>,
		Return | (GenericReturn extends LocalReturn ? never : LocalReturn)
	>;
	use(mw: any): any {
		if (mw instanceof RpcBuilder) {
			const builder = new RpcBuilder();
			builder.#middleware = [...this.#middleware, ...mw.#middleware];
			return builder;
		}
		if (typeof mw === 'function') {
			const builder = new RpcBuilder();
			builder.#middleware = [...this.#middleware, mw];
			return builder;
		}

		throw new Error('invalid middleware');
	}

	create<const LocalReturn extends GenericReturn>(
		fn: (context: Context) => MaybePromise<LocalReturn>
	): (
		...args: [unknown] extends [Context['input']] ? [] : [input: Context['input']]
	) => Promise<Return | LocalReturn> {
		return async (...args: unknown[]) => {
			const context: any = {
				input: args[0]
			};

			for (const mw of this.#middleware) {
				const result = await mw(context, decorate);
				if (DECORATE in result) {
					Object.assign(context, result[DECORATE]);
				} else {
					return result;
				}
			}

			return fn(context);
		};
	}
}

export const rpc = new RpcBuilder();
