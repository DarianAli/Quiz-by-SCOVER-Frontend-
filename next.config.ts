import type { NextConfig } from "next";

// The Express backend URL. Must match NEXT_PUBLIC_BASE_API_URL in production.
const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BASE_API_URL ?? "http://localhost:9000";

const nextConfig: NextConfig = {
  /**
   * Proxy image requests to the Express backend.
   *
   * Images from Word import are stored in `question_text` as:
   *   ![alt](/question_image/<filename>)
   *
   * The Express backend serves them at:
   *   GET /public/question_image/<filename>
   *
   * Without these rewrites the browser would request
   *   http://localhost:3000/question_image/<filename>  →  404
   *
   * Two rules cover both the inline-markdown path AND the
   * `question_images` relation URL (/public/question_image/...).
   */
  async rewrites() {
    return [
      {
        // Inline markdown images: /question_image/<filename>
        source: "/question_image/:path*",
        destination: `${BACKEND_ORIGIN}/public/question_image/:path*`,
      },
      {
        // Relation-based image URLs: /public/question_image/<filename>
        source: "/public/question_image/:path*",
        destination: `${BACKEND_ORIGIN}/public/question_image/:path*`,
      },
    ];
  },
};

export default nextConfig;
