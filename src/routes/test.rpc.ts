import { rpc, defineMiddleware } from '$lib/builder.js';
import * as v from 'valibot';

function validate<Schema extends v.GenericSchema>(schema: Schema) {
	return defineMiddleware(async ({ input }, decorate) => {
		const result = await v.safeParseAsync(schema, input);

		if (!result.success) {
			return {
				type: 'validation_error',
				errors: v.flatten<Schema>(result.issues)
			};
		}

		return decorate({
			input: result.output
		});
	});
}

const schema = v.object({
	username: v.string()
});

export const test = rpc.use(validate(schema)).create(async ({ input }) => {
	return {
		type: 'success',
		input
	};
});
