"use client"
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import '@mysten/dapp-kit/dist/index.css';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider, createNetworkConfig } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui.js/client";

const inter = Inter({ subsets: ["latin"] });

const { networkConfig } = createNetworkConfig({
  customRPC: { url: "https://1b22-2001-19f0-1000-2f9b-5400-4ff-fef0-223.ngrok-free.app:443"}
});
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
			<SuiClientProvider networks={networkConfig} defaultNetwork="customRPC">
				<WalletProvider>
          <html lang="en">
            <body className={inter.className}>{children}</body>
          </html>
        </WalletProvider>
      </SuiClientProvider>
		</QueryClientProvider>
  );
}
