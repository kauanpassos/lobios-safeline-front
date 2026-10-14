import { useEffect, useRef, useState, useCallback } from 'react';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';

export interface CaseMessage {
  id?: string;
  caseId: string;
  userId?: string;
  senderUserId?: string;
  senderRole?: string;
  senderType?: string;
  content: string;
  createdAt: string;
  sentAt?: string;
}

interface UseChatConnectionOptions {
  caseId: string | undefined;
  token: string | null;
  baseUrl?: string;
  onMessageReceived?: (message: CaseMessage) => void;
}

const getStoredToken = (fallbackToken?: string | null) => {
  const storageToken = localStorage.getItem('@SafeLine:token');
  return storageToken || fallbackToken || '';
};

export function useChatConnection({
  caseId,
  token,
  baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000',
  onMessageReceived,
}: UseChatConnectionOptions) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const connectionRef = useRef<HubConnection | null>(null);
  const onMessageReceivedRef = useRef(onMessageReceived);

  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
  }, [onMessageReceived]);

  const connect = useCallback(async () => {
    if (!caseId) return;

    if (
      connectionRef.current &&
      connectionRef.current.state !== HubConnectionState.Disconnected
    ) {
      return;
    }

    try {
      setConnectionError(null);

      const connection = new HubConnectionBuilder()
        .withUrl(`${baseUrl}/hub/chat`, {
          accessTokenFactory: () => getStoredToken(token),
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount === 0) return 0;
            if (retryContext.previousRetryCount === 1) return 2000;
            if (retryContext.previousRetryCount === 2) return 10000;
            return 30000;
          },
        })
        .configureLogging(
          import.meta.env.DEV ? LogLevel.Information : LogLevel.Warning
        )
        .build();

      connectionRef.current = connection;

      connection.onreconnecting(() => {
        setIsConnected(false);
        setIsReconnecting(true);
      });

      connection.onreconnected(async () => {
        setIsReconnecting(false);
        setIsConnected(true);
        try {
          await connection.invoke('JoinCaseGroup', caseId);
          setConnectionError(null);
        } catch (err: unknown) {
          console.error('Erro ao reingressar no grupo do caso:', err);
          setConnectionError('Sua permissão de acesso ao caso foi revogada ou expirou.');
          setIsConnected(false);
          await connection.stop();
        }
      });

      connection.onclose((error) => {
        setIsConnected(false);
        setIsReconnecting(false);
        if (error) {
          setConnectionError('Conexão encerrada com erro.');
        }
      });

      connection.on('ReceiveMessage', (message: CaseMessage) => {
        if (onMessageReceivedRef.current) {
          onMessageReceivedRef.current(message);
        }
      });

      await connection.start();
      await connection.invoke('JoinCaseGroup', caseId);

      setIsConnected(true);
      setIsReconnecting(false);
    } catch (err: unknown) {
      console.error('Falha ao conectar no SignalR Hub:', err);
      setIsConnected(false);
      setIsReconnecting(false);
      setConnectionError(
        err instanceof Error
          ? err.message
          : 'Não foi possível estabelecer conexão em tempo real.'
      );
    }
  }, [caseId, token, baseUrl]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void connect();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);

      const conn = connectionRef.current;
      if (conn) {
        conn.off('ReceiveMessage');

        if (conn.state === HubConnectionState.Connected && caseId) {
          conn
            .invoke('LeaveCaseGroup', caseId)
            .catch(() => {})
            .finally(() => {
              conn.stop();
            });
        } else {
          conn.stop();
        }
        connectionRef.current = null;
      }
    };
  }, [connect, caseId]);

  return {
    isConnected,
    isReconnecting,
    connectionError,
    reconnect: connect,
  };
}
