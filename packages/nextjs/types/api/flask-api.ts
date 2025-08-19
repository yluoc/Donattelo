// TypeScript interfaces for Flask API integration
export interface WalrusUploadResponse {
  success: boolean;
  image_url: string;
  image_blob_id: string;
  metadata_blob_id: string;
  image_object_id: string;
  metadata_object_id: string;
  metadata: {
    file_info: {
      filename: string;
      format: string;
      size: {
        width: number;
        height: number;
      };
      mode: string;
      file_size: number;
      analyzed_at: string;
    };
    // Additional metadata fields from your Flask backend
    dominant_colors?: string[];
    color_analysis?: any;
    technical_metadata?: any;
  };
}

export interface GeminiChatResponse {
  success: boolean;
  response: string;
  message_id?: number;
  error?: string;
}

export interface ChatMessage {
  role: "user" | "model";
  content: string;
  imageContext?: WalrusUploadResponse;
  timestamp?: Date;
}

export interface NFTMetadata {
  // OpenSea standard NFT metadata
  name: string;
  description: string;
  image: string; // Walrus image URL
  external_url?: string;
  animation_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;

  // Walrus-specific metadata
  walrus_storage: {
    image_blob_id: string;
    metadata_blob_id: string;
    image_object_id: string;
    metadata_object_id: string;
    stored_at: string;
  };

  // Technical metadata from Flask analysis
  technical_metadata: {
    file_info: {
      filename: string;
      format: string;
      size: {
        width: number;
        height: number;
      };
      file_size: number;
      analyzed_at: string;
    };
    color_analysis?: any;
    dominant_colors?: string[];
  };
}

export interface FlaskHealthResponse {
  status: string;
  timestamp: string;
  services?: {
    walrus?: string;
    gemini?: string;
  };
}
