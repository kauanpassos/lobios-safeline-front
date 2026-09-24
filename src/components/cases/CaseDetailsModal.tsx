import { useEffect, useState } from 'react';
import { X, Clock, FileText, CheckCircle, ShieldAlert, MessageSquare } from 'lucide-react';
import { apiFetch } from '../../services/api';

interface CaseDetails {
  id: string;
  category: string;
  title: string;
  content: string;
  description?: string;
  status: string;
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
    category: payload.category,
    title: isString(payload.title) ? payload.title : '',
    content: payload.content,
    description: isString(payload.description) ? payload.description : undefined,
    status: payload.status,
    createdAt: payload.createdAt,
  };
};



interface CaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string | null;
  onOpenChat: (caseId: string) => void;
}

export function CaseDetailsModal({ isOpen, onClose, caseId, onOpenChat }: CaseDetailsModalProps) {
  const [caseItem, setCaseItem] = useState<CaseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      if (!caseId) return;
      
      setIsLoading(true);
      setError('');
      setCaseItem(null);
      
      try {
        const caseRes = await apiFetch(`/api/v1/cases/${caseId}`, { signal: abortController.signal }, parseCaseDetails);
        setCaseItem(caseRes);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError('Não foi possível carregar os detalhes.');
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    if (isOpen && caseId) {
      void fetchData();
    }

    return () => {
      abortController.abort();
    };
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
              Denúncia: {caseItem?.title || 'Carregando...'}
            </h2>
            {caseItem && (
              <p className="text-sm text-gray-500 mt-1">
                Registrado em {new Date(caseItem.createdAt).toLocaleDateString('pt-br')}
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
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase text-gray-500">Categoria</span>
                  <p className="text-gray-800 font-medium">{caseItem.category}</p>
                </div>
                <button
                  onClick={() => onOpenChat(caseItem.id)}
                  className="flex items-center justify-center px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-sm"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Abrir Chat / Mensagens
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="flex items-center text-sm font-bold uppercase tracking-wider text-gray-700 mb-4 pb-2 border-b border-gray-200">
                  <FileText className="w-4 h-4 mr-2 text-emerald-600" />
                  Relato Original
                </h3>
                
                <div>
                  <p className="mt-1 text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                    {caseItem.content || caseItem.description}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}