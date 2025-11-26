import React from 'react';

interface Props {
    status: string;
}

export default function PermissionGuard({ status }: Props) {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md p-8">
                <div className="text-6xl mb-6">🔒</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Permission Required</h1>
                <p className="text-gray-500 mb-8 text-lg">
                    {status.includes('Requesting') ? status : "We need access to your Camera, Microphone, and Location to connect you with partners."}
                </p>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-left">
                    <h3 className="font-semibold text-gray-900 mb-2">How to enable:</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                            <span>👉</span> Click the Lock icon in the address bar
                        </li>
                        <li className="flex items-center gap-2">
                            <span>👉</span> Allow Camera, Microphone & Location
                        </li>
                        <li className="flex items-center gap-2">
                            <span>👉</span> Refresh this page
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}