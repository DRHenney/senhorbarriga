const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testContractAPI() {
  console.log('🧪 Testando API de contrato...');
  
  // Teste com USDT (endereço real)
  const address = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  const network = 'ethereum';
  
  try {
    const response = await fetch(`http://localhost:3000/api/tokens/contract?address=${address}&network=${network}`);
    
    console.log('📡 Status da resposta:', response.status);
    console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Resposta da API:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Erro na resposta:', errorText);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

// Executar o teste
testContractAPI();
