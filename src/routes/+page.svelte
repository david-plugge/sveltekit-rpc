<script lang="ts">
	import { useRpc } from '$lib/svelte/index.svelte.js';
	import { test } from './test.rpc.js';

	let username = $state('');
	const testtest = useRpc(test);

	function preventDefault<T extends Event, Return>(fn: (event: T) => Return): (event: T) => Return {
		return (e: T) => {
			e.preventDefault();
			return fn(e);
		};
	}
</script>

<div class="mx-auto my-16 max-w-xl">
	<form onsubmit={preventDefault(() => testtest.mutate({ username }))} class="flex flex-col gap-2">
		<input class="rounded border px-3 py-2" type="text" bind:value={username} />

		<button class="rounded bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">Submit</button>
	</form>

	{#if testtest.isLoading}
		<div>Loading...</div>
	{:else if testtest.result}
		<pre>{JSON.stringify(testtest.result, null, 2)}</pre>
	{/if}
</div>
