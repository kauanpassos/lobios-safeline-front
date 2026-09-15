import { useEffect, useState } from 'react';
import { X, Clock, FileText, CheckCircle, ShieldAlert, MessageSquare, Send } from 'lucide-react';
import { apiFetch } from '../../services/api';

interface CaseDetails {
  id: string;
  protocol: string;
  category: string;
  content: string;
  description?: string;
  status: string;
  createdAt: string;
}

interface Message {
  id: string;
  senderRole: 'User' | 'Admin';
  content: string;
  createdAt: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
);

const isString = (value: unknown): value is string => typeof value === 'string';

const parseCaseDetails = (payload: unknown): CaseDetails => {
  if (!isRecord(payload) || !isString(payload.id) || !isString(payload.category) ||
      !isString(payload.content) || !isString(payload.status) || !isString(payload.createdAt)) {
    throw new Error('Invalid case details response.');
  }

  return {
    id: payload.id,
    protocol: isString(payload.protocol) ? payload.protocol : payload.id.substring(0, 8).toUpperCase(),
    category: payload.category,
    content: payload.content,
    description: isString(payload.description) ? payload.description : undefined,
    status: payload.status,
    createdAt: payload.createdAt,
  };
};

const parseMessages = (payload: unknown): Message[] => {
  if (!Array.isArray(payload)) return [];

  return payload.filter((message): message is Message => (
    isRecord(message) && isString(message.id) &&
    (message.senderRole === 'User' || message.senderRole === 'Admin') &&
    isString(message.content) && isString(message.createdAt)
  ));
};

interface CaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string | null;
}

export function CaseDetailsModal({ isOpen, onClose, caseId }: CaseDetailsModalProps) {
  const [caseItem, setCaseItem] = useState<CaseDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!caseId) return;
      
      setIsLoading(true);
      setError('');
      setCaseItem(null);
      setMessages([]);
      setNewMessage('');
      
      try {
        const [caseRes, messagesRes] = await Promise.all([
          apiFetch(`/api/v1/cases/${caseId}`, {}, parseCaseDetails),
          apiFetch(`/api/v1/cases/${caseId}/messages`, {}, parseMessages).catch(() => [])
        ]);

        setCaseItem(caseRes);
        setMessages(messagesRes);
      } catch {
        setError('Não foi possível carregar os detalhes.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && caseId) {
      void fetchData();
    }
  }, [isOpen, caseId]);

  if (!isOpen) return null;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Em Andamento': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Concluído': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'Pendente': return <Clock className="w-4 h-4 mr-1" />;
      case 'Em Andamento': return <ShieldAlert className="w-4 h-4 mr-1" />;
      case 'Concluído': return <CheckCircle className="w-4 h-4 mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {/* Container do Modal */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Protocolo: {caseItem?.protocol || 'Carregando...'}
            </h2>
            {caseItem && (
              <p className="text-sm text-gray-500 mt-1">
                Registrado em {new Date(caseItem.createdAt).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {caseItem && (
              <span className={`flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(caseItem.status)}`}>
                {getStatusIcon(caseItem.status)}
                {caseItem.status}
              </span>
            )}
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Corpo do Modal (Scrollável) */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : caseItem ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Lado Esquerdo: Relato Original */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h3 className="flex items-center text-sm font-bold uppercase tracking-wider text-gray-700 mb-4 pb-2 border-b border-gray-200">
                    <FileText className="w-4 h-4 mr-2 text-emerald-600" />
                    Relato Original
                  </h3>
                  
                  <div className="mb-4">
                    <span className="text-xs font-semibold uppercase text-gray-500">Categoria</span>
                    <p className="text-gray-800 font-medium">{caseItem.category}</p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold uppercase text-gray-500">Descrição</span>
                    <p className="mt-1 text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                      {caseItem.content || caseItem.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lado Direito: Chat / Histórico */}
              <div className="flex flex-col h-[500px] border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                  <h3 className="flex items-center text-sm font-bold uppercase tracking-wider text-gray-700">
                    <MessageSquare className="w-4 h-4 mr-2 text-emerald-600" />
                    Interações com o RH
                  </h3>
                </div>
                
                {/* Área de Mensagens */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-2">
                      <MessageSquare className="w-8 h-8 opacity-20" />
                      <p className="text-sm">Nenhuma mensagem ainda.</p>
                      <p className="text-xs">O RH enviará atualizações por aqui.</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col max-w-[85%] ${msg.senderRole === 'User' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <span className="text-xs text-gray-400 mb-1 px-1">
                          {msg.senderRole === 'User' ? 'Você' : 'Equipe de RH'} • {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                          msg.senderRole === 'User' 
                            ? 'bg-emerald-600 text-white rounded-tr-none' 
                            : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input de Nova Mensagem */}
                <div className="p-3 bg-white border-t border-gray-100">
                  <div className="flex items-end gap-2">
                    <textarea 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escreva uma mensagem..."
                      className="flex-1 max-h-32 min-h-[44px] p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                      rows={1}
                    />
                    <button 
                      disabled={!newMessage.trim() || caseItem?.status === 'Concluído'}
                      className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}