const url = process.env.WS_URL || 'ws://localhost:8787/?roomId=public';

console.log(`Connecting to ${url}...`);
const ws = new WebSocket(url);

ws.addEventListener('open', () => {
  console.log('✅ Connected successfully to WebSocket server!');
  
  const joinPayload = {
    type: 'join',
    payload: {
      roomId: 'public',
      tempId: 'guest-test-123',
      tempName: 'Test Guest',
      tempAvatar: 'avatar1'
    }
  };
  
  console.log('Sending join room message...');
  ws.send(JSON.stringify(joinPayload));
});

ws.addEventListener('message', (event) => {
  console.log('📩 Received message from server:', String(event.data));
  ws.close();
  process.exit(0);
});

ws.addEventListener('error', (event) => {
  console.error('❌ Connection error:', event.message || event.type);
  process.exit(1);
});

setTimeout(() => {
  console.error('❌ Connection timed out after 5 seconds');
  ws.close();
  process.exit(1);
}, 5000);
