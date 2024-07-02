<script lang="ts">
	import { test } from './test.rpc.js';

	async function handleSubmit() {
		const result = await test({
			username: 'test'
		});
		console.log(result);
	}

	function preventDefault<T extends Event, Return>(fn: (event: T) => Return): (event: T) => Return {
		return (e: T) => {
			e.preventDefault();
			return fn(e);
		};
	}
</script>

<form onsubmit={preventDefault(handleSubmit)}>
	<button>Submit</button>
</form>
