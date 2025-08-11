// Valid environments for deployment
export const VALID_ENVIRONMENTS = [
    'testnet-staging',
    'devnet-staging',
    'mainnet-prod'
] as const;

// Type definitions for type safety
export type Environment = typeof VALID_ENVIRONMENTS[number]; 