import React from 'react';

export default function LoginBackground({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gray-950">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-purple-900/20 blur-[120px] animate-pulse" />
                <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-900/20 blur-[120px] animate-pulse delay-1000" />
                <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px] animate-pulse delay-2000" />
            </div>

            <div className="absolute inset-0 z-0 opacity-20"
                 style={{
                     backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
                     backgroundSize: '30px 30px'
                 }}
            />

            <div className="relative z-10 w-full max-w-md px-4">
                {children}
            </div>
        </div>
    );
}