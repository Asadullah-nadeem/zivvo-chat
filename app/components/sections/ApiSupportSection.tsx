import React from 'react';
import { Server, LifeBuoy } from 'lucide-react';

export default function ApiSupportSection() {
    return (
        <section className="grid md:grid-cols-2 gap-8">
            {/* API Access */}
            <div className="bg-white border border-gray-100 rounded-3xl p-8 hover:border-blue-200 hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                    <Server size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-black">API Access</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    Integrate ZivvoChat&apos;s powerful video and messaging capabilities directly into your applications. 
                    Our REST API and WebSocket events provide full control.
                </p>
                <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm text-gray-300 mb-6 border border-gray-800 shadow-inner">
                    <div className="flex justify-between mb-2 text-xs uppercase tracking-wider text-gray-500">
                        <span>Bash</span>
                    </div>
                    <code className="block">
                        <span className="text-purple-400">curl</span> -X POST https://api.zivvochat.com/v1/rooms \<br/>
                        &nbsp;&nbsp;-H <span className="text-green-400">&quot;Authorization: Bearer YOUR_KEY&quot;</span>
                    </code>
                </div>
                <button className="w-full py-3 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-all">
                    Read Documentation
                </button>
            </div>

            {/* Support */}
            <div className="bg-white border border-gray-100 rounded-3xl p-8 hover:border-purple-200 hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform">
                    <LifeBuoy size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-black">Support & Community</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    Need help? Our support team and community are here for you. 
                    Join our Discord or check out the documentation for guides and tutorials.
                </p>
                <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-gray-700">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        24/7 Developer Support
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Active Discord Community
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Comprehensive Guides
                    </li>
                </ul>
                <button className="w-full py-3 rounded-xl bg-purple-50 text-purple-600 font-bold hover:bg-purple-600 hover:text-white transition-all">
                    Contact Support
                </button>
            </div>
        </section>
    );
}
