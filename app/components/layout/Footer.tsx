import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                    <h3 className="text-base font-bold text-gray-900">ZivvoChat</h3>
                    <p className="text-xs text-gray-500">Connect instantly, chat freely.</p>
                </div>

                <p className="text-sm text-gray-400">
                    © {new Date().getFullYear()} ZivvoChat. All rights reserved.
                </p>
            </div>
        </footer>
    );
}