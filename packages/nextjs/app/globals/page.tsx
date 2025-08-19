"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ChatBubbleLeftRightIcon, CpuChipIcon, PaintBrushIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { MessengerEnhanced } from "~~/components/MessengerEnhanced";
import { SwitchTheme } from "~~/components/SwitchTheme";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Array of greetings in different languages
  const greetings = useMemo(
    () => [
      "Buongiorno!", // Italian
      "Hello!", // English
      "Bonjour!", // French
      "Hola!", // Spanish
      "Guten Tag!", // German
      "Konnichiwa!", // Japanese
      "Ni hao!", // Chinese
      "Namaste!", // Hindi
      "Shalom!", // Hebrew
      "Salaam!", // Arabic
      "Olá!", // Portuguese
      "Privyet!", // Russian
      "Hej!", // Swedish
      "Hallo!", // Dutch
    ],
    [],
  );

  const [currentGreeting, setCurrentGreeting] = useState(greetings[0]); // Start with Buongiorno!

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGreeting(prevGreeting => {
        // Get a random greeting that's different from the current one
        let newGreeting;
        do {
          newGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        } while (newGreeting === prevGreeting && greetings.length > 1);
        return newGreeting;
      });
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [greetings]);

  return (
    <>
      {/* Main Landing Page */}
      <div className="flex items-center flex-col grow pt-10 relative min-h-screen">
        {/* Hero Section */}
        <div className="px-5 text-center max-w-4xl">
          <div className="flex justify-center mb-8">
            <Image
              src="/donattelo_logo.png"
              alt="Donatello Logo"
              width={120}
              height={120}
              className="rounded-full shadow-lg"
            />
          </div>

          <h1 className="text-center mb-6">
            <span className="block text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4 pb-4 transition-all duration-500 ease-in-out">
              {currentGreeting}
            </span>
            <span className="block text-2xl text-gray-600 dark:text-gray-300 font-light">
              I am Donatello, your Renaissance AI Maestro
            </span>
          </h1>

          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
            Named after the great Florentine sculptor, I bring centuries of artistic mastery into the digital age.
            Transform your creative visions into magnificent SVG masterpieces and mint them as eternal NFTs on the
            blockchain. Upload your artwork or share your ideas - let&apos;s create something truly extraordinary
            together! 🎨✨
          </p>

          {connectedAddress && (
            <div className="flex justify-center items-center space-x-2 mb-8 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-green-700 font-medium">Connected & Ready to Create</p>
            </div>
          )}

          <button
            onClick={() => setIsChatOpen(true)}
            className="btn btn-lg gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white border-none"
          >
            <ChatBubbleLeftRightIcon className="h-6 w-6" />
            Begin Creating with Donatello
          </button>
        </div>

        {/* Features Section */}
        <div className="w-full mt-20 px-8 py-16 bg-gradient-to-br from-base-200 to-base-300">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              What Donatello Can Do
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              <div className="flex flex-col bg-white dark:bg-gray-800 p-8 text-center items-center rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-sm">
                <div className="p-4 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-full mb-4">
                  <SparklesIcon className="h-8 w-8 text-purple-600 dark:text-purple-300" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">PNG to SVG Conversion</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Upload your PNG images and watch them transform into scalable SVG artwork using AI technology.
                </p>
              </div>

              <div className="flex flex-col bg-white dark:bg-gray-800 p-8 text-center items-center rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-sm">
                <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full mb-4">
                  <CpuChipIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-300" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Smart NFT Creation</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Automatically mint and list your creations as NFTs on multiple blockchain networks.
                </p>
              </div>

              <div className="flex flex-col bg-white dark:bg-gray-800 p-8 text-center items-center rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-sm">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-full mb-4">
                  <PaintBrushIcon className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Walrus Storage</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your converted SVG artworks are securely stored on Walrus for permanent availability and minting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messenger Component */}
      <MessengerEnhanced isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Floating Action Buttons */}
      {!isChatOpen && (
        <div className="fixed bottom-6 right-6 flex flex-col items-center gap-4 z-40">
          {/* Chat Button */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="btn btn-primary btn-circle btn-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-none"
          >
            <ChatBubbleLeftRightIcon className="h-8 w-8" />
          </button>

          {/* Theme Switch Button */}
          <SwitchTheme className="animate-float" />
        </div>
      )}
    </>
  );
};

export default Home;
