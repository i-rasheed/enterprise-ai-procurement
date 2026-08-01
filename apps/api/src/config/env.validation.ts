import { validateEnv } from './env.schema';

export default (config: Record<string, unknown>) =>
  validateEnv({ ...process.env, ...config });
