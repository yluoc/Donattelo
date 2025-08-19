"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BlockieAvatar } from "~~/components/scaffold-eth";

/**
 * Site header
 */
export const Header = () => {
  return (
    <div className="sticky lg:static top-0 navbar bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-0 shrink-0 justify-between z-20 shadow-md border-b border-purple-200 dark:border-gray-700 px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <Link href="/" passHref className="flex items-center gap-3 ml-4 mr-6 shrink-0">
          <div className="flex relative w-48 h-16">
            <Image alt="Donatello logo" className="cursor-pointer pb-2" fill src="/logo.svg" />
          </div>
        </Link>
      </div>
      <div className="navbar-end grow mr-4">
        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
            const ready = mounted && authenticationStatus !== "loading";
            const connected =
              ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated");

            return (
              <div className="relative">
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        type="button"
                        className="btn btn-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none"
                      >
                        Connect Wallet
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button onClick={openChainModal} type="button" className="btn btn-warning btn-sm">
                        Wrong network
                      </button>
                    );
                  }

                  return (
                    <div className="relative">
                      <button
                        onClick={openAccountModal}
                        type="button"
                        className="btn btn-sm flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 hover:from-purple-200 hover:to-blue-200 dark:hover:from-purple-800 dark:hover:to-blue-800 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700"
                      >
                        <BlockieAvatar address={account.address} size={20} />
                        {account.displayName}
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </div>
  );
};
