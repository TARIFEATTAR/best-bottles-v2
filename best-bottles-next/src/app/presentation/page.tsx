
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// ════════════════════════════════════════════════════════════════════════════
// THE DECK CONTENT
// ════════════════════════════════════════════════════════════════════════════
const SLIDES = [
    {
        id: 'intro',
        layout: 'hero',
        title: 'BEST BOTTLES',
        subtitle: 'A Digital Transformation',
        text: 'Elevating the digital experience to match the physical quality & beauty of the product.',
        footer: 'ASALA.AI × BEST BOTTLES | PARTNERSHIP PROPOSAL'
    },
    {
        id: 'agenda',
        layout: 'list',
        title: "Tonight's Roadmap",
        items: [
            { num: '01', title: 'The Brand Brain', desc: 'Grace AI: Zero hallucinations. Data sprint.' },
            { num: '02', title: 'The Paper Doll Pipeline', desc: 'PSD → Sanity. Automated assembly.' },
            { num: '03', title: 'Sanity CMS', desc: 'Your website\'s remote control.' },
            { num: '04', title: 'Headless Freedom', desc: 'Templates vs. Custom Architecture.' },
            { num: '05', title: 'Shopify Plus', desc: 'The Backend Vault.' },
            { num: '06', title: 'B2B & Logistics', desc: 'Business logic & Shipping.' }
        ]
    },
    {
        id: 'foundation',
        layout: 'split',
        label: 'SECTION 01 • THE FOUNDATION',
        title: 'Meet Grace AI',
        subtitle: 'Your 24/7 Product Expert',
        text: 'Solving the human bottleneck of memorizing 1,300+ product specifications. Grace doesn\'t guess — she knows.',
        stats: [
            { label: 'Products', value: '1,300+' },
            { label: 'Tech Specs', value: '9,555' },
            { label: 'Hallucinations', value: '0' },
            { label: 'Availability', value: '24/7' }
        ]
    },
    {
        id: 'paper-doll-intro',
        layout: 'center',
        label: 'SECTION 02 • THE IMAGE PIPELINE',
        title: 'The Paper Doll Builder',
        subtitle: 'From PSD to Dynamic Configurator',
        text: 'Running Live in this Browser right now.',
        code: 'PSD → Export → Supabase → AI Upscale → Sanity → Live'
    },
    {
        id: 'paper-doll-demo',
        layout: 'interactive',
        title: 'Live Interactive Architecture',
        subtitle: 'The "Paper Doll" Effect',
        text: 'This is not a video. This is code assembling layers in real-time.',
    },
    {
        id: 'sanity',
        layout: 'split',
        label: 'SECTION 03 • CMS',
        title: 'Sanity: The Remote Control',
        subtitle: 'No Code Required',
        points: [
            'Real-Time Agility: Launch campaigns in 3 clicks.',
            'Scheduled Publishing: Plan Black Friday in July.',
            'No New Tools: Browser-based Studio.',
            'Division of Labor: Sanity = Marketing. Shopify = Money.'
        ]
    },
    {
        id: 'headless',
        layout: 'split',
        label: 'SECTION 04 • ARCHITECTURE',
        title: 'The Harmony of Headless',
        subtitle: 'The Showroom vs. The Vault',
        points: [
            'THE SHOWROOM (Custom Frontend): Speed, Beauty, Story.',
            'THE VAULT (Shopify Plus): Security, Inventory, Money.',
            'They Talk via API: No manual syncing.',
            'Global Edge Network: Faster than Shopify themes.'
        ]
    },
    {
        id: 'comparison',
        layout: 'compare',
        title: 'Templates vs. Custom',
        left: {
            title: 'Shopify Template',
            items: ['Limited Layouts', 'Expensive Apps', 'Generic Look', 'Slow Bloat']
        },
        right: {
            title: 'Custom Headless (Ours)',
            items: ['Design Freedom', 'Native Configurator', 'Grace AI Integrated', '90+ Lighthouse Score']
        }
    },
    {
        id: 'next-steps',
        layout: 'split',
        title: 'Deployment Phases',
        subtitle: 'The Road to Launch',
        points: [
            'Phase 1: Foundation (Data & Grace)',
            'Phase 2: Core Build (Paper Doll & Site)',
            'Phase 3: B2B Logic (Portals & Pricing)',
            'Phase 4: Launch (QA & Training)'
        ]
    },
    {
        id: 'madison',
        layout: 'hero',
        title: 'Stage 4: Madison Studio',
        subtitle: 'The Creative Engine',
        text: 'Once the data is clean, Madison writes the story. Infinite content scaling for SEO and Social.',
        footer: 'THE "VOICE" OF BEST BOTTLES'
    },
    {
        id: 'closing',
        layout: 'hero',
        title: 'Let\'s Transform Best Bottles',
        subtitle: 'Asala.ai × Best Bottles',
        text: '"We aren\'t just building a website. We are building an intelligent engine."',
        cta: true
    }
]


// ════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function PresentationPage() {
    const [currentSlide, setCurrentSlide] = useState(0)

    // Keyboard Nav
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                setCurrentSlide(prev => Math.min(prev + 1, SLIDES.length - 1))
            }
            if (e.key === 'ArrowLeft') {
                setCurrentSlide(prev => Math.max(prev - 1, 0))
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const slide = SLIDES[currentSlide]

    return (
        <div className="h-screen w-screen bg-black text-white font-sans overflow-hidden selection:bg-purple-500 selection:text-white">

            {/* PROGRESS BAR */}
            <div className="fixed top-0 left-0 h-1 bg-neutral-800 w-full z-50">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                    style={{ width: `${((currentSlide + 1) / SLIDES.length) * 100}%` }}
                />
            </div>

            {/* SLIDE CONTENT AREA */}
            <div className="h-full w-full flex flex-col items-center justify-center p-12 relative animate-in fade-in duration-500 key={currentSlide}">

                {/* LAYOUT: HERO */}
                {slide.layout === 'hero' && (
                    <div className="text-center max-w-4xl space-y-8">
                        <h1 className="text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-neutral-500">
                            {slide.title}
                        </h1>
                        <h2 className="text-3xl text-blue-400 font-light tracking-wide">{slide.subtitle}</h2>
                        <p className="text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto">{slide.text}</p>
                        {slide.footer && (
                            <div className="pt-20 text-sm text-neutral-600 font-mono tracking-widest uppercase">
                                {slide.footer}
                            </div>
                        )}
                        {/*@ts-ignore*/}
                        {slide.cta && (
                            <Link href="/demo/sanity-showcase" className="inline-block mt-8 px-8 py-4 border border-white/20 hover:bg-white hover:text-black transition-all rounded-full">
                                View Live Demo Dashboard →
                            </Link>
                        )}
                    </div>
                )}

                {/* LAYOUT: LIST */}
                {slide.layout === 'list' && (
                    <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <div className="col-span-full mb-8 border-b border-neutral-800 pb-8">
                            <h2 className="text-5xl font-bold">{slide.title}</h2>
                        </div>
                        {/*@ts-ignore*/}
                        {slide.items && slide.items.map((item: any, i: number) => (
                            <div key={i} className="flex gap-6 group">
                                <span className="text-neutral-700 font-mono text-xl group-hover:text-purple-500 transition-colors">{item.num}</span>
                                <div>
                                    <h3 className="text-xl font-bold mb-1 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                                    <p className="text-neutral-500 text-sm">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* LAYOUT: SPLIT */}
                {slide.layout === 'split' && (
                    <div className="max-w-6xl w-full grid grid-cols-2 gap-20 items-center">
                        <div className="space-y-6">
                            {/*@ts-ignore*/}
                            {slide.label && <span className="text-xs font-mono text-blue-500 tracking-widest uppercase">{slide.label}</span>}
                            <h2 className="text-6xl font-bold leading-tight">{slide.title}</h2>
                            <h3 className="text-2xl text-neutral-400 font-light">{slide.subtitle}</h3>
                            {/*@ts-ignore*/}
                            {slide.text && <p className="text-lg text-neutral-500 leading-relaxed">{slide.text}</p>}
                        </div>
                        <div className="bg-neutral-900/50 p-10 rounded-2xl border border-neutral-800">
                            {/*@ts-ignore*/}
                            {slide.stats && (
                                <div className="grid grid-cols-2 gap-8">
                                    {/*@ts-ignore*/}
                                    {slide.stats.map((stat: any, i: number) => (
                                        <div key={i}>
                                            <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                                            <div className="text-sm text-neutral-500 font-mono uppercase">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/*@ts-ignore*/}
                            {slide.points && (
                                <ul className="space-y-6">
                                    {/*@ts-ignore*/}
                                    {slide.points.map((pt: string, i: number) => (
                                        <li key={i} className="flex items-start gap-4 text-lg">
                                            <span className="text-purple-500 mt-1">✓</span>
                                            <span className="text-neutral-300">{pt}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}

                {/* LAYOUT: CENTER */}
                {slide.layout === 'center' && (
                    <div className="text-center max-w-4xl space-y-8">
                        {/*@ts-ignore*/}
                        <span className="text-xs font-mono text-blue-500 tracking-widest uppercase">{slide.label}</span>
                        <h1 className="text-6xl font-bold">{slide.title}</h1>
                        <h2 className="text-2xl text-neutral-400">{slide.subtitle}</h2>
                        {/*@ts-ignore*/}
                        <p className="text-xl text-neutral-500">{slide.text}</p>
                        {/*@ts-ignore*/}
                        {slide.code && (
                            <div className="mt-8 p-6 bg-neutral-900 border border-neutral-800 rounded-lg font-mono text-sm text-green-400">
                                {slide.code}
                            </div>
                        )}
                    </div>
                )}

                {/* LAYOUT: INTERACTIVE PAPER DOLL */}
                {slide.layout === 'interactive' && (
                    <div className="w-full max-w-5xl flex gap-12 items-center">
                        <div className="w-1/2 space-y-6">
                            <h2 className="text-5xl font-bold">{slide.title}</h2>
                            <h3 className="text-2xl text-blue-400">{slide.subtitle}</h3>
                            {/*@ts-ignore*/}
                            <p className="text-neutral-400 text-lg">{slide.text}</p>
                            <div className="flex gap-4">
                                <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded text-blue-200 text-sm">
                                    Hover over diagram →
                                </div>
                                <Link
                                    href="/demo/sanity-showcase"
                                    target="_blank"
                                    className="px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/50"
                                >
                                    <span>Launch Live Demo</span>
                                    <span className="text-xl">↗</span>
                                </Link>
                            </div>
                        </div>

                        {/* MINI PAPER DOLL BUILDER */}
                        <div className="w-1/2 h-[500px] bg-neutral-900 rounded-2xl border border-dashed border-neutral-700 relative flex items-center justify-center group">
                            <div className="relative w-48 h-80 transition-transform duration-500 group-hover:scale-110">
                                {/* Placeholder layers simulating the effect */}
                                <div className="absolute bottom-0 left-0 w-full h-40 bg-blue-500/20 border-2 border-blue-500 rounded-b-xl backdrop-blur-sm z-10 transition-all duration-500 group-hover:translate-y-4">
                                    <div className="absolute -right-12 top-10 text-xs font-mono text-blue-500 opacity-0 group-hover:opacity-100">Layer 1: Glass</div>
                                </div>
                                <div className="absolute bottom-40 left-8 w-32 h-12 bg-neutral-500/20 border-2 border-neutral-400 rounded-full z-20 transition-all duration-500 group-hover:-translate-y-2">
                                    <div className="absolute -right-20 top-2 text-xs font-mono text-neutral-400 opacity-0 group-hover:opacity-100">Layer 2: Fitment</div>
                                </div>
                                <div className="absolute bottom-52 left-8 w-32 h-16 bg-white/10 border-2 border-white rounded-t-lg z-30 transition-all duration-500 group-hover:-translate-y-8">
                                    <div className="absolute -right-20 top-4 text-xs font-mono text-white opacity-0 group-hover:opacity-100">Layer 3: Cap</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* LAYOUT: COMPARE */}
                {slide.layout === 'compare' && (
                    <div className="w-full max-w-6xl">
                        <h2 className="text-5xl font-bold text-center mb-16">{slide.title}</h2>
                        <div className="grid grid-cols-2 gap-12">
                            {/*@ts-ignore*/}
                            <div className="p-8 border border-neutral-800 rounded-xl bg-neutral-900/30 opacity-50">
                                {/*@ts-ignore*/}
                                <h3 className="text-2xl font-bold mb-8 text-neutral-400">{slide.left.title}</h3>
                                <ul className="space-y-4 text-neutral-500">
                                    {/*@ts-ignore*/}
                                    {slide.left.items.map((it, i) => <li key={i}>❌ {it}</li>)}
                                </ul>
                            </div>
                            {/*@ts-ignore*/}
                            <div className="p-8 border border-blue-500/50 rounded-xl bg-blue-900/10 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
                                {/*@ts-ignore*/}
                                <h3 className="text-2xl font-bold mb-8 text-white">{slide.right.title}</h3>
                                <ul className="space-y-4 text-white text-lg">
                                    {/*@ts-ignore*/}
                                    {slide.right.items.map((it, i) => <li key={i}>✅ {it}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}


            </div>

            {/* CONTROLS HINT */}
            <div className="fixed bottom-8 right-8 text-neutral-700 font-mono text-xs">
                Use Arrow Keys [ ← {currentSlide + 1} / {SLIDES.length} → ]
            </div>
        </div>
    )
}
