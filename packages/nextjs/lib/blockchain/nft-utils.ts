// Utility functions for NFT minting and file uploads

export interface MintNFTParams {
  svgUrl: string;
  userAddress: string;
  artworkTitle?: string;
  artworkDescription?: string;
}

export interface MintNFTResponse {
  success: boolean;
  transactionHash?: string;
  tokenId?: string;
  contractAddress?: string;
  openseaUrl?: string;
  message?: string;
  error?: string;
}

export const mintNFT = async (params: MintNFTParams): Promise<MintNFTResponse> => {
  try {
    const response = await fetch("/api/mint-nft", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error minting NFT:", error);
    return {
      success: false,
      error: "Failed to mint NFT",
    };
  }
};

export const uploadImageFile = async (
  file: File,
): Promise<{ success: boolean; walrusUrl?: string; error?: string }> => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error uploading file:", error);
    return {
      success: false,
      error: "Failed to upload file",
    };
  }
};

export const validatePNGFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (file.type !== "image/png") {
    return { valid: false, error: "Please select a PNG image file only." };
  }

  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: "File size must be less than 10MB." };
  }

  return { valid: true };
};
