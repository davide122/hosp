import WebSocket from 'ws';

const WEBSOCKET_URL = 'wss://api.openai.com/v1/realtime';

let ws = null;

// 🔹 Connetti WebSocket
export function connectWebSocket(apiKey, threadId, onMessageReceived) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log('✅ WebSocket già connesso!');
    return;
  }

  ws = new WebSocket(WEBSOCKET_URL, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  ws.on('open', () => {
    console.log('✅ WebSocket connesso!');
    ws.send(
      JSON.stringify({
        type: 'subscribe',
        thread_id: threadId,
      })
    );
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data);
    if (message.type === 'message') {
      onMessageReceived(message);
    }
  });

  ws.on('error', (error) => {
    console.error('❌ Errore WebSocket:', error);
  });

  ws.on('close', () => {
    console.log('🔄 WebSocket chiuso, tentativo di riconnessione...');
    setTimeout(() => connectWebSocket(apiKey, threadId, onMessageReceived), 3000);
  });
}

// 🔹 Invia messaggio via WebSocket
export function sendMessage(threadId, content) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn('⚠️ WebSocket non è pronto, impossibile inviare messaggio.');
    return;
  }

  ws.send(
    JSON.stringify({
      type: 'message',
      thread_id: threadId,
      role: 'user',
      content,
    })
  );
}
