import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "FurbolAI - Team Generator",
    description: "Generate balanced football teams using AI and stats.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className={`${inter.className} bg-black text-white min-h-screen`}>
                {children}
            </body>
        </html>
    );
}
