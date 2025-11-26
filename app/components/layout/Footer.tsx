import React from 'react';

export default function Footer() {
    return (
        // Fixed: Removed absolute positioning. Now it sits naturally at the bottom.
        <footer className="w-full py-6 border-t border-gray-200 bg-white/50 backdrop-blur-sm mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                    <p className="text-sm text-gray-600 font-medium">Connect instantly, chat freely.</p>
                </div>
                <p className="text-sm text-gray-500 font-medium text-center">
                    © {new Date().getFullYear()} Zivvo Chat. All rights reserved.
                </p>
            </div>
        </footer>
    );
}