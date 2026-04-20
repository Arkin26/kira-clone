import { createRequire } from "module";

const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@privy-io/react-auth", "@privy-io/wagmi", "@privy-io/js-sdk-core"],
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: require.resolve("buffer/"),
    };
    return config;
  },
};

export default nextConfig;
