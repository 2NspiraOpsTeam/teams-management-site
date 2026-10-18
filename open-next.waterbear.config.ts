import { defineCloudflareConfig } from '@opennextjs/cloudflare';

const config = defineCloudflareConfig();
config.buildCommand = 'pnpm run build';
export default config;
