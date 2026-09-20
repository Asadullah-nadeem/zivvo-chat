import React from 'react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="w-full py-8 border-t border-gray-200 bg-white/80 backdrop-blur-sm mt-auto relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-sm font-semibold text-gray-600">
                    <Link href="/about" prefetch={false} className="hover:text-blue-600 transition-colors">About & API</Link>
                    <Link href="/contact" prefetch={false} className="hover:text-blue-600 transition-colors">Contact</Link>
                    <Link href="/privacy" prefetch={false} className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
                    <Link href="/terms" prefetch={false} className="hover:text-blue-600 transition-colors">Terms of Service</Link>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 font-medium text-center">
                    © {new Date().getFullYear()} Zivvo Chat. All rights reserved.
                </p>
            </div>
        </footer>
    );
}