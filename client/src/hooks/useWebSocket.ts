import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketOptions {
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onMessage?: (data: any) => void;
  onError?: (event: Event) => void;
  reconnectInterval?: number;
  reconnectAttempts?: number;
  automaticOpen?: boolean;
}

export const useWebSocket = (options: WebSocketOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  
  const {
    onOpen,
    onClose,
    onMessage,
    onError,
    reconnectInterval = 5000,
    reconnectAttempts = 5,
    automaticOpen = true
  } = options;
  
  const connect = useCallback(() => {
    if (webSocketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = (event) => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      if (onOpen) onOpen(event);
    };
    
    ws.onclose = (event) => {
      setIsConnected(false);
      if (onClose) onClose(event);
      
      // Try to reconnect
      if (reconnectAttemptsRef.current < reconnectAttempts) {
        reconnectTimeoutRef.current = window.setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          connect();
        }, reconnectInterval) as unknown as number;
      }
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        if (onMessage) onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    ws.onerror = (event) => {
      if (onError) onError(event);
    };
    
    webSocketRef.current = ws;
    
    // Setup ping interval to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
    
    return () => {
      clearInterval(pingInterval);
    };
  }, [onOpen, onClose, onMessage, onError, reconnectInterval, reconnectAttempts]);
  
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }
  }, []);
  
  const sendMessage = useCallback((data: any) => {
    if (webSocketRef.current?.readyState === WebSocket.OPEN) {
      webSocketRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);
  
  useEffect(() => {
    if (automaticOpen) {
      // Only attempt to connect when the component mounts
      connect();
    }
    
    // Only disconnect when the component unmounts
    return () => {
      disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [automaticOpen]); // Removed dependencies to prevent re-connection cycles
  
  return {
    isConnected,
    lastMessage,
    sendMessage,
    connect,
    disconnect
  };
};
