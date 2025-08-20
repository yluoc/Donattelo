"use client";

import { useState } from "react";
import { verifyWalrusBlob } from "~~/lib/flask-api";

export const WalrusDebugger = () => {
  const [blobId, setBlobId] = useState("cZBN4GBk9aK180cuvZ6NOgGkphWfP9QSia24te5yllk");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const checkBlob = async () => {
    setChecking(true);
    setResult(null);

    try {
      const exists = await verifyWalrusBlob(blobId);
      if (exists) {
        setResult("Blob exists on Walrus testnet");
      } else {
        setResult("Blob does NOT exist on Walrus testnet (404 error)");
      }
    } catch (error) {
              setResult(`Error checking blob: ${error}`);
    } finally {
      setChecking(false);
    }
  };

  const testDirectUpload = async () => {
            setResult("Testing direct Walrus upload...");

    try {
      // Create a simple test blob
      const testData = new Blob(["Hello Walrus Test"], { type: "text/plain" });
      const formData = new FormData();
      formData.append("file", testData, "test.txt");

      const response = await fetch("https://publisher.walrus-testnet.walrus.space/v1/store", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const newBlobId = data.newlyCreated?.blobObject?.blobId;
        setResult(`Direct upload successful! Blob ID: ${newBlobId}`);
        setBlobId(newBlobId);
      } else {
        const errorText = await response.text();
        setResult(`Direct upload failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
              setResult(`Direct upload error: ${error}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">🐋 Walrus Storage Debugger</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Blob ID to check:</label>
          <input
            type="text"
            value={blobId}
            onChange={e => setBlobId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            placeholder="Enter blob ID..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={checkBlob}
            disabled={checking || !blobId.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {checking ? "Checking..." : "Check Blob"}
          </button>

          <button
            onClick={testDirectUpload}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Test Direct Upload
          </button>
        </div>

        {result && (
          <div
            className={`p-3 rounded-md text-sm ${
              result.startsWith("Blob exists") || result.startsWith("Direct upload successful")
                ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
                                  : result.startsWith("Error") || result.startsWith("Blob does NOT exist") || result.startsWith("Direct upload failed")
                  ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
                  : "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
            }`}
          >
            {result}
          </div>
        )}

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-sm">
          <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Debug Information:</h3>
          <div className="space-y-1 text-gray-600 dark:text-gray-400">
            <div>
              <strong>Walrus Testnet URL:</strong> https://publisher.walrus-testnet.walrus.space
            </div>
            <div>
              <strong>Current Blob URL:</strong>{" "}
              <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                https://publisher.walrus-testnet.walrus.space/v1/blobs/{blobId}
              </code>
            </div>
            <div>
              <strong>Expected Result:</strong> Should return image data or 404 if not found
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md text-sm border border-yellow-200 dark:border-yellow-800">
          <h3 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-300">Troubleshooting Tips:</h3>
          <ul className="space-y-1 text-yellow-700 dark:text-yellow-300 list-disc list-inside">
            <li>If blob check fails: Your Flask backend might be using fake data</li>
            <li>If direct upload fails: Walrus testnet might be down</li>
            <li>Check your Flask console logs for real upload attempts</li>
            <li>Verify your Flask backend actually calls Walrus API</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
