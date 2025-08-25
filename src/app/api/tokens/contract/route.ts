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
      'linea': 'linea',
      'solana': 'solana',
      'tron': 'tron',
      'cardano': 'cardano',
      'polkadot': 'polkadot',
      'cosmos': 'cosmos',
      'binance': 'binancecoin',
      'bitcoin': 'bitcoin',
      'litecoin': 'litecoin',
      'dogecoin': 'dogecoin',
      'ripple': 'ripple'
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

    console.log('📡 Status da resposta CoinGecko:', response.status);
    console.log('📡 Headers da resposta:', Object.fromEntries(response.headers.entries()));

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
      console.log('❌ Token não encontrado por contrato:', response.status, response.statusText);
      
          // Para Solana, verificar se é um NFT ou token
    if (network.toLowerCase() === 'solana') {
      console.log('🔄 Verificando se é NFT ou token Solana...');
      
      // Verificar se o endereço tem características de NFT (mais específico)
      const isLikelyNFT = address.length > 50 || 
                         (address.length > 44 && !address.startsWith('EPj') && !address.startsWith('Es9') && !address.startsWith('So') && !address.startsWith('DezX'));
      
      if (isLikelyNFT) {
        return NextResponse.json({ 
          success: false, 
          message: `Este endereço parece ser um NFT Solana, não um token fungível. Para NFTs, use a aba "Por Nome" e busque pelo nome da coleção ou projeto.`,
          suggestion: 'use_name_search',
          isNFT: true,
          status: 404
        }, { status: 404 });
      }
      
             // Tentar buscar o token por nome usando a API de search
       try {
         console.log('🔄 Tentando buscar token por nome na CoinGecko...');
         
         // Tentar buscar por "blockasset" (nome do token)
         const searchUrl = `${COINGECKO_BASE_URL}/search?query=blockasset`;
         const searchResponse = await fetch(searchUrl, {
           headers: {
             'Accept': 'application/json',
             'User-Agent': 'SenhorBarriga-Portfolio/1.0'
           },
           cache: 'no-store'
         });
         
         if (searchResponse.ok) {
           const searchData = await searchResponse.json();
           console.log('📊 Resultados da busca por nome:', searchData.coins?.length || 0);
           
           // Procurar por tokens que contenham "blockasset" no nome ou símbolo
           const matchingTokens = (searchData.coins || []).filter((coin: any) => 
             coin.name.toLowerCase().includes('blockasset') || 
             coin.symbol.toLowerCase().includes('blockasset')
           );
           
           if (matchingTokens.length > 0) {
             console.log('✅ Token encontrado por nome:', matchingTokens[0].name);
             
             const token = {
               id: matchingTokens[0].id,
               name: matchingTokens[0].name,
               symbol: matchingTokens[0].symbol.toUpperCase(),
               imageUrl: matchingTokens[0].large || matchingTokens[0].image || null,
               marketCapRank: matchingTokens[0].market_cap_rank || null,
               contractAddress: address,
               network: network,
               foundBySearch: true
             };
             
             return NextResponse.json({ 
               success: true, 
               token,
               message: 'Token encontrado por busca alternativa'
             });
           }
         }
       } catch (searchError) {
         console.log('❌ Erro na busca por nome:', searchError);
       }
       
       // Se não encontrou, retornar sugestão para usar busca por nome
       return NextResponse.json({ 
         success: false, 
         message: `Token não encontrado por contrato na rede ${network}. Para tokens Solana, tente usar a aba "Por Nome" e buscar por "Blockasset".`,
         suggestion: 'use_name_search',
         status: 404
       }, { status: 404 });
    }
      
      let errorMessage = 'Token não encontrado na CoinGecko';
      
      if (response.status === 404) {
        errorMessage = `Token não encontrado na rede ${network}. Verifique se o endereço do contrato está correto e se o token está listado na CoinGecko.`;
      } else if (response.status === 429) {
        errorMessage = 'Limite de requisições excedido. Tente novamente em alguns minutos.';
      } else if (response.status >= 500) {
        errorMessage = 'Erro no servidor da CoinGecko. Tente novamente mais tarde.';
      }
      
      return NextResponse.json({ 
        success: false, 
        message: errorMessage,
        status: response.status
      }, { status: response.status });
    }

  } catch (error) {
    console.error('❌ Erro na busca de token por contrato:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
