// NFT Metadata Generator for OpenSea Compatibility
// This creates proper ERC721 metadata JSON that OpenSea can read
import { WalrusUploadResponse } from "~~/types/flask-api";
import { getWalrusBlobUrl } from "~~/utils/walrus";

export interface OpenSeaNFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
}

/**
 * Generate OpenSea-compatible NFT metadata
 * This is the JSON that should be stored and referenced by tokenURI
 */
export const generateOpenSeaMetadata = (
  walrusResult: WalrusUploadResponse,
  customName?: string,
  customDescription?: string,
): OpenSeaNFTMetadata => {
  const fileName = walrusResult.metadata.file_info.filename;
  const timestamp = new Date().toLocaleDateString();

  const name = customName || `Donatello AI Art - ${fileName}`;
  const description =
    customDescription ||
    `AI-generated artwork created with Donatello and permanently stored on Walrus decentralized storage. ` +
      `Original file: ${fileName}. Created on ${timestamp}.`;

  // Use aggregator URL for better reliability
  const imageUrl = getWalrusBlobUrl(walrusResult.image_blob_id);

  const attributes = [
    {
      trait_type: "Platform",
      value: "Donatello AI",
    },
    {
      trait_type: "Storage Network",
      value: "Walrus",
    },
    {
      trait_type: "File Format",
      value: walrusResult.metadata.file_info.format,
    },
    {
      trait_type: "Width",
      value: walrusResult.metadata.file_info.size.width,
      display_type: "number",
    },
    {
      trait_type: "Height",
      value: walrusResult.metadata.file_info.size.height,
      display_type: "number",
    },
    {
      trait_type: "File Size (KB)",
      value: Math.round(walrusResult.metadata.file_info.file_size / 1024),
      display_type: "number",
    },
    {
      trait_type: "Created",
      value: timestamp,
    },
  ];

  // Add dominant colors if available
  if (walrusResult.metadata.dominant_colors && walrusResult.metadata.dominant_colors.length > 0) {
    attributes.push({
      trait_type: "Dominant Colors",
      value: walrusResult.metadata.dominant_colors.slice(0, 3).join(", "),
    });
  }

  return {
    name,
    description,
    image: imageUrl,
    external_url: `https://donatello.ai/nft/${walrusResult.image_blob_id}`,
    attributes,
  };
};

/**
 * Upload metadata JSON to Walrus
 * This creates a separate blob for the metadata that OpenSea can read
 */
export const uploadMetadataToWalrus = async (metadata: OpenSeaNFTMetadata): Promise<string> => {
  try {
    // Convert metadata to JSON blob
    const metadataJson = JSON.stringify(metadata, null, 2);
    const metadataBlob = new Blob([metadataJson], { type: "application/json" });

    // Create form data for Flask backend
    const formData = new FormData();
    formData.append("metadata", metadataBlob, "metadata.json");

    // Upload to Flask backend which will store on Walrus
    const response = await fetch("http://127.0.0.1:5000/upload/metadata", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload metadata to Walrus");
    }

    const result = await response.json();
    return result.metadata_blob_id;
  } catch (error) {
    console.error("Error uploading metadata to Walrus:", error);
    throw error;
  }
};

/**
 * Create a data URL for metadata (fallback if Walrus upload fails)
 */
export const createMetadataDataUrl = (metadata: OpenSeaNFTMetadata): string => {
  const metadataJson = JSON.stringify(metadata, null, 2);
  const base64 = btoa(metadataJson);
  return `data:application/json;base64,${base64}`;
};
