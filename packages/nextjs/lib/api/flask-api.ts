// Flask API client functions for seamless integration with Gemini and Walrus
import { FlaskHealthResponse, GeminiChatResponse, NFTMetadata, WalrusUploadResponse } from "~~/types/flask-api";

const FLASK_BASE_URL = "http://127.0.0.1:5000";

// Verify if a Walrus blob actually exists
export const verifyWalrusBlob = async (blobId: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`, {
      method: "HEAD",
      cache: "no-cache",
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Image upload and Walrus storage
export const uploadImageToWalrus = async (imageFile: File): Promise<WalrusUploadResponse> => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch(`${FLASK_BASE_URL}/analyze/image`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
  }

  const data = await response.json();

  // Log Walrus storage details
  console.log("🐋 Walrus Storage Success:");
  console.log("- Image Blob ID:", data.image_blob_id);
  console.log("- Metadata Blob ID:", data.metadata_blob_id);
  console.log("- Direct Walrus URL:", `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${data.image_blob_id}`);
  console.log("- Flask Proxy URL:", data.image_url);

  // Verify the blob actually exists on Walrus
  try {
    const blobExists = await verifyWalrusBlob(data.image_blob_id);
    if (!blobExists) {
              console.warn("WARNING: Blob does not exist on Walrus testnet!");
      console.warn("This might be fake/placeholder data from your Flask backend.");
      console.warn("Check your Flask logs to see if Walrus upload actually succeeded.");
    } else {
              console.log("Blob verified on Walrus testnet");
    }
  } catch (error) {
            console.warn("Could not verify blob existence:", error);
  }

  return data;
};

// Chat with Gemini AI
export const sendChatMessage = async (
  message: string,
  imageContext?: WalrusUploadResponse,
): Promise<GeminiChatResponse> => {
  const response = await fetch(`${FLASK_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      image_context: imageContext
        ? {
            filename: imageContext.metadata.file_info.filename,
            size: imageContext.metadata.file_info.size,
            format: imageContext.metadata.file_info.format,
            file_size: imageContext.metadata.file_info.file_size,
            blob_id: imageContext.image_blob_id,
            image_url: imageContext.image_url,
            dominant_colors: imageContext.metadata.dominant_colors,
            analyzed_at: imageContext.metadata.file_info.analyzed_at,
          }
        : null,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Chat failed: ${response.statusText}`);
  }

  return await response.json();
};

// Get chat history
export const getChatHistory = async (): Promise<{ history: Array<{ role: string; content: string }> }> => {
  const response = await fetch(`${FLASK_BASE_URL}/chat/history`);

  if (!response.ok) {
    throw new Error(`Failed to fetch chat history: ${response.statusText}`);
  }

  return await response.json();
};

// Health check
export const checkFlaskHealth = async (): Promise<FlaskHealthResponse> => {
  const response = await fetch(`${FLASK_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }

  return await response.json();
};

// Get image metadata
export const getImageMetadata = async (metadataBlobId: string) => {
  const response = await fetch(`${FLASK_BASE_URL}/metadata/${metadataBlobId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch metadata: ${response.statusText}`);
  }

  return await response.json();
};

// Utility functions for Walrus URLs
export const getFlaskImageUrl = (imageBlobId: string): string => {
  return `${FLASK_BASE_URL}/image/${imageBlobId}`;
};

export const getDirectWalrusImageUrl = (imageBlobId: string): string => {
  return `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${imageBlobId}`;
};

// Generate NFT metadata from Walrus upload result
export const generateNFTMetadata = (
  walrusResult: WalrusUploadResponse,
  nftName: string,
  nftDescription: string,
  additionalAttributes: Array<{ trait_type: string; value: string | number }> = [],
): NFTMetadata => {
  const baseAttributes = [
    {
      trait_type: "Storage Network",
      value: "Walrus",
    },
    {
      trait_type: "File Format",
      value: walrusResult.metadata.file_info.format,
    },
    {
      trait_type: "Image Width",
      value: walrusResult.metadata.file_info.size.width,
      display_type: "number",
    },
    {
      trait_type: "Image Height",
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
      value: new Date(walrusResult.metadata.file_info.analyzed_at).toLocaleDateString(),
    },
  ];

  // Add dominant colors if available
  if (walrusResult.metadata.dominant_colors && walrusResult.metadata.dominant_colors.length > 0) {
    baseAttributes.push({
      trait_type: "Dominant Colors",
      value: walrusResult.metadata.dominant_colors.slice(0, 3).join(", "),
    });
  }

  return {
    name: nftName,
    description: nftDescription,
    image: getDirectWalrusImageUrl(walrusResult.image_blob_id),
    external_url: getFlaskImageUrl(walrusResult.image_blob_id),
    attributes: [...baseAttributes, ...additionalAttributes],
    walrus_storage: {
      image_blob_id: walrusResult.image_blob_id,
      metadata_blob_id: walrusResult.metadata_blob_id,
      image_object_id: walrusResult.image_object_id,
      metadata_object_id: walrusResult.metadata_object_id,
      stored_at: walrusResult.metadata.file_info.analyzed_at,
    },
    technical_metadata: {
      file_info: walrusResult.metadata.file_info,
      color_analysis: walrusResult.metadata.color_analysis,
      dominant_colors: walrusResult.metadata.dominant_colors,
    },
  };
};

// Validate file for upload
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/gif", "image/bmp", "image/webp"];
  const maxSize = 16 * 1024 * 1024; // 16MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Invalid file type. Allowed: PNG, JPG, JPEG, GIF, BMP, WEBP",
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "File size must be less than 16MB",
    };
  }

  return { isValid: true };
};
