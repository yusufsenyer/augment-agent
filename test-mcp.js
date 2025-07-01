// Basit MCP server testi
import { spawn } from 'child_process';

const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// MCP protokolü için initialize mesajı
const initMessage = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: {}
    },
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  }
};

// Tools listesi için mesaj
const listToolsMessage = {
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/list',
  params: {}
};

// İstanbul hava durumu testi
const weatherTestMessage = {
  jsonrpc: '2.0',
  id: 3,
  method: 'tools/call',
  params: {
    name: 'get_weather_by_city',
    arguments: {
      city: 'istanbul'
    }
  }
};

server.stdout.on('data', (data) => {
  console.log('Server response:', data.toString());
});

server.stderr.on('data', (data) => {
  console.log('Server started:', data.toString());
  
  // Server başladıktan sonra test mesajlarını gönder
  setTimeout(() => {
    console.log('Sending initialize...');
    server.stdin.write(JSON.stringify(initMessage) + '\n');
    
    setTimeout(() => {
      console.log('Sending list tools...');
      server.stdin.write(JSON.stringify(listToolsMessage) + '\n');
      
      setTimeout(() => {
        console.log('Sending weather test...');
        server.stdin.write(JSON.stringify(weatherTestMessage) + '\n');
        
        setTimeout(() => {
          server.kill();
        }, 3000);
      }, 1000);
    }, 1000);
  }, 1000);
});

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
});
