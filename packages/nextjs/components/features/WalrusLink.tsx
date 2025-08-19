"use client";

import { useEffect, useState } from "react";
import { verifyWalrusBlob } from "~~/lib/flask-api";

interface WalrusLinkProps {
  blobId: string;
  className?: string;
  children: React.ReactNode;
}

export const WalrusLink = ({ blobId, className = "", children }: WalrusLinkProps) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const walrusUrl = `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`;

  useEffect(() => {
    const checkBlob = async () => {
      try {
        const exists = await verifyWalrusBlob(blobId);
        setIsValid(exists);
      } catch {
        setIsValid(false);
      }
    };

    checkBlob();
  }, [blobId]);

  if (isValid === null) {
    return <span className={`${className} text-gray-500`}>Verifying... {children}</span>;
  }

  if (!isValid) {
    return (
      <div className="space-y-2">
        <span className={`${className} text-red-600 dark:text-red-400`}>⚠️ {children} (Link Not Working)</span>
        <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
          <div className="font-semibold mb-1">Walrus URL Not Found (404 Error)</div>
          <div className="space-y-1">
            <div>• This blob doesn&apos;t exist on Walrus testnet</div>
            <div>• Your Flask backend might be using fake/placeholder data</div>
            <div>• Check Flask console logs for real upload status</div>
          </div>
          <div className="mt-2 text-xs font-mono bg-red-100 dark:bg-red-900/30 p-1 rounded">Blob ID: {blobId}</div>
        </div>
      </div>
    );
  }

  return (
    <a
      href={walrusUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className} text-purple-600 dark:text-purple-400 hover:underline inline-block max-w-full`}
      title={walrusUrl}
    >
      ✅ {children}
    </a>
  );
};
