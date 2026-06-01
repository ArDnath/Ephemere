import WebSocket from 'ws';

console.log('Connecting to ws://localhost:8080...');
const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
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

ws.on('message', (data) => {
  console.log('📩 Received message from server:', data.toString());
  ws.close();
  process.exit(0);
});

ws.on('error', (err) => {
  console.error('❌ Connection error:', err);
  process.exit(1);
});

setTimeout(() => {
  console.error('❌ Connection timed out after 5 seconds');
  ws.close();
  process.exit(1);
}, 5000);
