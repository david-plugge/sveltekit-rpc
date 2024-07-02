/* eslint-disable @typescript-eslint/no-explicit-any */
import type { GenericResult } from '$lib/types.js';

type State = 'idle' | 'loading' | 'done';

interface Options<Input, Result extends GenericResult> {
	onResult: (result: Result, input: Input) => void;
	on: {
		[K in Result['type']]: (result: Extract<Result, { type: K }>, input: Input) => void;
	};
}

export function useRpc<Input, Result extends GenericResult>(
	rpc: (input: Input) => Promise<Result>,
	options?: Options<Input, Result>
) {
	let currentState = $state<State>('idle');
	let result = $state<Result | null>(null);

	return {
		get state() {
			return currentState;
		},
		get isIdle() {
			return currentState === 'idle';
		},
		get isLoading() {
			return currentState === 'loading';
		},
		get isDone() {
			return currentState === 'done';
		},
		get result() {
			return result;
		},
		async mutate(input: Input, localOptions?: Options<Input, Result>) {
			currentState = 'loading';
			result = await rpc(input);

			localOptions?.onResult(result, input);
			options?.onResult(result, input);

			localOptions?.on?.[result.type as Result['type']]?.(result as any, input);
			options?.on?.[result.type as Result['type']]?.(result as any, input);

			currentState = 'done';

			return result;
		}
	};
}
