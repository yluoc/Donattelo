import { NextRequest, NextResponse } from "next/server";
import { validateImageFile } from "~~/lib/flask-api";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // Validate file using the utility function
    const validation = validateImageFile(image);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Create FormData to send to Flask backend
    const flaskFormData = new FormData();
    flaskFormData.append("image", image);

    // Flask backend URL
    const flaskBackendUrl = "http://127.0.0.1:5000";

    console.log("📤 Uploading to Flask backend:", flaskBackendUrl);

    // Send to Flask backend for image analysis and Walrus storage
    const response = await fetch(`${flaskBackendUrl}/analyze/image`, {
      method: "POST",
      body: flaskFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Flask backend error:", errorData);
      throw new Error(errorData.error || "Failed to analyze image");
    }

    const data = await response.json();

    // Log successful Walrus storage for debugging
    console.log("🐋 Walrus Storage Success:");
    console.log("- Image Blob ID:", data.image_blob_id);
    console.log("- Metadata Blob ID:", data.metadata_blob_id);
    console.log("- Image Object ID:", data.image_object_id);
    console.log("- Metadata Object ID:", data.metadata_object_id);
    console.log("- Flask Proxy URL:", data.image_url);
    console.log(
      "- Direct Walrus URL:",
      `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${data.image_blob_id}`,
    );

    return NextResponse.json({
      success: true,
      image_url: data.image_url,
      image_blob_id: data.image_blob_id,
      metadata_blob_id: data.metadata_blob_id,
      image_object_id: data.image_object_id,
      metadata_object_id: data.metadata_object_id,
      metadata: data.metadata,
      message: "Image successfully analyzed and stored on Walrus",
      walrus_direct_url: `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${data.image_blob_id}`,
    });
  } catch (error) {
    console.error("Error processing image upload:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process image",
        message: "Make sure your Flask backend is running on http://127.0.0.1:5000",
      },
      { status: 500 },
    );
  }
}
