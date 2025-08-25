'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative z-50">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">SB</span>
              </div>
              <span className="text-white font-bold text-xl">Senhor Barriga</span>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                Recursos
              </a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors">
                Sobre
              </a>
              <Link 
                href="/auth/signin"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              >
                Entrar
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden mt-4 bg-slate-800 rounded-lg p-4"
            >
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                  Recursos
                </a>
                <a href="#about" className="text-gray-300 hover:text-white transition-colors">
                  Sobre
                </a>
                <Link 
                  href="/auth/signin"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg text-center"
                >
                  Entrar
                </Link>
              </div>
            </motion.div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6"
          >
            Gerencie seus
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {" "}investimentos
            </span>
            <br />
            com inteligência
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Acompanhe seus tokens, operações de grid e pools em uma plataforma moderna e intuitiva. 
            Tome decisões informadas com dados em tempo real.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/auth/signup"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
            >
              Começar Agora
            </Link>
            <Link
              href="/auth/signin"
              className="border-2 border-purple-500 text-purple-400 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-500 hover:text-white transition-all duration-300"
            >
              Já tenho conta
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Recursos Principais</h2>
          <p className="text-gray-300 text-lg">Tudo que você precisa para gerenciar seus investimentos</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "📊",
              title: "Dashboard Intuitivo",
              description: "Visualize todos os seus investimentos em uma interface moderna e fácil de usar"
            },
            {
              icon: "🪙",
              title: "Gestão de Tokens",
              description: "Acompanhe seus tokens com preços em tempo real via CoinGecko API"
            },
            {
              icon: "🤖",
              title: "Operações de Grid",
              description: "Gerencie suas operações de grid trading de forma organizada"
            },
            {
              icon: "🏊",
              title: "Pools de Liquidez",
              description: "Controle suas participações em pools de liquidez"
            },
            {
              icon: "📈",
              title: "Análise de Performance",
              description: "Acompanhe a evolução dos seus investimentos ao longo do tempo"
            },
            {
              icon: "🔒",
              title: "Segurança Total",
              description: "Seus dados ficam seguros com autenticação e criptografia"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-purple-500 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-white mb-8">Sobre o Senhor Barriga</h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              O Senhor Barriga é uma plataforma completa para gestão de investimentos em criptomoedas. 
              Desenvolvida com tecnologias modernas, oferece uma experiência intuitiva para acompanhar 
              seus tokens, operações de grid trading e participações em pools de liquidez.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              Nossa missão é simplificar a gestão de portfólios cripto, fornecendo ferramentas 
              poderosas em uma interface amigável, permitindo que você tome decisões informadas 
              sobre seus investimentos.
            </p>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-12 border border-purple-500/30"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Pronto para começar?</h2>
          <p className="text-gray-300 text-lg mb-8">
            Junte-se a milhares de investidores que já confiam no Senhor Barriga
          </p>
          <Link
            href="/auth/signup"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
          >
            Criar Conta Gratuita
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-slate-700">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SB</span>
            </div>
            <span className="text-white font-semibold">Senhor Barriga</span>
          </div>
          <p className="text-gray-400">
            © 2024 Senhor Barriga. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
