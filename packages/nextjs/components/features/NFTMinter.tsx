"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { base } from "viem/chains";
import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { WalrusUploadResponse } from "~~/types/flask-api";
import { createMetadataDataUrl, generateOpenSeaMetadata } from "~~/utils/nft-metadata";
import { getWalrusBlobUrl } from "~~/utils/walrus";

interface NFTMinterProps {
  walrusBlobId: string;
  metadataBlobId: string;
  walrusUploadResult?: WalrusUploadResponse; // Add this to get full metadata
  onMintSuccess?: (tokenId: string, txHash: string) => void;
  onMintError?: (error: string) => void;
}

// Contract configuration
const DONATELLO_NFT_ABI = [
  {
    type: "function",
    name: "mintNFT",
    inputs: [
      { name: "to", type: "address" },
      { name: "walrusBlobId", type: "string" },
      { name: "metadataBlobId", type: "string" },
      { name: "uri", type: "string" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
  },
] as const;

// Deployed DonatelloNFT contract on Base mainnet
const DONATELLO_NFT_CONTRACT = "0xa51142536583a464996BeA47930e10693518727F" as `0x${string}`;

export const NFTMinter = ({
  walrusBlobId,
  metadataBlobId,
  walrusUploadResult,
  onMintSuccess,
  onMintError,
}: NFTMinterProps) => {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const [transactionStatus, setTransactionStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [mintTxHash, setMintTxHash] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Wagmi hooks for contract interaction
  const { writeContract, data: hash, error: writeError, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Generate proper OpenSea metadata if we have the full upload result
  const getMetadataUrl = () => {
    if (walrusUploadResult) {
      // Generate OpenSea-compatible metadata
      const openSeaMetadata = generateOpenSeaMetadata(
        walrusUploadResult,
        `Donatello AI Art`,
        `AI-generated artwork permanently stored on Walrus decentralized storage.`,
      );

      // For now, use a data URL (in the future, upload this JSON to Walrus)
      return createMetadataDataUrl(openSeaMetadata);
    }

    // Fallback to existing metadataUrl if no full result
    return getWalrusBlobUrl(metadataBlobId);
  };

  const metadataUrl = getMetadataUrl();

  // Function to parse and provide user-friendly error messages
  const getErrorMessage = (error: any): string => {
    const errorMessage = error?.message || error?.toString() || "Transaction failed";

    // Handle user rejection errors
    if (
      errorMessage.includes("User rejected") ||
      errorMessage.includes("user rejected") ||
      errorMessage.includes("rejected")
    ) {
      return "Transaction cancelled by user";
    }

    // Handle insufficient funds
    if (errorMessage.includes("insufficient funds") || errorMessage.includes("InsufficientFunds")) {
      return "Insufficient funds to complete the transaction";
    }

    // Handle chain switching errors
    if (errorMessage.includes("Connector not connected") || errorMessage.includes("chain")) {
      return "Please ensure you're connected to the Base network";
    }

    // Handle network errors
    if (errorMessage.includes("network") || errorMessage.includes("Network")) {
      return "Network error - please check your connection and try again";
    }

    // Handle contract errors
    if (errorMessage.includes("contract") || errorMessage.includes("revert")) {
      return "Smart contract error - please try again";
    }

    // Default message for unknown errors
    return "Transaction failed - please try again";
  };

  // Handle minting
  const handleMint = async () => {
    if (!address) return;

    // Check if we're on Base chain, if not switch to it
    if (chain?.id !== base.id) {
      try {
        await switchChain({ chainId: base.id });
      } catch (error) {
        const friendlyMessage = getErrorMessage(error);
        setTransactionStatus("error");
        setErrorMessage(friendlyMessage);
        onMintError?.(friendlyMessage);
        return;
      }
    }

    try {
      setTransactionStatus("pending");
      setMintTxHash("");

      writeContract({
        address: DONATELLO_NFT_CONTRACT,
        abi: DONATELLO_NFT_ABI,
        functionName: "mintNFT",
        args: [address, walrusBlobId, metadataBlobId, metadataUrl],
        chainId: base.id, // Explicitly specify Base chain
      });
    } catch (error) {
      const friendlyMessage = getErrorMessage(error);
      setTransactionStatus("error");
      setErrorMessage(friendlyMessage);
      onMintError?.(friendlyMessage);
    }
  };

  // Watch for transaction completion
  useEffect(() => {
    if (isConfirmed && hash) {
      setMintTxHash(hash);
      setTransactionStatus("success");
      onMintSuccess?.(walrusBlobId, hash);
    }
  }, [isConfirmed, hash, walrusBlobId, onMintSuccess]);

  useEffect(() => {
    if (writeError) {
      const friendlyMessage = getErrorMessage(writeError);
      setTransactionStatus("error");
      setErrorMessage(friendlyMessage);
      onMintError?.(friendlyMessage);
    }
  }, [writeError, onMintError]);

  const resetTransactionState = () => {
    setTransactionStatus("idle");
    setMintTxHash("");
    setErrorMessage("");
  };

  // Early return if wallet is not connected
  if (!isConnected || !address) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
        <div className="text-center space-y-4">
          <div className="text-lg font-semibold text-purple-800 dark:text-purple-300">Ready to Mint Your NFT!</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Connect your wallet to mint this artwork as an NFT on Base chain
          </p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
      <div className="space-y-4">
        <div className="text-lg font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-2">
          Mint as NFT
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
            Base Chain
          </span>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <div className="flex justify-between">
            <span>Image Storage:</span>
            <span className="font-mono text-xs">Walrus</span>
          </div>
          <div className="flex justify-between">
            <span>Blob ID:</span>
            <span className="font-mono text-xs">
              {walrusBlobId.slice(0, 8)}...{walrusBlobId.slice(-8)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Network:</span>
            <span className="text-blue-600 dark:text-blue-400">Base</span>
          </div>
        </div>

        <div className="space-y-3">
          {/* Single Universal Mint Button */}
          <button
            onClick={handleMint}
            disabled={!address || isPending || isConfirming || transactionStatus === "pending"}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!chain || chain.id !== base.id
              ? "Switch to Base Network"
              : transactionStatus === "pending" || isPending
                ? "Preparing Transaction..."
                : isConfirming
                                      ? "Confirming Transaction..."
                  : "� Mint NFT"}
          </button>

          {/* Reset Button - show when there's an error or stuck state */}
          {transactionStatus === "error" && (
            <button
              onClick={resetTransactionState}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm"
            >
              Try Again
            </button>
          )}
        </div>

        {transactionStatus === "error" && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-sm text-red-800 dark:text-red-300">
              <div className="font-semibold mb-1">
                {errorMessage.includes("cancelled") ? "Transaction Cancelled" : "Transaction Failed"}
              </div>
              <div className="text-xs text-red-600 dark:text-red-400">
                {errorMessage || "Please try again or check your wallet connection."}
              </div>
            </div>
          </div>
        )}

        {transactionStatus === "success" && mintTxHash && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-sm text-green-800 dark:text-green-300">
              <div className="font-semibold mb-1">NFT Minted Successfully!</div>
              <div className="space-y-1">
                <div>
                  Transaction:
                  <a
                    href={`https://basescan.org/tx/${mintTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs ml-1 underline hover:text-green-600"
                  >
                    {mintTxHash.slice(0, 8)}...{mintTxHash.slice(-8)}
                  </a>
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  Your NFT will appear in your wallet and on OpenSea shortly!
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
