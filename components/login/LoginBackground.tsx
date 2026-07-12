/**
 * LoginBackground
 * ─────────────────────────────────────────────────────────────────────────────
 * Komponen background-only untuk halaman login.
 * Tidak memengaruhi LoginCard sama sekali — cukup render di dalam <main>
 * sebagai sibling pertama sebelum <LoginCard />.
 *
 * Layer:
 *  1. Gradient dasar  (#083E63 → #0B5C8C → #145E8C)
 *  2. SVG pattern tipis — ikon teknologi & edukasi (opacity ~6%)
 *  3. Abstract blur blob + vignette — glow biru & kuning
 *  4. Confetti dekorasi kecil — kotak, diamond, garis
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default function LoginBackground() {
    return (
        <>
            {/* ── LAYER 1: Gradient base ───────────────────────────────────── */}
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-30"
                style={{
                    background: "linear-gradient(135deg, #083E63 0%, #0B5C8C 50%, #145E8C 100%)",
                }}
            />

            {/* ── LAYER 2: SVG tech / education seamless pattern ──────────── */}
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-20"
                style={{ opacity: 0.06 }}
            >
                <svg
                    className="w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ position: "absolute", inset: 0 }}
                >
                    <defs>
                        {/*
                         * Tile 220×220 — 12 ikon outline putih bertema tech & edu.
                         * Setiap ikon berukuran ~20-30px, stroke tipis, fill none.
                         */}
                        <pattern
                            id="techPattern"
                            x="0"
                            y="0"
                            width="220"
                            height="220"
                            patternUnits="userSpaceOnUse"
                        >
                            {/* Monitor */}
                            <g transform="translate(10,8)" stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="0" y="0" width="28" height="18" rx="2"/>
                                <line x1="8" y1="18" x2="20" y2="18"/>
                                <line x1="10" y1="21" x2="18" y2="21"/>
                            </g>

                            {/* Code brackets */}
                            <g transform="translate(80,10)" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M8 6L2 12l6 6"/>
                                <path d="M16 6l6 6-6 6"/>
                            </g>

                            {/* Gear */}
                            <g transform="translate(120,10)" stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="13" cy="13" r="4.5"/>
                                <path d="M13 2v3M13 21v3M2 13h3M21 13h3M5.2 5.2l2.1 2.1M15.7 15.7l2.1 2.1M5.2 20.8l2.1-2.1M15.7 10.3l2.1-2.1"/>
                            </g>

                            {/* Cloud */}
                            <g transform="translate(170,75)" stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16H8a6 6 0 01-1-11.9A8 8 0 0122 8a6 6 0 010 8z" transform="scale(0.85)"/>
                            </g>

                            {/* Keyboard */}
                            <g transform="translate(55,50)" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="0" y="0" width="32" height="20" rx="2"/>
                                <circle cx="4"  cy="6"  r="1.5" fill="white" stroke="none"/>
                                <circle cx="9"  cy="6"  r="1.5" fill="white" stroke="none"/>
                                <circle cx="14" cy="6"  r="1.5" fill="white" stroke="none"/>
                                <circle cx="19" cy="6"  r="1.5" fill="white" stroke="none"/>
                                <circle cx="24" cy="6"  r="1.5" fill="white" stroke="none"/>
                                <circle cx="28" cy="6"  r="1.5" fill="white" stroke="none"/>
                                <circle cx="4"  cy="11" r="1.5" fill="white" stroke="none"/>
                                <circle cx="9"  cy="11" r="1.5" fill="white" stroke="none"/>
                                <circle cx="14" cy="11" r="1.5" fill="white" stroke="none"/>
                                <circle cx="19" cy="11" r="1.5" fill="white" stroke="none"/>
                                <circle cx="24" cy="11" r="1.5" fill="white" stroke="none"/>
                                <line x1="10" y1="16" x2="22" y2="16"/>
                            </g>

                            {/* WiFi */}
                            <g transform="translate(10,115)" stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round">
                                <circle cx="14" cy="19" r="1.5"/>
                                <path d="M8.5 14.5a8 8 0 0111 0"/>
                                <path d="M5 11a13 13 0 0118 0"/>
                            </g>

                            {/* Laptop */}
                            <g transform="translate(60,100)" stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="0" width="24" height="16" rx="1.5"/>
                                <path d="M0 16 H28 L30 20 H-2 Z"/>
                            </g>

                            {/* Network */}
                            <g transform="translate(130,65)" stroke="white" strokeWidth="1.2" fill="none">
                                <circle cx="14" cy="3"  r="2.5"/>
                                <circle cx="3"  cy="19" r="2.5"/>
                                <circle cx="25" cy="19" r="2.5"/>
                                <line x1="14" y1="5.5"  x2="3"  y2="16.5"/>
                                <line x1="14" y1="5.5"  x2="25" y2="16.5"/>
                                <line x1="5.5" y1="19"  x2="22.5" y2="19"/>
                            </g>

                            {/* Database */}
                            <g transform="translate(145,140)" stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <ellipse cx="14" cy="5" rx="10" ry="4"/>
                                <path d="M4 5v5c0 2.2 4.5 4 10 4s10-1.8 10-4V5"   transform="scale(0.9) translate(1.5,0)"/>
                                <path d="M4 10v5c0 2.2 4.5 4 10 4s10-1.8 10-4V10" transform="scale(0.9) translate(1.5,0)"/>
                            </g>

                            {/* Atom */}
                            <g transform="translate(168,170)" stroke="white" strokeWidth="1.2" fill="none">
                                <circle cx="14" cy="14" r="3"/>
                                <ellipse cx="14" cy="14" rx="13" ry="5"/>
                                <ellipse cx="14" cy="14" rx="13" ry="5" transform="rotate(60 14 14)"/>
                                <ellipse cx="14" cy="14" rx="13" ry="5" transform="rotate(120 14 14)"/>
                            </g>

                            {/* Document */}
                            <g transform="translate(10,175)" stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 2h12l6 6v16H4z"/>
                                <path d="M16 2v6h6"/>
                                <line x1="8" y1="13" x2="18" y2="13"/>
                                <line x1="8" y1="17" x2="15" y2="17"/>
                            </g>

                            {/* Folder */}
                            <g transform="translate(95,160)" stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 6h8l2 3h12v14H2z"/>
                            </g>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#techPattern)"/>
                </svg>
            </div>

            {/* ── LAYER 3: Blur blobs + vignette ──────────────────────────── */}

            {/* Blob biru besar — kanan atas */}
            <div
                aria-hidden="true"
                className="absolute pointer-events-none -z-10"
                style={{
                    top: "-140px", right: "-100px",
                    width: "560px", height: "560px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(20,94,160,0.70) 0%, transparent 70%)",
                    filter: "blur(90px)",
                }}
            />

            {/* Blob kuning — kiri bawah */}
            <div
                aria-hidden="true"
                className="absolute pointer-events-none -z-10"
                style={{
                    bottom: "-120px", left: "-80px",
                    width: "440px", height: "440px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(249,199,61,0.22) 0%, transparent 70%)",
                    filter: "blur(110px)",
                }}
            />

            {/* Blob biru mid — kanan bawah */}
            <div
                aria-hidden="true"
                className="absolute pointer-events-none -z-10"
                style={{
                    bottom: "-80px", right: "60px",
                    width: "380px", height: "380px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(11,92,140,0.55) 0%, transparent 70%)",
                    filter: "blur(95px)",
                }}
            />

            {/* Blob oranye — tengah kiri */}
            <div
                aria-hidden="true"
                className="absolute pointer-events-none -z-10"
                style={{
                    top: "38%", left: "-50px",
                    width: "280px", height: "280px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(244,155,33,0.16) 0%, transparent 70%)",
                    filter: "blur(75px)",
                }}
            />

            {/* Vignette — tepi gelap agar card fokus */}
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none -z-10"
                style={{
                    background: "radial-gradient(ellipse at center, transparent 25%, rgba(4,20,40,0.60) 100%)",
                }}
            />

            {/* ── LAYER 4: Confetti kecil ──────────────────────────────────── */}

            {/* Kotak kuning – kiri atas */}
            <div aria-hidden="true" className="absolute pointer-events-none -z-10"
                style={{ top:"8%", left:"6%", width:10, height:10, background:"#F9C73D", opacity:0.25, transform:"rotate(20deg)", borderRadius:2 }} />

            {/* Diamond oranye – kiri atas bawah */}
            <div aria-hidden="true" className="absolute pointer-events-none -z-10"
                style={{ top:"18%", left:"3%", width:8, height:8, background:"#F49B21", opacity:0.22, transform:"rotate(45deg)" }} />

            {/* Garis biru muda – kiri tengah */}
            <div aria-hidden="true" className="absolute pointer-events-none -z-10"
                style={{ top:"45%", left:"8%", width:26, height:2.5, background:"#90C8E8", opacity:0.28, transform:"rotate(-12deg)", borderRadius:2 }} />

            {/* Kotak kuning – kanan atas */}
            <div aria-hidden="true" className="absolute pointer-events-none -z-10"
                style={{ top:"12%", right:"7%", width:9, height:9, background:"#F9C73D", opacity:0.22, transform:"rotate(-15deg)", borderRadius:2 }} />

            {/* Diamond biru muda – kanan tengah atas */}
            <div aria-hidden="true" className="absolute pointer-events-none -z-10"
                style={{ top:"28%", right:"4%", width:7, height:7, background:"#90C8E8", opacity:0.25, transform:"rotate(45deg)" }} />

            {/* Garis oranye – kanan bawah */}
            <div aria-hidden="true" className="absolute pointer-events-none -z-10"
                style={{ bottom:"22%", right:"6%", width:22, height:2.5, background:"#F49B21", opacity:0.25, transform:"rotate(18deg)", borderRadius:2 }} />

            {/* Kotak oranye – kanan bawah */}
            <div aria-hidden="true" className="absolute pointer-events-none -z-10"
                style={{ bottom:"10%", right:"9%", width:10, height:10, background:"#F49B21", opacity:0.20, transform:"rotate(30deg)", borderRadius:2 }} />

            {/* Diamond kuning – kiri bawah */}
            <div aria-hidden="true" className="absolute pointer-events-none -z-10"
                style={{ bottom:"14%", left:"5%", width:8, height:8, background:"#F9C73D", opacity:0.22, transform:"rotate(45deg)" }} />

            {/* Garis biru muda – kiri bawah */}
            <div aria-hidden="true" className="absolute pointer-events-none -z-10"
                style={{ bottom:"28%", left:"7%", width:20, height:2, background:"#90C8E8", opacity:0.25, transform:"rotate(8deg)", borderRadius:2 }} />

            {/* Dot kuning – atas tengah kiri */}
            <div aria-hidden="true" className="absolute pointer-events-none -z-10"
                style={{ top:"6%", left:"22%", width:5, height:5, background:"#F9C73D", opacity:0.20, borderRadius:"50%" }} />

            {/* Dot oranye – atas tengah kanan */}
            <div aria-hidden="true" className="absolute pointer-events-none -z-10"
                style={{ top:"5%", right:"22%", width:5, height:5, background:"#F49B21", opacity:0.20, borderRadius:"50%" }} />

            {/* Garis biru muda – tengah kanan */}
            <div aria-hidden="true" className="absolute pointer-events-none -z-10"
                style={{ top:"55%", right:"7%", width:18, height:2, background:"#90C8E8", opacity:0.22, transform:"rotate(-8deg)", borderRadius:2 }} />
        </>
    )
}
