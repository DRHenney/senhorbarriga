const http = require('http');

function testServer() {
  console.log('🧪 Testando se o servidor está respondendo...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/test-connection',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log('📡 Status:', res.statusCode);
    console.log('📡 Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ Resposta:', data);
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erro:', error.message);
  });

  req.end();
}

testServer();
