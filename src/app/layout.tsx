import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Pan Ai Queso - Team Generator",
    description: "Generate balanced football teams using AI and stats.",
};

import { UserProvider } from "@/components/UserContext";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className={`${inter.className} bg-black text-white min-h-screen flex flex-col`}>
                <UserProvider>
                    <div className="flex-grow">
                        {children}
                    </div>
                </UserProvider>
                <Footer />
            </body>
        </html>
    );
}
