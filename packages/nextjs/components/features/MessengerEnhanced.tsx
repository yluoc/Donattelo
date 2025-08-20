"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { NFTMinter } from "./NFTMinter";
import { WalrusLink } from "./WalrusLink";
import { PaperAirplaneIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useChat } from "~~/hooks/useChat";
import { validateImageFile } from "~~/lib/flask-api";

interface MessengerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MessengerEnhanced = ({ isOpen, onClose }: MessengerProps) => {
  const { messages, isLoading, isHealthy, sendMessage, checkHealth } = useChat();
  const [inputMessage, setInputMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messengerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to process message content and handle long URLs
  const processMessageContent = (content: string) => {
    // Regex to match Walrus URLs
    const walrusUrlRegex = /(https:\/\/[a-zA-Z0-9.-]*walrus[a-zA-Z0-9.-]*\/[^\s]+)/g;
    const parts = content.split(walrusUrlRegex);

    return parts.map((part, index) => {
      if (part.match(walrusUrlRegex)) {
        // This is a Walrus URL - truncate it for display
        const truncatedUrl = part.length > 60 ? `${part.slice(0, 35)}...${part.slice(-15)}` : part;

        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 dark:text-blue-400 hover:underline break-all"
            title={part}
          >
            {truncatedUrl}
          </a>
        );
      }
      // Regular text
      return part;
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      checkHealth();
    }
  }, [isOpen, checkHealth]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (messengerRef.current && !messengerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file before setting
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        alert(validation.error);
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = e => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedFile) return;

    try {
      await sendMessage(inputMessage, selectedFile || undefined);
      setInputMessage("");
      removeSelectedFile();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={messengerRef}
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col"
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <Image src="/donattelo_logo.png" alt="Donatello" width={40} height={40} className="rounded-full" />
            <div>
              <h3 className="font-semibold text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Donatello AI
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Your Creative Assistant</p>
                <div
                  className={`w-2 h-2 rounded-full ${isHealthy ? "bg-green-500" : "bg-red-500"}`}
                  title={isHealthy ? "Backend Connected" : "Backend Disconnected"}
                />
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-circle hover:bg-purple-100 dark:hover:bg-purple-900">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] p-4 rounded-2xl break-words overflow-hidden ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                }`}
              >
                {message.role === "model" && (
                  <div className="flex items-center gap-2 mb-2">
                    <Image src="/donattelo_logo.png" alt="Donatello" width={20} height={20} className="rounded-full" />
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Donatello AI</span>
                  </div>
                )}

                {/* Display image context if available */}
                {message.imageContext && (
                  <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 overflow-hidden break-words">
                    <div className="text-sm overflow-hidden">
                      <div className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
                        🐋 Walrus Storage Info:
                      </div>
                      <div className="space-y-1 text-purple-700 dark:text-purple-300">
                        <div className="break-all">
                          📍 <strong>Blob ID:</strong>{" "}
                          <code className="text-xs bg-purple-100 dark:bg-purple-800 px-1 rounded break-all">
                            {message.imageContext.image_blob_id}
                          </code>
                        </div>
                        <div className="overflow-hidden break-words w-full">
                          🔗 <strong>Direct URL:</strong>{" "}
                          <div className="space-y-1">
                            <WalrusLink blobId={message.imageContext.image_blob_id} className="text-xs">
                              View on Walrus
                            </WalrusLink>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono break-all">
                              {(() => {
                                const fullUrl = `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${message.imageContext.image_blob_id}`;
                                return fullUrl.length > 60
                                  ? `${fullUrl.slice(0, 35)}...${fullUrl.slice(-15)}`
                                  : fullUrl;
                              })()}
                            </div>
                          </div>
                        </div>
                        <div>
                          📊 <strong>Size:</strong> {message.imageContext.metadata.file_info.size.width} x{" "}
                          {message.imageContext.metadata.file_info.size.height}
                        </div>
                        <div>
                          <strong>Format:</strong> {message.imageContext.metadata.file_info.format}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* NFT Minting Section - only show for messages with Walrus images */}
                {message.imageContext && (
                  <div className="mt-3">
                    <NFTMinter
                      walrusBlobId={message.imageContext.image_blob_id}
                      metadataBlobId={message.imageContext.metadata_blob_id || ""}
                      walrusUploadResult={message.imageContext}
                      onMintSuccess={(tokenId, txHash) => {
                        console.log("NFT Minted Successfully!");
                        console.log("Token ID:", tokenId);
                        console.log("Transaction:", txHash);
                      }}
                      onMintError={error => {
                        console.error("NFT Minting Failed:", error);
                      }}
                    />
                  </div>
                )}

                <div className="text-sm leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
                  {processMessageContent(message.content)}
                </div>

                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl max-w-[75%]">
                <div className="flex items-center gap-2 mb-2">
                  <Image src="/donattelo_logo.png" alt="Donatello" width={20} height={20} className="rounded-full" />
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Donatello AI</span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* File Preview */}
        {selectedFile && filePreview && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image src={filePreview} alt="Preview" width={60} height={60} className="rounded-lg object-cover" />
                <button
                  onClick={removeSelectedFile}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {selectedFile.type} • {Math.round(selectedFile.size / 1024)} KB
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-end gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/png,image/jpg,image/jpeg,image/gif,image/bmp,image/webp"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-ghost btn-circle hover:bg-purple-100 dark:hover:bg-purple-900 flex-shrink-0"
              disabled={isLoading}
            >
              <PhotoIcon className="h-6 w-6 text-purple-600" />
            </button>

            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={selectedFile ? "Add a message about your image..." : "Type your message..."}
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-500 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                rows={1}
                style={{ minHeight: "48px", maxHeight: "120px" }}
                disabled={isLoading}
              />
            </div>

            <button
              onClick={handleSendMessage}
              disabled={(!inputMessage.trim() && !selectedFile) || isLoading}
              className="btn btn-circle bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none disabled:opacity-50 flex-shrink-0"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>

          {!isHealthy && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              Warning: Flask backend not connected. Make sure it&apos;s running on http://127.0.0.1:5000
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
