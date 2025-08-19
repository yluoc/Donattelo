// Walrus URL utilities for consistent URL generation across the app

// Walrus network endpoints
export const WALRUS_ENDPOINTS = {
  testnet: {
    publisher: "https://publisher.walrus-testnet.walrus.space",
    aggregator: "https://aggregator.walrus-testnet.walrus.space",
  },
  mainnet: {
    publisher: "https://publisher.walrus.space",
    aggregator: "https://aggregator.walrus.space",
  },
} as const;

// Current network (change this to switch networks)
const CURRENT_NETWORK = "testnet" as const;

/**
 * Generate a Walrus blob URL using the aggregator endpoint
 * Aggregator URLs are more reliable for reading data
 */
export const getWalrusBlobUrl = (blobId: string): string => {
  return `${WALRUS_ENDPOINTS[CURRENT_NETWORK].aggregator}/v1/blobs/${blobId}`;
};

/**
 * Generate a Walrus store URL for uploading
 * Publisher URLs are used for storing new data
 */
export const getWalrusStoreUrl = (): string => {
  return `${WALRUS_ENDPOINTS[CURRENT_NETWORK].publisher}/v1/store`;
};

/**
 * Extract blob ID from a Walrus URL
 */
export const extractBlobIdFromUrl = (url: string): string | null => {
  const match = url.match(/\/v1\/blobs\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};

/**
 * Check if a URL is a valid Walrus blob URL
 */
export const isWalrusBlobUrl = (url: string): boolean => {
  return /\/v1\/blobs\/[a-zA-Z0-9_-]+$/.test(url);
};

/**
 * Format a blob ID for display (truncated)
 */
export const formatBlobId = (blobId: string, maxLength: number = 16): string => {
  if (blobId.length <= maxLength) return blobId;
  const start = Math.floor((maxLength - 3) / 2);
  const end = Math.ceil((maxLength - 3) / 2);
  return `${blobId.slice(0, start)}...${blobId.slice(-end)}`;
};

const walrusUtils = {
  getWalrusBlobUrl,
  getWalrusStoreUrl,
  extractBlobIdFromUrl,
  isWalrusBlobUrl,
  formatBlobId,
  WALRUS_ENDPOINTS,
};

export default walrusUtils;
