import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { svgUrl, userAddress, artworkTitle, artworkDescription } = body;

    if (!svgUrl || !userAddress) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // TODO: Replace with your actual Python Flask backend URL
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:5000";

    // Send minting request to Python backend
    const response = await fetch(`${pythonBackendUrl}/api/mint-nft`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        svgUrl,
        userAddress,
        title: artworkTitle || "Donatello AI Artwork",
        description: artworkDescription || "AI-generated artwork converted to SVG",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to mint NFT");
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      transactionHash: data.transactionHash,
      tokenId: data.tokenId,
      contractAddress: data.contractAddress,
      openseaUrl: data.openseaUrl,
      message: "NFT successfully minted and listed on OpenSea!",
    });
  } catch (error) {
    console.error("Error minting NFT:", error);
    return NextResponse.json({ error: "Failed to mint NFT" }, { status: 500 });
  }
}
