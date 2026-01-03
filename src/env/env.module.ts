import { DynamicModule } from '@nestjs/common';

import {
	DotenvLoaderOptions,
	TypedConfigModule,
	dotenvLoader,
	selectConfig,
} from 'nest-typed-config';

import { EnvSchema } from './env';

const options: DotenvLoaderOptions = {
	expandVariables: true,
};

export const EnvModule: DynamicModule = TypedConfigModule.forRoot({
	schema: EnvSchema,
	load: dotenvLoader(options),
});

export const env = selectConfig(EnvModule, EnvSchema);
