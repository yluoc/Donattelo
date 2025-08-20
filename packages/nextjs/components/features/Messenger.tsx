"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { PaperAirplaneIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface Message {
  id: string;
  content: string;
  sender: "user" | "donatello";
  timestamp: Date;
  imageFile?: File;
  imageUrl?: string;
}

interface MessengerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Messenger = ({ isOpen, onClose }: MessengerProps) => {
  // const { address: connectedAddress } = useAccount();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm Donatello, your AI-powered creative assistant. I can help you generate unique artwork, create NFTs, and explore the world of digital art on the blockchain. What would you like to create today?",
      sender: "donatello",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messengerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      // Validate file type (support multiple types as per Flask backend)
      const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/gif", "image/bmp", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        alert("Please select a valid image file (PNG, JPG, JPEG, GIF, BMP, or WEBP).");
        return;
      }

      // Validate file size (max 16MB as per Flask backend)
      if (file.size > 16 * 1024 * 1024) {
        alert("File size must be less than 16MB.");
        return;
      }

      setSelectedFile(file);

      // Create preview URL
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

  const uploadFileToServer = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();
      return {
        image_url: data.image_url,
        image_blob_id: data.image_blob_id,
        metadata_blob_id: data.metadata_blob_id,
        metadata: data.metadata,
        image_object_id: data.image_object_id,
        metadata_object_id: data.metadata_object_id,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() && !selectedFile) return;

    const userMessage: Message = {
      id: Date.now().toString(),
              content: inputMessage || (selectedFile ? "Analyzing your image and storing on Walrus..." : ""),
      sender: "user",
      timestamp: new Date(),
      imageFile: selectedFile || undefined,
      imageUrl: filePreview || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    try {
      let uploadResult = null;

      if (selectedFile) {
        // Upload file and get Walrus storage info
        uploadResult = await uploadFileToServer(selectedFile);
        removeSelectedFile();
      }

      // Send chat message to backend
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput,
          imageFile: selectedFile ? true : false,
          image_blob_id: uploadResult?.image_blob_id || null,
          metadata: uploadResult?.metadata || null,
          image_url: uploadResult?.image_url || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response || "I've processed your request!",
          sender: "donatello",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);

        // Log and display Walrus storage info
        if (uploadResult?.image_url) {
          console.log("🐋 Walrus Storage Success!");
          console.log("- Image URL:", uploadResult.image_url);
          console.log("- Blob ID:", uploadResult.image_blob_id);
          console.log("- Metadata Blob ID:", uploadResult.metadata_blob_id);
          console.log("- Object IDs:", {
            image: uploadResult.image_object_id,
            metadata: uploadResult.metadata_object_id,
          });
        }
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error processing your request. Please try again.",
        sender: "donatello",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Your Creative Assistant</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-circle hover:bg-purple-100 dark:hover:bg-purple-900">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(message => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] p-4 rounded-2xl ${
                  message.sender === "user"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                }`}
              >
                {message.sender === "donatello" && (
                  <div className="flex items-center gap-2 mb-2">
                    <Image src="/donattelo_logo.png" alt="Donatello" width={20} height={20} className="rounded-full" />
                    <span className="text-sm font-medium">Donatello</span>
                  </div>
                )}

                {/* Show image preview if message has an image */}
                {message.imageUrl && (
                  <div className="mb-3">
                    <Image
                      src={message.imageUrl}
                      alt="Uploaded image"
                      width={200}
                      height={200}
                      className="rounded-lg object-cover"
                    />
                  </div>
                )}

                <p className="whitespace-pre-wrap break-words overflow-hidden">{message.content}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Image src="/donattelo_logo.png" alt="Donatello" width={20} height={20} className="rounded-full" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900 rounded-b-3xl">
          {/* File Preview */}
          {filePreview && (
            <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-3">
                <Image
                  src={filePreview}
                  alt="File preview"
                  width={60}
                  height={60}
                  className="rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedFile?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG • {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={removeSelectedFile}
                  className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {/* File Upload Button */}
            <div className="relative self-end">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpg,image/jpeg,image/gif,image/bmp,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-circle bg-white dark:bg-gray-800 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900 text-purple-600 dark:text-purple-400"
                title="Upload image (PNG, JPG, JPEG, GIF, BMP, WEBP)"
              >
                <PhotoIcon className="h-5 w-5" />
              </button>
            </div>

            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your creative vision or upload an image to analyze and store on Walrus..."
              className="flex-1 input input-bordered bg-white dark:bg-gray-800 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 h-12"
            />

            {/* Send Message Button */}
            <button
              onClick={sendMessage}
              disabled={(!inputMessage.trim() && !selectedFile) || isTyping}
              className="btn btn-circle self-end bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none disabled:opacity-50"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
