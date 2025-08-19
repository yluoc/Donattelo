import React from "react";
import Image from "next/image";

/**
 * Donatello Company Footer
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-t border-purple-200 dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Social Media & Bottom Section */}
        <div className="border-purple-200 dark:border-gray-700 pt-2">
          <div className="flex flex-col items-center gap-6">
            {/* Social Media Links */}
            <div className="flex flex-col items-center gap-4">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Follow us:</span>
              <div className="flex gap-6">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                >
                  <Image
                    src="/TwitterXLogo.png"
                    alt="Twitter/X"
                    width={32}
                    height={32}
                    className="group-hover:scale-110 transition-transform"
                  />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                >
                  <Image
                    src="/TelegramLogo.png"
                    alt="Telegram"
                    width={32}
                    height={32}
                    className="group-hover:scale-110 transition-transform"
                  />
                </a>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © {currentYear} Donatello AI. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Empowering creativity through artificial intelligence
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
