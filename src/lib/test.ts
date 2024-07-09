/* eslint-disable @typescript-eslint/no-explicit-any */
import SuperJSON from 'superjson';

class RpcTarget {
	get RPC() {
		return true;
	}
}

function getRpcMethods(obj: RpcTarget) {
	const proto = Object.getPrototypeOf(obj);
	const descriptors = Object.getOwnPropertyDescriptors(proto);
	const methods: string[] = [];

	for (const key in descriptors) {
		if (key === 'constructor') {
			continue;
		}

		if (typeof descriptors[key].value === 'function') {
			methods.push(key);
		}
	}

	return methods;
}

SuperJSON.registerCustom(
	{
		isApplicable(v): v is RpcTarget {
			return v instanceof RpcTarget;
		},
		serialize(v) {
			return {
				methods: getRpcMethods(v)
			};
		},
		deserialize(v) {
			const proxy: Record<string, (...args: unknown[]) => unknown> = {};

			for (const method of v.methods) {
				proxy[method] = (...args) => {
					console.log('AAHHH', args);
				};
			}

			return proxy as unknown as RpcTarget;
		}
	},
	'rpc-target'
);

class User extends RpcTarget {
	logout() {
		return 'hi';
	}
}

type Prettify<T> = { [K in keyof T]: T[K] } & {};

type StubFn<Fn> = Fn extends (...args: infer Args) => infer Return
	? (...args: Args) => Promise<Return>
	: never;

type UnwrapRpcTarget<T extends RpcTarget> = Prettify<{
	[K in keyof T as T[K] extends (...args: any[]) => any ? K : never]: StubFn<T[K]>;
}>;

type ParseData<T> = Prettify<{
	[K in keyof T]: T[K] extends RpcTarget ? UnwrapRpcTarget<T[K]> : ParseData<T[K]>;
}>;

const data = {
	user: new User(),
	arr: [{ user: new User() }]
};

const jsonString = SuperJSON.stringify(data);

const x: ParseData<typeof data> = SuperJSON.parse(jsonString);

x.arr[0].user.logout();
