import { NextRequest, NextResponse } from "next/server";
import { checkFlaskHealth, sendChatMessage } from "~~/lib/flask-api";
import { WalrusUploadResponse } from "~~/types/flask-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, imageFile, image_blob_id, metadata, image_url } = body;

    let aiResponse = "";
    let walrusUrl = "";

    if (imageFile && image_blob_id) {
      // If an image was uploaded, show Walrus storage info and let Gemini respond
      walrusUrl = image_url || `http://127.0.0.1:5000/image/${image_blob_id}`;

      // Create WalrusUploadResponse object for proper typing
      const walrusResult: WalrusUploadResponse = {
        success: true,
        image_url: image_url,
        image_blob_id: image_blob_id,
        metadata_blob_id: metadata?.metadata_blob_id || "",
        image_object_id: metadata?.image_object_id || "",
        metadata_object_id: metadata?.metadata_object_id || "",
        metadata: metadata || {
          file_info: {
            filename: "uploaded_image",
            format: "unknown",
            size: { width: 0, height: 0 },
            mode: "RGB",
            file_size: 0,
            analyzed_at: new Date().toISOString(),
          },
        },
      };

      // Log Walrus storage details for debugging
      console.log("🐋 Walrus Storage Details:");
      console.log("- Image Blob ID:", image_blob_id);
      console.log("- Walrus URL:", walrusUrl);
      console.log("- Direct Walrus URL:", `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${image_blob_id}`);
      console.log("- Metadata:", metadata);

      // Send to Gemini AI for response about the uploaded image
      try {
        const geminiPrompt = `User uploaded an image and it's now stored on Walrus!
        
🐋 Walrus Storage Details:
- Image Blob ID: ${image_blob_id}
- Direct Walrus URL: https://aggregator.walrus-testnet.walrus.space/v1/blobs/${image_blob_id}
- Flask Proxy URL: ${walrusUrl}

${
  metadata
    ? `
📊 Image Analysis:
- Dimensions: ${metadata.width || metadata.file_info?.size?.width || "N/A"} x ${metadata.height || metadata.file_info?.size?.height || "N/A"}
- File size: ${metadata.file_size ? Math.round(metadata.file_size / 1024) + " KB" : metadata.file_info?.file_size ? Math.round(metadata.file_info.file_size / 1024) + " KB" : "N/A"}
- Format: ${metadata.format || metadata.file_info?.format || "Unknown"}
${metadata.dominant_colors ? `- Dominant colors: ${metadata.dominant_colors.slice(0, 3).join(", ")}` : ""}
`
    : ""
}

Please provide creative insights about this image and ask if they want to mint it as an NFT or create variations. Mention that their image is now permanently stored on Walrus decentralized storage!

User message: ${message || "What do you think of this image?"}`;

        const geminiResponse = await sendChatMessage(geminiPrompt, walrusResult);

        if (geminiResponse.success) {
          aiResponse = geminiResponse.response;
        } else {
          throw new Error(geminiResponse.error || "Failed to get AI response");
        }
      } catch (error) {
        console.error("Gemini API error:", error);
        // Fallback response with enhanced Walrus information
        aiResponse = `Perfect! Your image has been successfully analyzed and stored on Walrus decentralized storage!

� **Walrus Storage Success:**
📍 **Your Image URL**: ${walrusUrl}
🔗 **Direct Walrus URL**: https://aggregator.walrus-testnet.walrus.space/v1/blobs/${image_blob_id}
🆔 **Blob ID**: \`${image_blob_id}\`

${
  metadata
    ? `📊 **Image Analysis:**
• Dimensions: ${metadata.width || metadata.file_info?.size?.width || "N/A"} x ${metadata.height || metadata.file_info?.size?.height || "N/A"}
• File size: ${metadata.file_size ? Math.round(metadata.file_size / 1024) + " KB" : metadata.file_info?.file_size ? Math.round(metadata.file_info.file_size / 1024) + " KB" : "N/A"}
• Format: ${metadata.format || metadata.file_info?.format || "Unknown"}
${metadata.dominant_colors ? `• Dominant colors: ${metadata.dominant_colors.slice(0, 3).join(", ")}` : ""}`
    : "• Analysis complete!"
}

        Your image is now permanently stored on Walrus and ready for NFT minting! The AI analysis is temporarily unavailable, but your artwork is safe and accessible. Would you like to proceed with creating an NFT?`;
      }
    } else if (message && message.trim()) {
      // Handle text-only messages through Gemini
      try {
        const geminiResponse = await sendChatMessage(message);

        if (geminiResponse.success) {
          aiResponse = geminiResponse.response;
        } else {
          throw new Error(geminiResponse.error || "Failed to get AI response");
        }
      } catch (error) {
        console.error("Gemini API error:", error);
        // Enhanced fallback responses
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes("mint") || lowerMessage.includes("nft")) {
          aiResponse =
            "I can help you mint your artwork as an NFT! Please upload an image first, and I'll analyze it, store it permanently on Walrus, and guide you through the minting process on your preferred blockchain.";
        } else if (lowerMessage.includes("upload") || lowerMessage.includes("image")) {
          aiResponse =
            "📸 Please use the upload button to share your image (PNG, JPG, JPEG, GIF, BMP, or WEBP - up to 16MB). I'll analyze it, store it securely on Walrus decentralized storage, and help you create amazing NFTs!";
        } else if (lowerMessage.includes("walrus") || lowerMessage.includes("storage")) {
          aiResponse =
            "🐋 Walrus provides decentralized, permanent storage for your digital assets - perfect for NFT metadata and ensuring your art is always accessible! When you upload an image, it gets stored permanently on the Walrus network with a unique blob ID.";
        } else if (lowerMessage.includes("help") || lowerMessage.includes("what")) {
          aiResponse =
            "I'm Donatello, your AI creative assistant! I can:\n\n• Analyze and store images on Walrus decentralized storage\n• Provide creative insights about your artwork\n• Help you mint NFTs\n• Create variations of your art\n• Answer questions about digital art and blockchain\n\nUpload an image to get started!";
        } else {
          aiResponse =
            "I'm your AI creative assistant! Upload an image to get started with Walrus storage and NFT creation, or ask me anything about digital art and blockchain technology.";
        }
      }
    } else {
      aiResponse =
        "Hello! I'm Donatello, your AI creative assistant. Upload an image to analyze it and store it on Walrus, or ask me anything about digital art and NFTs!";
    }

    // Check Flask backend health
    try {
      await checkFlaskHealth();
              console.log("Flask backend is healthy");
    } catch (error) {
              console.warn("Flask backend health check failed:", error);
    }

    return NextResponse.json({
      success: true,
      response: aiResponse,
      canMintNFT: !!image_blob_id,
      image_blob_id: image_blob_id || null,
      walrus_url: walrusUrl || null,
      walrus_direct_url: image_blob_id
        ? `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${image_blob_id}`
        : null,
    });
  } catch (error) {
    console.error("Error processing chat message:", error);
    return NextResponse.json(
      {
        success: false,
        response:
          "I apologize, but I'm having trouble processing your request right now. Please ensure your Flask backend is running on http://127.0.0.1:5000 and try again.",
      },
      { status: 500 },
    );
  }
}
