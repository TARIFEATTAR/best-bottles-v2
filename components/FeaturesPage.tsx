import React, { useEffect } from 'react';

interface FeaturesPageProps {
    onBack: () => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ onBack }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const prototypeFeatures = [
        {
            title: "Live Visual Builder",
            description: "High-fidelity, real-time visualization of custom bottle, cap, and fitment combinations. See your product before you buy.",
            icon: "view_in_ar",
            color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
        },
        {
            title: "Multilingual AI 'Grace'",
            description: "A voice-enabled expert capable of conversing in multiple languages. Grace guides global customers through the catalog and custom configuration via natural, native dialogue.",
            icon: "translate",
            color: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
        },
        {
            title: "Smart Cost Calculator",
            description: "Wholesale pricing tiers that update instantly based on quantity breaks, providing immediate transparency for B2B buyers.",
            icon: "calculate",
            color: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
        },
        {
            title: "Logo Visualizer",
            description: "A professional branding tool allowing clients to upload their logos and see them instantly rendered on the bottle surface.",
            icon: "branding_watermark",
            color: "bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400"
        }
    ];

    const businessAdvantage = [
        { name: "Shopify Plus", desc: "Reliable Payments & Security" },
        { name: "Custom Interface", desc: "Premium, Fast Experience" },
        { name: "Automated Data", desc: "Inventory stays in Sync" },
        { name: "Wholesale Portal", desc: "Custom B2B Payment Terms" }
    ];

    const plusBenefits = [
        { title: "B2B Checkout Extensibility", desc: "Custom checkout fields and logic tailored for industrial wholesale orders." },
        { title: "Automated Workflows", desc: "Shopify Flow for inventory alerts, customer tagging, and high-risk order management." },
        { title: "Unlimited Project Scaling", desc: "High-volume traffic handling for flash sales and massive B2B procurement events." },
        { title: "Domestic & International 3PL", desc: "Seamless integration with third-party logistics partners to automate distribution as you scale beyond in-house shipping." }
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-20">
            {/* Hero Section */}
            <div className="relative py-24 px-6 overflow-hidden bg-[#1e1e4b] dark:bg-black text-white min-h-[500px] flex items-center">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-23e11813.jpg?v=1765598795"
                        alt="Best Bottles Hero"
                        className="w-full h-full object-cover opacity-60 brightness-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1e1e4b] via-[#1e1e4b]/80 to-transparent"></div>
                </div>

                <div className="max-w-6xl mx-auto relative z-10 w-full">
                    <div className="flex items-center gap-3 text-[#C5A065] font-bold tracking-widest uppercase text-xs mb-4">
                        <span className="px-2 py-0.5 border border-[#C5A065] rounded">Architecture Proposal</span>
                        <span className="material-symbols-outlined text-sm">architecture</span>
                        Enterprise Solution
                    </div>
                    <h1 className="text-4xl md:text-7xl font-serif font-bold mb-6 tracking-tight leading-tight">
                        Best Bottles v2.0 <br />
                        <span className="text-gray-400 italic font-medium">Modern Enterprise Storefront</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
                        A proposed high-performance storefront leveraging a custom <strong>React</strong> frontend synthesized with the robust transactional engine of <strong>Shopify Plus</strong> for global scale.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 mt-12 relative z-20">

                {/* Infrastructure Badge */}
                <div className="bg-white dark:bg-[#252525] p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 mb-16 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-12 flex items-center justify-center p-1 relative overflow-hidden group">
                            <img
                                src="https://cdn.shopify.com/s/files/1/1989/5889/files/shopify-plus-logo-png_seeklogo-393730.png?v=1766077635"
                                alt="Shopify Plus"
                                className="w-full h-full object-contain relative z-10 filter hover:brightness-110 transition-all"
                            />
                        </div>
                        <div className="h-10 w-[1px] bg-gray-200 dark:bg-gray-800 hidden md:block"></div>
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Proposed Backend Engine</div>
                            <div className="text-2xl font-serif font-bold dark:text-white flex items-center gap-3">
                                Shopify Plus <span className="text-[#95BF47] text-[10px] font-bold uppercase tracking-widest bg-[#95BF47]/10 px-2.5 py-1 rounded-full border border-[#95BF47]/20">Enterprise Grade</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-px w-full md:w-px md:h-12 bg-gray-200 dark:bg-gray-800"></div>
                    <div className="flex gap-8">
                        <div className="text-center">
                            <div className="text-lg font-bold text-[#95BF47]">99.9%</div>
                            <div className="text-[10px] uppercase font-bold text-gray-400">Uptime</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-[#95BF47]">Global</div>
                            <div className="text-[10px] uppercase font-bold text-gray-400">CDN</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-[#95BF47]">B2B</div>
                            <div className="text-[10px] uppercase font-bold text-gray-400">Native</div>
                        </div>
                    </div>
                </div>

                {/* Project Status */}
                <section className="mb-20">
                    <h2 className="text-2xl font-serif font-bold text-[#1e1e4b] dark:text-white mb-6 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-[#1e1e4b] text-white flex items-center justify-center text-sm">1</span>
                        Project Status At-A-Glance
                    </h2>
                    <div className="bg-white dark:bg-[#1E1E1E] p-10 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm leading-relaxed text-gray-600 dark:text-gray-300">
                        <p className="mb-6 text-xl text-[#C5A065] font-serif italic">
                            {`"The prototype you've just seen represents our vision for the ultimate Best Bottles experience."`}
                        </p>
                        <p className="mb-6 text-lg">
                            We have completed the <strong>User Experience Prototype</strong> which includes the core visual logic, the AI specialist {`"Grace"`}, and the B2B pricing engine. This proves that our custom design can work seamlessly with high-performance tech.
                        </p>
                        <p className="text-lg">
                            To bring this live for your customers, the next steps involve <strong>Data Integration</strong>—connecting your full inventory from bestbottles.com—and setting up the <strong>Shopify Plus</strong> backend to handle real transactions, wholesale accounts, and global security.
                        </p>
                    </div>
                </section>

                {/* Feature Grid */}
                <section className="mb-20">
                    <h2 className="text-2xl font-serif font-bold text-[#1e1e4b] dark:text-white mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-[#1e1e4b] text-white flex items-center justify-center text-sm">2</span>
                        Current Prototype Capabilities
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {prototypeFeatures.map((feature, idx) => (
                            <div key={idx} className="bg-white dark:bg-[#1E1E1E] p-8 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${feature.color}`}>
                                    <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
                                </div>
                                <h3 className="font-bold text-lg text-[#1e1e4b] dark:text-white mb-3">{feature.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Shopify Plus Opportunities Section */}
                <section className="mb-20">
                    <div className="bg-gradient-to-br from-[#1e1e4b] to-[#2d2d6e] rounded-3xl p-10 md:p-16 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                                </pattern>
                                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                                </pattern>
                                <rect width="100" height="100" fill="url(#grid)" />
                            </svg>
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1 shadow-inner">
                                    <img
                                        src="https://cdn.shopify.com/s/files/1/1989/5889/files/shopify-plus-logo-png_seeklogo-393730.png?v=1766077635"
                                        alt="Shopify Plus"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <h2 className="text-3xl font-serif font-bold">Unique Opportunities with Shopify Plus</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-10">
                                {plusBenefits.map((benefit, idx) => (
                                    <div key={idx} className="flex gap-5">
                                        <div className="shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                            <span className="material-symbols-outlined text-sm text-[#C5A065]">grade</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-2">{benefit.title}</h4>
                                            <p className="text-gray-300 text-sm leading-relaxed">{benefit.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tech Stack & Timeline */}
                <div className="grid lg:grid-cols-2 gap-12">

                    {/* Business Advantage */}
                    <section>
                        <h2 className="text-2xl font-serif font-bold text-[#1e1e4b] dark:text-white mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-[#1e1e4b] text-white flex items-center justify-center text-sm">3</span>
                            The Business Advantage
                        </h2>
                        <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm h-full">
                            <div className="grid grid-cols-2 gap-4">
                                {businessAdvantage.map((tech, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                                        <span className="material-symbols-outlined text-[#C5A065]">check_circle</span>
                                        <div>
                                            <div className="font-bold text-[#1e1e4b] dark:text-white text-sm">{tech.name}</div>
                                            <div className="text-xs text-gray-500">{tech.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg">verified_user</span>
                                    </div>
                                    <div>
                                        Future-proof architecture that combines <strong>global speed</strong> with the security of an enterprise backend.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Development Roadmap */}
                    <section>
                        <h2 className="text-2xl font-serif font-bold text-[#1e1e4b] dark:text-white mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-[#1e1e4b] text-white flex items-center justify-center text-sm">4</span>
                            Development Roadmap
                        </h2>
                        <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl border border-gray-100 dark:border-gray-800 p-10 shadow-sm text-sm">
                            <p className="mb-8 text-gray-500 italic">Following industry-standard agency workflows to ensure a grounded and successful transition to production.</p>

                            <div className="relative border-l-2 border-gray-100 dark:border-gray-700 ml-3 space-y-10">

                                {/* Phase 1 */}
                                <div className="relative pl-8">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#C5A065] border-4 border-white dark:border-[#1E1E1E]"></div>
                                    <div className="text-xs font-bold text-[#C5A065] uppercase tracking-widest mb-1">Step 1: Discovery</div>
                                    <h4 className="font-bold text-[#1e1e4b] dark:text-white text-lg">One-Week Intensive</h4>
                                    <p className="text-gray-500 mt-2 leading-relaxed">
                                        Deep dive into the full scope of work, technical specifications, and data audit. This ensures a logical and transparent sequence for the succeeding steps.
                                    </p>
                                </div>

                                {/* Phase 2 */}
                                <div className="relative pl-8">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-[#1E1E1E]"></div>
                                    <div className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Phase 2</div>
                                    <h4 className="font-bold text-[#1e1e4b] dark:text-white text-lg">Platform Implementation</h4>
                                    <p className="text-gray-500 mt-2 leading-relaxed">
                                        Synthesizing the custom <strong>React frontend</strong> with the Shopify Plus backend core to enable enterprise-grade cart and checkout capabilities.
                                    </p>
                                </div>

                                {/* Phase 3 */}
                                <div className="relative pl-8">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-[#1E1E1E]"></div>
                                    <div className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Phase 3</div>
                                    <h4 className="font-bold text-[#1e1e4b] dark:text-white text-lg">Enterprise Data Migration</h4>
                                    <p className="text-gray-500 mt-2 leading-relaxed">
                                        Full synchronization of the <strong>bestbottles.com</strong> product catalog, inventory mapping, and domestic/international distribution rules.
                                    </p>
                                </div>

                                {/* Phase 4 */}
                                <div className="relative pl-8">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-[#1E1E1E]"></div>
                                    <div className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Phase 4</div>
                                    <h4 className="font-bold text-[#1e1e4b] dark:text-white text-lg">Quality Assurance (QA)</h4>
                                    <p className="text-gray-500 mt-2 leading-relaxed">
                                        Rigorous testing of every checkout flow, B2B price list, and component logic to ensure absolute reliability across all devices.
                                    </p>
                                </div>

                                {/* Phase 5 */}
                                <div className="relative pl-8">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-[#1E1E1E]"></div>
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Phase 5</div>
                                    <h4 className="font-bold text-[#1e1e4b] dark:text-white text-lg">Production Launch</h4>
                                    <p className="text-gray-500 mt-2 leading-relaxed">
                                        Deployment of the production system to the primary domain, global activation, and transition to post-launch support.
                                    </p>
                                </div>

                            </div>

                            <div className="mt-10 bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl flex items-center gap-4 border border-indigo-100 dark:border-indigo-900/30">
                                <div className="w-12 h-12 rounded-xl bg-white dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-300 shadow-sm">
                                    <span className="material-symbols-outlined">rocket_launch</span>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Project Window</div>
                                    <div className="text-lg font-bold text-[#1e1e4b] dark:text-white">6-8 Weeks Total</div>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>

            </div>
        </div>
    );
};
