"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, Users, Zap } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      </div>

      {/* Community Indicator - Top Left */}
      <div className="absolute top-8 left-8 z-10">
        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-black"></div>
            <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-black"></div>
            <div className="w-6 h-6 bg-purple-500 rounded-full border-2 border-black"></div>
            <div className="w-6 h-6 bg-yellow-500 rounded-full border-2 border-black"></div>
          </div>
          <span className="text-sm font-medium">+ 2 MIL traders na comunidade</span>
        </div>
      </div>

      {/* Status Indicator - Top Right */}
      <div className="absolute top-8 right-8 z-10">
        <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
          <span className="text-sm font-medium tracking-wider">INSCRIÇÕES * ABERTAS *</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-between min-h-screen px-8 lg:px-16">
        {/* Left Side - Text Content */}
        <div className="flex-1 max-w-2xl">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                Seja trader.
              </h1>
              <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-lg">
                Domine DeFi e eleve seu padrão de vida, não precisa ser especialista para isso.
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                asChild
                size="lg"
                className="bg-white text-black hover:bg-gray-200 border border-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105"
              >
                <Link href="/auth/signin">
                  <Zap className="w-5 h-5 mr-2" />
                  Participe
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side - Visual Elements */}
        <div className="hidden lg:flex flex-1 justify-center items-center">
          <div className="relative">
            {/* Futuristic Figures */}
            <div className="flex space-x-8">
              {/* First Figure */}
              <div className="relative">
                <div className="w-32 h-40 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border border-gray-700 relative overflow-hidden">
                  {/* Helmet with amber light */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-20 h-16 bg-gray-900 rounded-full border-2 border-gray-700">
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-amber-400 rounded-full animate-pulse"></div>
                  </div>
                  {/* Body */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-20 bg-gray-800 rounded-lg"></div>
                </div>
              </div>

              {/* Second Figure */}
              <div className="relative">
                <div className="w-32 h-40 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border border-gray-700 relative overflow-hidden">
                  {/* Helmet */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-20 h-16 bg-black rounded-full border-2 border-gray-600">
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-600 rounded-full"></div>
                  </div>
                  {/* Body */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-20 bg-gray-800 rounded-lg"></div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
            <div className="absolute -bottom-4 -left-4 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute top-1/2 -right-8 w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Bottom Center */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-12 h-12 border-2 border-white rounded-full flex items-center justify-center animate-bounce">
          <ArrowDown className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center space-x-8">
          <Link href="/auth/signin" className="text-white/80 hover:text-white transition-colors">
            Entrar
          </Link>
          <Link href="/auth/signup" className="text-white/80 hover:text-white transition-colors">
            Criar Conta
          </Link>
        </div>
      </div>
    </div>
  );
}
