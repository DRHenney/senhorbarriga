import { NextResponse } from 'next/server';

// GET - API de teste com dados mockados
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        success: false, 
        message: 'Query deve ter pelo menos 2 caracteres' 
      }, { status: 400 });
    }

    console.log('🧪 Teste: Buscando tokens para:', query);

    // Dados mockados para teste
    const mockTokens = [
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'BTC',
        imageUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        marketCapRank: 1,
        score: 0.95
      },
      {
        id: 'ethereum',
        name: 'Ethereum',
        symbol: 'ETH',
        imageUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        marketCapRank: 2,
        score: 0.90
      },
      {
        id: 'binancecoin',
        name: 'BNB',
        symbol: 'BNB',
        imageUrl: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
        marketCapRank: 3,
        score: 0.85
      }
    ];

    // Filtrar tokens que correspondem à query
    const filteredTokens = mockTokens.filter(token => 
      token.name.toLowerCase().includes(query.toLowerCase()) ||
      token.symbol.toLowerCase().includes(query.toLowerCase())
    );

    console.log('🧪 Teste: Tokens encontrados:', filteredTokens.length);

    return NextResponse.json({ 
      success: true, 
      tokens: filteredTokens
    });

  } catch (error) {
    console.error('❌ Erro na API de teste:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
