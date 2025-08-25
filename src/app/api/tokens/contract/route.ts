import { NextResponse } from 'next/server';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// GET - Buscar token por endereço de contrato
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const network = searchParams.get('network');

    if (!address || !network) {
      return NextResponse.json({ 
        success: false, 
        message: 'Endereço do contrato e rede são obrigatórios' 
      }, { status: 400 });
    }

    console.log('🔍 Buscando token por contrato:', address, 'na rede:', network);

    // Mapear redes para IDs da CoinGecko
    const networkMap: { [key: string]: string } = {
      'ethereum': 'ethereum',
      'bsc': 'binance-smart-chain',
      'polygon': 'polygon-pos',
      'avalanche': 'avalanche',
      'arbitrum': 'arbitrum-one',
      'optimism': 'optimistic-ethereum',
      'fantom': 'fantom',
      'cronos': 'cronos',
      'base': 'base',
      'linea': 'linea'
    };

    const coinGeckoNetwork = networkMap[network.toLowerCase()];
    if (!coinGeckoNetwork) {
      return NextResponse.json({ 
        success: false, 
        message: `Rede não suportada: ${network}. Redes suportadas: ${Object.keys(networkMap).join(', ')}` 
      }, { status: 400 });
    }

    // Buscar token por contrato na CoinGecko
    const url = `${COINGECKO_BASE_URL}/coins/${coinGeckoNetwork}/contract/${address}`;
    console.log('🌐 URL da busca:', url);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SenhorBarriga-Portfolio/1.0'
      },
      cache: 'no-store'
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Token encontrado:', data.name, data.symbol);
      
      const token = {
        id: data.id,
        name: data.name,
        symbol: data.symbol.toUpperCase(),
        imageUrl: data.image?.large || data.image?.small || null,
        marketCapRank: data.market_cap_rank || null,
        contractAddress: address,
        network: network
      };

      return NextResponse.json({ 
        success: true, 
        token 
      });
    } else {
      console.log('❌ Token não encontrado:', response.status, response.statusText);
      return NextResponse.json({ 
        success: false, 
        message: 'Token não encontrado na CoinGecko' 
      }, { status: 404 });
    }

  } catch (error) {
    console.error('❌ Erro na busca de token por contrato:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
