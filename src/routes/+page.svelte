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

<form onsubmit={preventDefault(() => testtest.mutate({ username }))}>
	<input type="text" bind:value={username} />

	{#if testtest.isLoading}
		<div>Loading...</div>
	{:else if testtest.result}
		<pre>{JSON.stringify(testtest.result.type, null, 2)}</pre>
	{/if}

	<button>Submit</button>
</form>
