import React, { useState, useEffect, useRef } from 'react';
import { 
  Stethoscope, 
  Pill, 
  ChevronRight, 
  ArrowLeft, 
  Smartphone, 
  Maximize2, 
  Wifi, 
  Battery,
  Plus,
  Trash2,
  X,
  Search,
  Pencil,
  Check,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

type Screen = 'home' | 'sintoma' | 'medicamento';

interface Medicamento {
  id: string;
  nome: string;
  formulacao: string;
  categoria: string;
  similares?: string[];
  createdAt: number;
}

interface MedicamentoRecomendado {
  id: string;
  nome: string;
  formulacao: string;
  categoria: string;
  observacoes: string;
  createdAt?: number;
}

interface Sintoma {
  id: string;
  nome: string;
  medicamentosRecomendados?: MedicamentoRecomendado[];
  createdAt: number;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(true);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  // Sintomas list and modal state - persists in localStorage
  const [sintomas, setSintomas] = useState<Sintoma[]>(() => {
    try {
      const saved = localStorage.getItem('app_sintomas');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return parsed.map((s: any) => ({
        ...s,
        medicamentosRecomendados: (s.medicamentosRecomendados || []).map((m: any, idx: number) => {
          if (typeof m === 'string') {
            return {
              id: `${s.id}-med-${idx}`,
              nome: m,
              formulacao: '',
              categoria: '',
              observacoes: '',
            };
          }
          return {
            id: m.id || `${s.id}-med-${idx}-${Date.now()}`,
            nome: m.nome || '',
            formulacao: m.formulacao || '',
            categoria: m.categoria || '',
            observacoes: m.observacoes || '',
          };
        }),
      }));
    } catch {
      return [];
    }
  });
  const [isAddSintomaModalOpen, setIsAddSintomaModalOpen] = useState(false);
  const [novoSintomaNome, setNovoSintomaNome] = useState('');
  const [filtroSintoma, setFiltroSintoma] = useState('');

  // Selected symptom for inner menu view
  const [selectedSintomaId, setSelectedSintomaId] = useState<string | null>(null);
  const [isEditingSintomaNome, setIsEditingSintomaNome] = useState(false);
  const [editSintomaNome, setEditSintomaNome] = useState('');

  // Modal and fields for adding recommended medication (Nome, Formulação, Categoria, Observações)
  const [isAddMedRecModalOpen, setIsAddMedRecModalOpen] = useState(false);
  const [novoMedRecNome, setNovoMedRecNome] = useState('');
  const [novoMedRecFormulacao, setNovoMedRecFormulacao] = useState('');
  const [novoMedRecCategoria, setNovoMedRecCategoria] = useState('');
  const [novoMedRecObservacoes, setNovoMedRecObservacoes] = useState('');

  // Editing state for an existing recommended medication
  const [editingMedRecId, setEditingMedRecId] = useState<string | null>(null);
  const [editMedRecNome, setEditMedRecNome] = useState('');
  const [editMedRecFormulacao, setEditMedRecFormulacao] = useState('');
  const [editMedRecCategoria, setEditMedRecCategoria] = useState('');
  const [editMedRecObservacoes, setEditMedRecObservacoes] = useState('');

  const selectedSintoma = sintomas.find((s) => s.id === selectedSintomaId);

  // Persist sintomas in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('app_sintomas', JSON.stringify(sintomas));
    } catch (err) {
      console.error('Erro ao salvar sintomas:', err);
    }
  }, [sintomas]);

  const handleOpenAddSintomaModal = () => {
    setNovoSintomaNome('');
    setIsAddSintomaModalOpen(true);
  };

  const handleAddSintoma = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const nomeTrimmed = novoSintomaNome.trim();
    if (!nomeTrimmed) return;

    const newItem: Sintoma = {
      id: Date.now().toString(),
      nome: nomeTrimmed,
      medicamentosRecomendados: [],
      createdAt: Date.now(),
    };
    setSintomas([newItem, ...sintomas]);
    setNovoSintomaNome('');
    setIsAddSintomaModalOpen(false);
  };

  const handleRemoveSintoma = (id: string) => {
    setSintomas(sintomas.filter((s) => s.id !== id));
    if (selectedSintomaId === id) {
      setSelectedSintomaId(null);
    }
  };

  const handleOpenAddMedRecModal = () => {
    setNovoMedRecNome('');
    setNovoMedRecFormulacao('');
    setNovoMedRecCategoria('');
    setNovoMedRecObservacoes('');
    setIsAddMedRecModalOpen(true);
  };

  const handleAddMedRecomendado = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const nomeTrimmed = novoMedRecNome.trim();
    if (!nomeTrimmed || !selectedSintomaId) return;

    const newMedRec: MedicamentoRecomendado = {
      id: Date.now().toString(),
      nome: nomeTrimmed,
      formulacao: novoMedRecFormulacao.trim(),
      categoria: novoMedRecCategoria.trim(),
      observacoes: novoMedRecObservacoes.trim(),
      createdAt: Date.now(),
    };

    const updated = sintomas.map((s) => {
      if (s.id === selectedSintomaId) {
        const currentMeds = s.medicamentosRecomendados || [];
        return {
          ...s,
          medicamentosRecomendados: [...currentMeds, newMedRec],
        };
      }
      return s;
    });

    setSintomas(updated);
    setNovoMedRecNome('');
    setNovoMedRecFormulacao('');
    setNovoMedRecCategoria('');
    setNovoMedRecObservacoes('');
    setIsAddMedRecModalOpen(false);
  };

  const handleRemoveMedRecomendado = (recId: string) => {
    if (!selectedSintomaId) return;
    const updated = sintomas.map((s) => {
      if (s.id === selectedSintomaId) {
        const currentMeds = s.medicamentosRecomendados || [];
        return {
          ...s,
          medicamentosRecomendados: currentMeds.filter((m) => m.id !== recId),
        };
      }
      return s;
    });
    setSintomas(updated);
  };

  const handleStartEditMedRec = (rec: MedicamentoRecomendado) => {
    setEditingMedRecId(rec.id);
    setEditMedRecNome(rec.nome);
    setEditMedRecFormulacao(rec.formulacao || '');
    setEditMedRecCategoria(rec.categoria || '');
    setEditMedRecObservacoes(rec.observacoes || '');
  };

  const handleCancelEditMedRec = () => {
    setEditingMedRecId(null);
  };

  const handleSaveEditMedRec = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedSintomaId || !editingMedRecId) return;
    const nomeTrimmed = editMedRecNome.trim();
    if (!nomeTrimmed) return;

    const updated = sintomas.map((s) => {
      if (s.id === selectedSintomaId) {
        const currentMeds = s.medicamentosRecomendados || [];
        return {
          ...s,
          medicamentosRecomendados: currentMeds.map((m) => {
            if (m.id === editingMedRecId) {
              return {
                ...m,
                nome: nomeTrimmed,
                formulacao: editMedRecFormulacao.trim(),
                categoria: editMedRecCategoria.trim(),
                observacoes: editMedRecObservacoes.trim(),
              };
            }
            return m;
          }),
        };
      }
      return s;
    });

    setSintomas(updated);
    setEditingMedRecId(null);
  };

  const handleSaveEditSintomaNome = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedSintomaId) return;
    const trimmed = editSintomaNome.trim();
    if (!trimmed) return;

    const updated = sintomas.map((s) => {
      if (s.id === selectedSintomaId) {
        return { ...s, nome: trimmed };
      }
      return s;
    });
    setSintomas(updated);
    setIsEditingSintomaNome(false);
  };

  const sintomasFiltrados = sintomas.filter((s) => {
    if (!filtroSintoma.trim()) return true;
    const q = filtroSintoma.toLowerCase().trim();
    const matchNome = s.nome.toLowerCase().includes(q);
    const matchMeds = (s.medicamentosRecomendados || []).some((m) => {
      const matchMedNome = m.nome.toLowerCase().includes(q);
      const matchFormulacao = m.formulacao?.toLowerCase().includes(q);
      const matchCategoria = m.categoria?.toLowerCase().includes(q);
      const matchObs = m.observacoes?.toLowerCase().includes(q);
      return matchMedNome || matchFormulacao || matchCategoria || matchObs;
    });
    return matchNome || matchMeds;
  });

  // Medicamentos list and modal state - persists in localStorage
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>(() => {
    try {
      const saved = localStorage.getItem('app_medicamentos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Automatically sync any change to medicamentos to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('app_medicamentos', JSON.stringify(medicamentos));
    } catch (err) {
      console.error('Erro ao salvar no armazenamento local:', err);
    }
  }, [medicamentos]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [novoMedicamentoNome, setNovoMedicamentoNome] = useState('');
  const [novaFormulacao, setNovaFormulacao] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('');

  // Selected medication for inner menu view
  const [selectedMedicamentoId, setSelectedMedicamentoId] = useState<string | null>(null);
  const [novoSimilarNome, setNovoSimilarNome] = useState('');

  // Search filter for medications list
  const [filtroMedicamento, setFiltroMedicamento] = useState('');

  // Editing state for formulação and categoria (and nome)
  const [isEditingMedInfo, setIsEditingMedInfo] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editFormulacao, setEditFormulacao] = useState('');
  const [editCategoria, setEditCategoria] = useState('');

  const selectedMed = medicamentos.find(m => m.id === selectedMedicamentoId);

  // Filtered medications by name, formulacao, categoria or similar names
  const medicamentosFiltrados = medicamentos.filter((med) => {
    if (!filtroMedicamento.trim()) return true;
    const q = filtroMedicamento.toLowerCase().trim();
    const matchNome = med.nome.toLowerCase().includes(q);
    const matchFormulacao = med.formulacao.toLowerCase().includes(q);
    const matchCategoria = med.categoria.toLowerCase().includes(q);
    const matchSimilares = (med.similares || []).some(s => s.toLowerCase().includes(q));
    return matchNome || matchFormulacao || matchCategoria || matchSimilares;
  });

  const handleStartEditing = () => {
    if (!selectedMed) return;
    setEditNome(selectedMed.nome);
    setEditFormulacao(selectedMed.formulacao);
    setEditCategoria(selectedMed.categoria);
    setIsEditingMedInfo(true);
  };

  const handleCancelEditing = () => {
    setIsEditingMedInfo(false);
  };

  const handleSaveMedInfo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedMedicamentoId) return;
    const trimmedNome = editNome.trim() || selectedMed?.nome || '';

    const updated = medicamentos.map((med) => {
      if (med.id === selectedMedicamentoId) {
        return {
          ...med,
          nome: trimmedNome,
          formulacao: editFormulacao.trim(),
          categoria: editCategoria.trim(),
        };
      }
      return med;
    });

    setMedicamentos(updated);
    try {
      localStorage.setItem('app_medicamentos', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    setIsEditingMedInfo(false);
  };

  const handleOpenAddModal = () => {
    setNovoMedicamentoNome('');
    setNovaFormulacao('');
    setNovaCategoria('');
    setIsAddModalOpen(true);
  };

  const handleAddMedicamento = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const nomeTrimmed = novoMedicamentoNome.trim();
    if (!nomeTrimmed) return;

    const newItem: Medicamento = {
      id: Date.now().toString(),
      nome: nomeTrimmed,
      formulacao: novaFormulacao.trim(),
      categoria: novaCategoria.trim(),
      similares: [],
      createdAt: Date.now(),
    };
    const updated = [newItem, ...medicamentos];
    setMedicamentos(updated);
    try {
      localStorage.setItem('app_medicamentos', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    setNovoMedicamentoNome('');
    setNovaFormulacao('');
    setNovaCategoria('');
    setIsAddModalOpen(false);
  };

  const handleRemoveMedicamento = (id: string) => {
    const updated = medicamentos.filter((m) => m.id !== id);
    setMedicamentos(updated);
    if (selectedMedicamentoId === id) {
      setSelectedMedicamentoId(null);
    }
    try {
      localStorage.setItem('app_medicamentos', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSimilar = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = novoSimilarNome.trim();
    if (!trimmed || !selectedMedicamentoId) return;

    const updated = medicamentos.map(med => {
      if (med.id === selectedMedicamentoId) {
        const currentSimilares = med.similares || [];
        return {
          ...med,
          similares: [...currentSimilares, trimmed]
        };
      }
      return med;
    });

    setMedicamentos(updated);
    try {
      localStorage.setItem('app_medicamentos', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    setNovoSimilarNome('');
  };

  const handleRemoveSimilar = (indexToRemove: number) => {
    if (!selectedMedicamentoId) return;
    const updated = medicamentos.map(med => {
      if (med.id === selectedMedicamentoId) {
        const currentSimilares = med.similares || [];
        return {
          ...med,
          similares: currentSimilares.filter((_, idx) => idx !== indexToRemove)
        };
      }
      return med;
    });

    setMedicamentos(updated);
    try {
      localStorage.setItem('app_medicamentos', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  // Export & Import references, state and handlers
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<{
    sintomas: Sintoma[];
    medicamentos: Medicamento[];
    fileName: string;
  } | null>(null);
  const [importStatusMessage, setImportStatusMessage] = useState<{
    type: 'success' | 'error';
    title: string;
    description: string;
  } | null>(null);

  // Generate and download a JSON file with all app data
  const handleExportData = () => {
    try {
      const backupData = {
        app: 'Guia de Medicamentos e Sintomas',
        version: 1,
        exportedAt: new Date().toISOString(),
        totalSintomas: sintomas.length,
        totalMedicamentos: medicamentos.length,
        sintomas,
        medicamentos,
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      const now = new Date();
      const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      link.href = url;
      link.download = `backup_medicamentos_sintomas_${dateFormatted}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportNotice(`Arquivo "backup_medicamentos_sintomas_${dateFormatted}.json" exportado com sucesso!`);
      setTimeout(() => setExportNotice(null), 5000);
    } catch (err) {
      console.error('Erro ao exportar dados:', err);
      setImportStatusMessage({
        type: 'error',
        title: 'Erro ao exportar',
        description: 'Não foi possível gerar o arquivo de backup no momento.',
      });
    }
  };

  // Trigger native phone file browser for .json file
  const handleTriggerImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Process selected file from phone
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        let rawSintomas: any[] = [];
        let rawMedicamentos: any[] = [];

        if (Array.isArray(parsed.sintomas)) {
          rawSintomas = parsed.sintomas;
        } else if (Array.isArray(parsed)) {
          rawSintomas = parsed.filter((item: any) => item && (item.medicamentosRecomendados !== undefined || item.nome));
        }

        if (Array.isArray(parsed.medicamentos)) {
          rawMedicamentos = parsed.medicamentos;
        }

        // Sanitize Sintomas
        const sanitizedSintomas: Sintoma[] = rawSintomas.map((s: any, idx: number) => ({
          id: s.id || `sintoma-${Date.now()}-${idx}`,
          nome: typeof s.nome === 'string' ? s.nome : 'Sintoma',
          createdAt: typeof s.createdAt === 'number' ? s.createdAt : Date.now(),
          medicamentosRecomendados: Array.isArray(s.medicamentosRecomendados)
            ? s.medicamentosRecomendados.map((m: any, mIdx: number) => {
                if (typeof m === 'string') {
                  return {
                    id: `medrec-${Date.now()}-${idx}-${mIdx}`,
                    nome: m,
                    formulacao: '',
                    categoria: '',
                    observacoes: '',
                  };
                }
                return {
                  id: m.id || `medrec-${Date.now()}-${idx}-${mIdx}`,
                  nome: m.nome || '',
                  formulacao: m.formulacao || '',
                  categoria: m.categoria || '',
                  observacoes: m.observacoes || '',
                  createdAt: m.createdAt,
                };
              })
            : [],
        }));

        // Sanitize Medicamentos
        const sanitizedMedicamentos: Medicamento[] = rawMedicamentos.map((m: any, idx: number) => ({
          id: m.id || `med-${Date.now()}-${idx}`,
          nome: typeof m.nome === 'string' ? m.nome : 'Medicamento',
          formulacao: typeof m.formulacao === 'string' ? m.formulacao : '',
          categoria: typeof m.categoria === 'string' ? m.categoria : '',
          similares: Array.isArray(m.similares) ? m.similares.filter((x: any) => typeof x === 'string') : [],
          createdAt: typeof m.createdAt === 'number' ? m.createdAt : Date.now(),
        }));

        setPendingImport({
          sintomas: sanitizedSintomas,
          medicamentos: sanitizedMedicamentos,
          fileName: file.name,
        });
      } catch (err) {
        console.error('Erro ao ler arquivo de importação:', err);
        setImportStatusMessage({
          type: 'error',
          title: 'Arquivo inválido',
          description: 'O arquivo selecionado não contém um formato de backup JSON válido.',
        });
      }
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  // Strictly replace all existing data with imported data (NO SUMMING/MERGING)
  const handleConfirmReplaceImport = () => {
    if (!pendingImport) return;

    // Completely replace state
    setSintomas(pendingImport.sintomas);
    setMedicamentos(pendingImport.medicamentos);
    setSelectedSintomaId(null);
    setSelectedMedicamentoId(null);

    // Completely replace localStorage
    try {
      localStorage.setItem('app_sintomas', JSON.stringify(pendingImport.sintomas));
      localStorage.setItem('app_medicamentos', JSON.stringify(pendingImport.medicamentos));
    } catch (err) {
      console.error('Erro ao sincronizar localStorage na importação:', err);
    }

    setImportStatusMessage({
      type: 'success',
      title: 'Importação concluída com sucesso!',
      description: `Todas as informações anteriores do app foram totalmente substituídas. Foram carregados ${pendingImport.sintomas.length} sintomas e ${pendingImport.medicamentos.length} medicamentos.`,
    });

    setPendingImport(null);
  };

  // Current system time for the Android status bar simulation
  const currentTime = new Date().toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-0 md:p-6 select-none font-sans">
      {/* Desktop view switcher (allows user to preview as Android phone or full layout) */}
      <div className="hidden md:flex items-center gap-2 mb-4 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700/60 shadow-md">
        <span className="text-xs font-medium text-slate-400">Modo de visualização:</span>
        <button
          onClick={() => setDeviceFrameMode(true)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
            deviceFrameMode
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          Celular Android
        </button>
        <button
          onClick={() => setDeviceFrameMode(false)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
            !deviceFrameMode
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5" />
          Tela Cheia
        </button>
      </div>

      {/* Main container: either framed as an Android phone or responsive full width */}
      <div 
        className={`w-full transition-all duration-300 flex flex-col ${
          deviceFrameMode 
            ? 'max-w-[390px] h-[844px] max-h-[92vh] bg-slate-950 rounded-[44px] border-[10px] border-slate-800 shadow-2xl relative overflow-hidden' 
            : 'max-w-xl min-h-[640px] bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden'
        }`}
      >
        {/* Android Status Bar */}
        <div className="w-full bg-slate-950/90 text-slate-400 px-6 pt-3 pb-2 flex items-center justify-between text-xs tracking-wide shrink-0">
          <div className="flex items-center gap-1.5 font-medium text-slate-200">
            <span>{currentTime}</span>
          </div>

          {/* Android camera punch hole for realism when in frame mode */}
          {deviceFrameMode && (
            <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-800 shadow-inner"></div>
          )}

          <div className="flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Dynamic App Screens */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-900">
          {currentScreen === 'home' && (
            <div className="flex-1 flex flex-col px-6 py-6 justify-between animate-fadeIn">
              {/* Header */}
              <div className="pt-8 pb-4 text-center">
                <h1 className="text-xl font-semibold text-slate-100 tracking-tight">
                  Selecione uma das opções abaixo
                </h1>
              </div>

              {/* Main Options: SINTOMA and MEDICAMENTO */}
              <div className="my-auto space-y-4 py-4">
                {/* Opção 1: SINTOMA */}
                <button
                  type="button"
                  onClick={() => setCurrentScreen('sintoma')}
                  className="w-full text-left bg-gradient-to-br from-slate-800 to-slate-850 hover:from-slate-750 hover:to-slate-800 active:scale-[0.98] transition-all p-5 rounded-2xl border border-slate-700/80 hover:border-emerald-500/50 shadow-lg group flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors shrink-0">
                      <Stethoscope className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="block text-xl font-bold text-white tracking-wide group-hover:text-emerald-300 transition-colors">
                        SINTOMA
                      </span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-emerald-600 group-hover:border-emerald-500 transition-all shrink-0">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>

                {/* Opção 2: MEDICAMENTO */}
                <button
                  type="button"
                  onClick={() => setCurrentScreen('medicamento')}
                  className="w-full text-left bg-gradient-to-br from-slate-800 to-slate-850 hover:from-slate-750 hover:to-slate-800 active:scale-[0.98] transition-all p-5 rounded-2xl border border-slate-700/80 hover:border-cyan-500/50 shadow-lg group flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors shrink-0">
                      <Pill className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="block text-xl font-bold text-white tracking-wide group-hover:text-cyan-300 transition-colors">
                        MEDICAMENTO
                      </span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-cyan-600 group-hover:border-cyan-500 transition-all shrink-0">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>

                {/* Backup & Transferência (EXPORTAR e IMPORTAR) */}
                <div className="pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Botão EXPORTAR */}
                    <button
                      type="button"
                      onClick={handleExportData}
                      className="flex items-center justify-center gap-2 py-3 px-3 bg-slate-800/90 hover:bg-slate-750 active:scale-95 text-emerald-400 hover:text-emerald-300 font-bold text-xs rounded-xl border border-slate-700/80 shadow-md transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>EXPORTAR</span>
                    </button>

                    {/* Botão IMPORTAR */}
                    <button
                      type="button"
                      onClick={handleTriggerImport}
                      className="flex items-center justify-center gap-2 py-3 px-3 bg-slate-800/90 hover:bg-slate-750 active:scale-95 text-cyan-400 hover:text-cyan-300 font-bold text-xs rounded-xl border border-slate-700/80 shadow-md transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      <span>IMPORTAR</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 text-center mt-2 font-medium">
                    Salvar arquivo ou carregar ao trocar de celular
                  </p>
                </div>

                {/* Feedback Toast de Exportação */}
                {exportNotice && (
                  <div className="p-3 bg-emerald-950/90 border border-emerald-600/50 rounded-xl flex items-center gap-2.5 text-xs text-emerald-200 animate-fadeIn shadow-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="flex-1 font-medium">{exportNotice}</span>
                  </div>
                )}
              </div>

              {/* Input invisível para seleção de arquivo pelo botão IMPORTAR */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Bottom spacing */}
              <div className="py-2"></div>
            </div>
          )}

          {/* SINTOMA View */}
          {currentScreen === 'sintoma' && (
            <div className="flex-1 flex flex-col p-5 animate-fadeIn relative">
              {/* Scenario 1: Inner Menu of a Selected Symptom */}
              {selectedSintomaId && selectedSintoma ? (
                <div className="flex-1 flex flex-col animate-fadeIn">
                  {/* Top Bar for Inner Menu */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setIsEditingSintomaNome(false);
                          setSelectedSintomaId(null);
                        }}
                        className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-750 active:scale-95 transition-all"
                        aria-label="Voltar para a lista de sintomas"
                        title="Voltar"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">
                          {selectedSintoma.nome}
                        </h2>
                        <span className="text-[11px] text-emerald-400 font-medium">
                          Medicamentos Recomendados
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body of Inner Menu */}
                  <div className="flex-1 flex flex-col pt-4 overflow-y-auto space-y-4">
                    {/* Symptom Summary Card */}
                    <div className="p-4 bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-sm space-y-3">
                      {!isEditingSintomaNome ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                              <Stethoscope className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-xs text-slate-400 font-medium block">
                                Sintoma Selecionado
                              </span>
                              <span className="text-lg font-bold text-white">
                                {selectedSintoma.nome}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setEditSintomaNome(selectedSintoma.nome);
                              setIsEditingSintomaNome(true);
                            }}
                            className="px-2.5 py-1.5 bg-slate-750 hover:bg-slate-700 active:scale-95 text-emerald-300 hover:text-emerald-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
                            title="Editar nome do sintoma"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Editar
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleSaveEditSintomaNome} className="space-y-3 animate-fadeIn">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                              Nome do Sintoma
                            </label>
                            <input
                              type="text"
                              value={editSintomaNome}
                              onChange={(e) => setEditSintomaNome(e.target.value)}
                              autoFocus
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsEditingSintomaNome(false)}
                              className="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-medium"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Salvar
                            </button>
                          </div>
                        </form>
                      )}
                    </div>

                    {/* Recommended Medications Section */}
                    <div className="p-4 bg-slate-800/60 border border-slate-700/70 rounded-2xl shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white tracking-tight">
                            Medicamentos Recomendados
                          </h3>
                          <p className="text-xs text-slate-400">
                            Remédios indicados para este sintoma
                          </p>
                        </div>
                        <span className="text-xs px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800/60 rounded-md font-semibold">
                          {(selectedSintoma.medicamentosRecomendados || []).length}
                        </span>
                      </div>

                      {/* Button to open Add Recommended Medication Modal */}
                      <button
                        type="button"
                        onClick={handleOpenAddMedRecModal}
                        className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/30 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Medicamento Recomendado
                      </button>

                      {/* List of Recommended Medications */}
                      <div className="pt-2">
                        {(!selectedSintoma.medicamentosRecomendados || selectedSintoma.medicamentosRecomendados.length === 0) ? (
                          <div className="text-center py-6 px-3 border border-dashed border-slate-700/60 rounded-xl space-y-1.5">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-1">
                              <Pill className="w-5 h-5 text-emerald-400/70" />
                            </div>
                            <p className="text-xs text-slate-300 font-medium">
                              Nenhum medicamento recomendado cadastrado ainda.
                            </p>
                            <p className="text-[11px] text-slate-500 max-w-[240px] mx-auto">
                              Toque no botão acima para adicionar Nome, Formulação, Categoria e Observações.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {selectedSintoma.medicamentosRecomendados.map((medRec) => {
                              const isEditing = editingMedRecId === medRec.id;

                              if (isEditing) {
                                return (
                                  <form
                                    key={medRec.id}
                                    onSubmit={handleSaveEditMedRec}
                                    className="p-3.5 bg-slate-900 border border-emerald-500/50 rounded-xl space-y-2.5 animate-fadeIn shadow-lg"
                                  >
                                    <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                                      <span className="text-xs font-bold text-emerald-300">
                                        Editar Recomendação
                                      </span>
                                      <button
                                        type="button"
                                        onClick={handleCancelEditMedRec}
                                        className="text-slate-400 hover:text-white text-xs"
                                      >
                                        Cancelar
                                      </button>
                                    </div>

                                    <div>
                                      <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
                                        Nome do Medicamento
                                      </label>
                                      <input
                                        type="text"
                                        value={editMedRecNome}
                                        onChange={(e) => setEditMedRecNome(e.target.value)}
                                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                                      />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
                                          Formulação
                                        </label>
                                        <input
                                          type="text"
                                          value={editMedRecFormulacao}
                                          onChange={(e) => setEditMedRecFormulacao(e.target.value)}
                                          placeholder="Ex: 500mg, Gotas..."
                                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
                                          Categoria
                                        </label>
                                        <input
                                          type="text"
                                          value={editMedRecCategoria}
                                          onChange={(e) => setEditMedRecCategoria(e.target.value)}
                                          placeholder="Ex: Analgésico..."
                                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
                                        Observações
                                      </label>
                                      <textarea
                                        rows={2}
                                        value={editMedRecObservacoes}
                                        onChange={(e) => setEditMedRecObservacoes(e.target.value)}
                                        placeholder="Ex: Tomar de 8/8h após as refeições..."
                                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                                      />
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                      <button
                                        type="button"
                                        onClick={handleCancelEditMedRec}
                                        className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-medium"
                                      >
                                        Cancelar
                                      </button>
                                      <button
                                        type="submit"
                                        disabled={!editMedRecNome.trim()}
                                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        Salvar
                                      </button>
                                    </div>
                                  </form>
                                );
                              }

                              return (
                                <div
                                  key={medRec.id}
                                  className="p-3 bg-slate-900 border border-slate-750 rounded-xl space-y-2.5 shadow-xs hover:border-slate-700 transition-colors"
                                >
                                  {/* Title row with Name and action buttons */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                        <Pill className="w-4 h-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <span className="text-sm font-bold text-slate-100 block truncate">
                                          {medRec.nome}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditMedRec(medRec)}
                                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-slate-800 flex items-center justify-center transition-colors"
                                        title="Editar recomendação"
                                        aria-label={`Editar ${medRec.nome}`}
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveMedRecomendado(medRec.id)}
                                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors"
                                        title="Remover recomendação"
                                        aria-label={`Remover ${medRec.nome}`}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Formulação and Categoria Pills */}
                                  {(medRec.formulacao || medRec.categoria) && (
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      {medRec.formulacao && (
                                        <div className="text-[11px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md font-medium">
                                          <span className="text-slate-400 text-[10px] mr-1">Formulação:</span>
                                          {medRec.formulacao}
                                        </div>
                                      )}
                                      {medRec.categoria && (
                                        <div className="text-[11px] bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-md font-medium">
                                          <span className="text-emerald-400/80 text-[10px] mr-1">Categoria:</span>
                                          {medRec.categoria}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Observações Block */}
                                  {medRec.observacoes && (
                                    <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs space-y-1">
                                      <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>Observações</span>
                                      </div>
                                      <p className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-wrap pl-5">
                                        {medRec.observacoes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom button to return to list */}
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingSintomaNome(false);
                        setSelectedSintomaId(null);
                      }}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 active:scale-98 transition-all"
                    >
                      Voltar à lista de sintomas
                    </button>
                  </div>
                </div>
              ) : (
                /* Scenario 2: Main List of Symptoms */
                <>
                  {/* Top Bar with Back button and "+" in the top right corner */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setCurrentScreen('home')}
                        className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-750 active:scale-95 transition-all"
                        aria-label="Voltar para a tela inicial"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">
                          SINTOMA
                        </h2>
                        <span className="text-[11px] text-emerald-400 font-medium">
                          {sintomas.length} {sintomas.length === 1 ? 'cadastrado' : 'cadastrados'}
                        </span>
                      </div>
                    </div>

                    {/* "+" Button in the top right corner */}
                    <button
                      type="button"
                      onClick={handleOpenAddSintomaModal}
                      className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-950/40 transition-all"
                      aria-label="Adicionar novo sintoma"
                      title="Adicionar sintoma"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Search / Filter Input */}
                  {sintomas.length > 0 && (
                    <div className="pt-3 pb-1">
                      <div className="relative flex items-center">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                        <input
                          type="text"
                          value={filtroSintoma}
                          onChange={(e) => setFiltroSintoma(e.target.value)}
                          placeholder="Buscar sintoma ou remédio recomendado..."
                          className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                        />
                        {filtroSintoma && (
                          <button
                            type="button"
                            onClick={() => setFiltroSintoma('')}
                            className="absolute right-2.5 w-5 h-5 rounded-full text-slate-400 hover:text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
                            title="Limpar busca"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* List of Symptoms or Empty / No Filter Results State */}
                  <div className="flex-1 flex flex-col pt-3 overflow-y-auto">
                    {sintomas.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 my-auto">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                          <Stethoscope className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-semibold text-white mb-1">
                          Nenhum sintoma ainda
                        </h3>
                        <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed mb-5">
                          Toque no botão <strong className="text-emerald-400 font-semibold">+</strong> no canto superior direito para cadastrar o primeiro sintoma.
                        </p>
                        <button
                          type="button"
                          onClick={handleOpenAddSintomaModal}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold active:scale-98 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar Sintoma
                        </button>
                      </div>
                    ) : sintomasFiltrados.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 my-auto py-8">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 mb-2.5">
                          <Search className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-semibold text-white mb-1">
                          Nenhum resultado encontrado
                        </h3>
                        <p className="text-xs text-slate-400 max-w-[220px] mb-4">
                          Não encontramos nenhum sintoma para "{filtroSintoma}".
                        </p>
                        <button
                          type="button"
                          onClick={() => setFiltroSintoma('')}
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-emerald-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
                        >
                          Limpar filtro de busca
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5 pb-4">
                        <div className="flex items-center justify-between px-1">
                          <p className="text-xs text-slate-400 font-medium">
                            {filtroSintoma 
                              ? `Resultados (${sintomasFiltrados.length}):` 
                              : 'Toque para ver medicamentos recomendados:'}
                          </p>
                        </div>

                        {sintomasFiltrados.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setSelectedSintomaId(item.id)}
                            className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 rounded-xl flex items-center justify-between gap-3 shadow-sm transition-all cursor-pointer group active:scale-[0.99]"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                                <Stethoscope className="w-4.5 h-4.5" />
                              </div>
                              <div className="truncate">
                                <span className="block text-sm font-bold text-white tracking-tight truncate group-hover:text-emerald-200 transition-colors">
                                  {item.nome}
                                </span>
                                {item.medicamentosRecomendados && item.medicamentosRecomendados.length > 0 && (
                                  <span className="inline-block text-[10px] text-emerald-300 bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 rounded-md font-medium mt-0.5">
                                    {item.medicamentosRecomendados.length} {item.medicamentosRecomendados.length === 1 ? 'remédio recomendado' : 'remédios recomendados'}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveSintoma(item.id);
                                }}
                                className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors"
                                title="Remover sintoma"
                                aria-label={`Remover ${item.nome}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <div className="w-6 h-6 flex items-center justify-center text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all">
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Modal to Add Symptom Name */}
              {isAddSintomaModalOpen && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                  <div className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <Plus className="w-4 h-4" />
                        </div>
                        <h3 className="text-base font-bold text-white">
                          Novo Sintoma
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddSintomaModalOpen(false)}
                        className="w-7 h-7 rounded-full text-slate-400 hover:text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
                        aria-label="Fechar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleAddSintoma} className="space-y-4">
                      <div>
                        <label 
                          htmlFor="sintoma-name-input"
                          className="block text-xs font-semibold text-slate-300 mb-1"
                        >
                          Nome do Sintoma
                        </label>
                        <input
                          id="sintoma-name-input"
                          type="text"
                          value={novoSintomaNome}
                          onChange={(e) => setNovoSintomaNome(e.target.value)}
                          placeholder="Digite o sintoma (ex: Febre, Dor de cabeça...)"
                          autoFocus
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddSintomaModalOpen(false)}
                          className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-medium active:scale-98 transition-all"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={!novoSintomaNome.trim()}
                          className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-md active:scale-98 transition-all"
                        >
                          Salvar Sintoma
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Modal to Add Recommended Medication with 4 typed fields */}
              {isAddMedRecModalOpen && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                  <div className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <Plus className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">
                            Medicamento Recomendado
                          </h3>
                          {selectedSintoma && (
                            <span className="text-[11px] text-emerald-400 block font-medium">
                              Sintoma: {selectedSintoma.nome}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddMedRecModalOpen(false)}
                        className="w-7 h-7 rounded-full text-slate-400 hover:text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
                        aria-label="Fechar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleAddMedRecomendado} className="space-y-3.5">
                      {/* Campo 1: Nome do medicamento */}
                      <div>
                        <label 
                          htmlFor="medrec-nome-input"
                          className="block text-xs font-semibold text-slate-300 mb-1"
                        >
                          1. Nome do medicamento
                        </label>
                        <input
                          id="medrec-nome-input"
                          type="text"
                          value={novoMedRecNome}
                          onChange={(e) => setNovoMedRecNome(e.target.value)}
                          placeholder="Digite o nome (ex: Dipirona, Paracetamol...)"
                          autoFocus
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                        />
                      </div>

                      {/* Campo 2: Formulação */}
                      <div>
                        <label 
                          htmlFor="medrec-formulacao-input"
                          className="block text-xs font-semibold text-slate-300 mb-1"
                        >
                          2. Formulação
                        </label>
                        <input
                          id="medrec-formulacao-input"
                          type="text"
                          value={novoMedRecFormulacao}
                          onChange={(e) => setNovoMedRecFormulacao(e.target.value)}
                          placeholder="Digite a formulação (ex: Comprimido 500mg, Gotas...)"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                        />
                      </div>

                      {/* Campo 3: Categoria */}
                      <div>
                        <label 
                          htmlFor="medrec-categoria-input"
                          className="block text-xs font-semibold text-slate-300 mb-1"
                        >
                          3. Categoria
                        </label>
                        <input
                          id="medrec-categoria-input"
                          type="text"
                          value={novoMedRecCategoria}
                          onChange={(e) => setNovoMedRecCategoria(e.target.value)}
                          placeholder="Digite a categoria (ex: Analgésico, Antitérmico...)"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                        />
                      </div>

                      {/* Campo 4: Observações */}
                      <div>
                        <label 
                          htmlFor="medrec-observacoes-input"
                          className="block text-xs font-semibold text-slate-300 mb-1"
                        >
                          4. Observações
                        </label>
                        <textarea
                          id="medrec-observacoes-input"
                          rows={3}
                          value={novoMedRecObservacoes}
                          onChange={(e) => setNovoMedRecObservacoes(e.target.value)}
                          placeholder="Digite observações (ex: Tomar de 8/8h se persistir a dor, após as refeições...)"
                          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddMedRecModalOpen(false)}
                          className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-medium active:scale-98 transition-all"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={!novoMedRecNome.trim()}
                          className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-md active:scale-98 transition-all"
                        >
                          Salvar Medicamento
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MEDICAMENTO View */}
          {currentScreen === 'medicamento' && (
            <div className="flex-1 flex flex-col p-5 animate-fadeIn relative">
              {/* Scenario 1: Inner Menu of a Selected Medication */}
              {selectedMedicamentoId && selectedMed ? (
                <div className="flex-1 flex flex-col animate-fadeIn">
                  {/* Top Bar for Inner Menu */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedMedicamentoId(null)}
                        className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-750 active:scale-95 transition-all"
                        aria-label="Voltar para a lista de medicamentos"
                        title="Voltar"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">
                          {selectedMed.nome}
                        </h2>
                        <span className="text-[11px] text-cyan-400 font-medium">
                          Informações & Similares
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body of Inner Menu */}
                  <div className="flex-1 flex flex-col pt-4 overflow-y-auto space-y-4">
                    {/* Medication Summary Card & Edit Mode */}
                    <div className="p-4 bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-sm space-y-3">
                      {!isEditingMedInfo ? (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                                <Pill className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-xs text-slate-400 font-medium block">
                                  Medicamento Selecionado
                                </span>
                                <span className="text-lg font-bold text-white">
                                  {selectedMed.nome}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleStartEditing}
                              className="px-2.5 py-1.5 bg-slate-750 hover:bg-slate-700 active:scale-95 text-cyan-300 hover:text-cyan-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
                              title="Editar Formulação e Categoria"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Editar
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60 text-xs">
                            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                              <span className="text-slate-500 block mb-0.5 font-medium">Formulação</span>
                              <span className="font-semibold text-slate-200">
                                {selectedMed.formulacao || 'Não informada'}
                              </span>
                            </div>
                            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                              <span className="text-slate-500 block mb-0.5 font-medium">Categoria</span>
                              <span className="font-semibold text-cyan-300">
                                {selectedMed.categoria || 'Não informada'}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <form onSubmit={handleSaveMedInfo} className="space-y-3 animate-fadeIn">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-750">
                            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                              <Pencil className="w-3.5 h-3.5" />
                              Editar Formulação & Categoria
                            </span>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                              Nome do Medicamento
                            </label>
                            <input
                              type="text"
                              value={editNome}
                              onChange={(e) => setEditNome(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                              Formulação
                            </label>
                            <input
                              type="text"
                              value={editFormulacao}
                              onChange={(e) => setEditFormulacao(e.target.value)}
                              placeholder="Digite a formulação..."
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                              Categoria
                            </label>
                            <input
                              type="text"
                              value={editCategoria}
                              onChange={(e) => setEditCategoria(e.target.value)}
                              placeholder="Digite a categoria..."
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                            />
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={handleCancelEditing}
                              className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-medium active:scale-98 transition-all"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="flex-1 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Salvar Alterações
                            </button>
                          </div>
                        </form>
                      )}
                    </div>

                    {/* Similares Section */}
                    <div className="p-4 bg-slate-800/60 border border-slate-700/70 rounded-2xl shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white tracking-tight">
                            Medicamentos Similares
                          </h3>
                          <p className="text-xs text-slate-400">
                            Cadastre outros nomes ou equivalentes
                          </p>
                        </div>
                        <span className="text-xs px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800/60 rounded-md font-semibold">
                          {(selectedMed.similares || []).length}
                        </span>
                      </div>

                      {/* Add Similar Form */}
                      <form onSubmit={handleAddSimilar} className="flex gap-2">
                        <input
                          type="text"
                          value={novoSimilarNome}
                          onChange={(e) => setNovoSimilarNome(e.target.value)}
                          placeholder="Nome do similar (ex: Novalgina)..."
                          className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                        />
                        <button
                          type="submit"
                          disabled={!novoSimilarNome.trim()}
                          className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl flex items-center gap-1 active:scale-95 transition-all shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Adicionar
                        </button>
                      </form>

                      {/* List of Similares */}
                      <div className="pt-2">
                        {(!selectedMed.similares || selectedMed.similares.length === 0) ? (
                          <div className="text-center py-4 px-2 border border-dashed border-slate-700/60 rounded-xl">
                            <p className="text-xs text-slate-400">
                              Nenhum medicamento similar adicionado ainda.
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Digite o nome no campo acima para cadastrar.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {selectedMed.similares.map((similarNome, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 bg-slate-900 border border-slate-750 rounded-xl flex items-center justify-between gap-2 shadow-xs"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></span>
                                  <span className="text-xs font-medium text-slate-200 truncate">
                                    {similarNome}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSimilar(idx)}
                                  className="w-6 h-6 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md flex items-center justify-center transition-colors shrink-0"
                                  title="Remover similar"
                                  aria-label={`Remover similar ${similarNome}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom button to return to list */}
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingMedInfo(false);
                        setSelectedMedicamentoId(null);
                      }}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 active:scale-98 transition-all"
                    >
                      Voltar à lista de medicamentos
                    </button>
                  </div>
                </div>
              ) : (
                /* Scenario 2: Main List of Medications */
                <>
                  {/* Top Bar with Back button and "+" in the top right corner */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setCurrentScreen('home')}
                        className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-750 active:scale-95 transition-all"
                        aria-label="Voltar para a tela inicial"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">
                          MEDICAMENTO
                        </h2>
                        <span className="text-[11px] text-cyan-400 font-medium">
                          {medicamentos.length} {medicamentos.length === 1 ? 'cadastrado' : 'cadastrados'}
                        </span>
                      </div>
                    </div>

                    {/* "+" Button in the top right corner */}
                    <button
                      type="button"
                      onClick={handleOpenAddModal}
                      className="w-10 h-10 rounded-full bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-cyan-950/40 transition-all"
                      aria-label="Adicionar novo medicamento"
                      title="Adicionar medicamento"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Search / Filter Input */}
                  {medicamentos.length > 0 && (
                    <div className="pt-3 pb-1">
                      <div className="relative flex items-center">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                        <input
                          type="text"
                          value={filtroMedicamento}
                          onChange={(e) => setFiltroMedicamento(e.target.value)}
                          placeholder="Buscar por nome, fórmula, categoria..."
                          className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                        />
                        {filtroMedicamento && (
                          <button
                            type="button"
                            onClick={() => setFiltroMedicamento('')}
                            className="absolute right-2.5 w-5 h-5 rounded-full text-slate-400 hover:text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
                            title="Limpar busca"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* List of Medications or Empty / No Filter Results State */}
                  <div className="flex-1 flex flex-col pt-3 overflow-y-auto">
                    {medicamentos.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 my-auto">
                        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                          <Pill className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-semibold text-white mb-1">
                          Nenhum medicamento ainda
                        </h3>
                        <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed mb-5">
                          Toque no botão <strong className="text-cyan-400 font-semibold">+</strong> no canto superior direito para cadastrar o primeiro medicamento.
                        </p>
                        <button
                          type="button"
                          onClick={handleOpenAddModal}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold active:scale-98 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar Medicamento
                        </button>
                      </div>
                    ) : medicamentosFiltrados.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 my-auto py-8">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 mb-2.5">
                          <Search className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-semibold text-white mb-1">
                          Nenhum resultado encontrado
                        </h3>
                        <p className="text-xs text-slate-400 max-w-[220px] mb-4">
                          Não encontramos nenhum medicamento para "{filtroMedicamento}".
                        </p>
                        <button
                          type="button"
                          onClick={() => setFiltroMedicamento('')}
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-cyan-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
                        >
                          Limpar filtro de busca
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 pb-4">
                        <div className="flex items-center justify-between px-1">
                          <p className="text-xs text-slate-400 font-medium">
                            {filtroMedicamento 
                              ? `Resultados (${medicamentosFiltrados.length}):` 
                              : 'Toque para ver detalhes e similares:'}
                          </p>
                        </div>

                        {medicamentosFiltrados.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setSelectedMedicamentoId(item.id)}
                            className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 rounded-xl flex items-start justify-between gap-3 shadow-sm transition-all cursor-pointer group active:scale-[0.99]"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 group-hover:bg-cyan-500/20 transition-colors">
                                <Pill className="w-4.5 h-4.5" />
                              </div>
                              <div className="min-w-0 space-y-1">
                                <span className="block text-base font-bold text-white tracking-tight leading-snug group-hover:text-cyan-200 transition-colors">
                                  {item.nome}
                                </span>
                                
                                {item.formulacao && (
                                  <div className="text-xs text-slate-300 flex items-center gap-1.5">
                                    <span className="text-slate-500 font-medium">Formulação:</span>
                                    <span>{item.formulacao}</span>
                                  </div>
                                )}

                                {item.categoria && (
                                  <div className="text-xs text-cyan-300/90 flex items-center gap-1.5">
                                    <span className="text-slate-500 font-medium">Categoria:</span>
                                    <span>{item.categoria}</span>
                                  </div>
                                )}

                                {item.similares && item.similares.length > 0 && (
                                  <div className="pt-0.5">
                                    <span className="inline-block text-[10px] text-cyan-300 bg-cyan-950/80 border border-cyan-800/50 px-2 py-0.5 rounded-md font-medium">
                                      {item.similares.length} {item.similares.length === 1 ? 'similar cadastrado' : 'similares cadastrados'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 pt-0.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveMedicamento(item.id);
                                }}
                                className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors"
                                title="Remover medicamento"
                                aria-label={`Remover ${item.nome}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <div className="w-6 h-6 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all">
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Modal to Add Medication with 3 typed fields */}
              {isAddModalOpen && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                  <div className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                          <Plus className="w-4 h-4" />
                        </div>
                        <h3 className="text-base font-bold text-white">
                          Novo Medicamento
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        className="w-7 h-7 rounded-full text-slate-400 hover:text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
                        aria-label="Fechar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleAddMedicamento} className="space-y-3.5">
                      {/* Campo 1: Nome do medicamento */}
                      <div>
                        <label 
                          htmlFor="med-name-input"
                          className="block text-xs font-semibold text-slate-300 mb-1"
                        >
                          1. Nome do medicamento
                        </label>
                        <input
                          id="med-name-input"
                          type="text"
                          value={novoMedicamentoNome}
                          onChange={(e) => setNovoMedicamentoNome(e.target.value)}
                          placeholder="Digite o nome (ex: Dipirona)"
                          autoFocus
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                        />
                      </div>

                      {/* Campo 2: Formulação */}
                      <div>
                        <label 
                          htmlFor="med-formulacao-input"
                          className="block text-xs font-semibold text-slate-300 mb-1"
                        >
                          2. Formulação
                        </label>
                        <input
                          id="med-formulacao-input"
                          type="text"
                          value={novaFormulacao}
                          onChange={(e) => setNovaFormulacao(e.target.value)}
                          placeholder="Digite a formulação (ex: Comprimido 500mg, Gotas...)"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                        />
                      </div>

                      {/* Campo 3: Categoria */}
                      <div>
                        <label 
                          htmlFor="med-categoria-input"
                          className="block text-xs font-semibold text-slate-300 mb-1"
                        >
                          3. Categoria
                        </label>
                        <input
                          id="med-categoria-input"
                          type="text"
                          value={novaCategoria}
                          onChange={(e) => setNovaCategoria(e.target.value)}
                          placeholder="Digite a categoria (ex: Analgésico, Antitérmico...)"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddModalOpen(false)}
                          className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-medium active:scale-98 transition-all"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={!novoMedicamentoNome.trim()}
                          className="flex-1 py-2.5 px-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-md active:scale-98 transition-all"
                        >
                          Salvar Medicamento
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal de Confirmação de Substituição Total na Importação */}
        {pendingImport && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Substituir Dados do App?
                  </h3>
                  <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider">
                    Aviso de Substituição Total
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs text-slate-300">
                <div className="text-[11px] text-slate-400">
                  Arquivo selecionado: <span className="text-white font-medium break-all">{pendingImport.fileName}</span>
                </div>
                <div className="border-t border-slate-800/80 pt-2 space-y-1.5">
                  <p className="font-semibold text-slate-200 text-xs">
                    Dados a serem carregados:
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span>Sintomas:</span>
                    <strong className="text-emerald-400 text-sm">{pendingImport.sintomas.length}</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span>Medicamentos:</span>
                    <strong className="text-cyan-400 text-sm">{pendingImport.medicamentos.length}</strong>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-red-950/50 border border-red-700/50 rounded-xl text-xs text-red-200 leading-relaxed">
                <strong>ATENÇÃO:</strong> Todas as informações atuais do aplicativo serão <strong>100% substituídas</strong> pelas do arquivo selecionado. Não serão somadas aos dados existentes!
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPendingImport(null)}
                  className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-medium active:scale-98 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReplaceImport}
                  className="flex-1 py-2.5 px-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-950/40 active:scale-98 transition-all"
                >
                  Substituir Tudo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Status da Importação / Exportação */}
        {importStatusMessage && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  importStatusMessage.type === 'success' 
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' 
                    : 'bg-red-500/15 border border-red-500/30 text-red-400'
                }`}>
                  {importStatusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <AlertTriangle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {importStatusMessage.title}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {importStatusMessage.description}
              </p>

              <button
                type="button"
                onClick={() => setImportStatusMessage(null)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white transition-all shadow-md active:scale-98 ${
                  importStatusMessage.type === 'success'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-200'
                }`}
              >
                OK, Entendi
              </button>
            </div>
          </div>
        )}

        {/* Android Home Navigation Bar */}
        <div className="w-full bg-slate-950 py-3 flex items-center justify-center shrink-0">
          <div 
            onClick={() => {
              setSelectedMedicamentoId(null);
              setCurrentScreen('home');
            }}
            className="w-32 h-1 bg-slate-600 hover:bg-slate-400 rounded-full cursor-pointer transition-colors"
            title="Ir para tela inicial"
          ></div>
        </div>
      </div>
    </div>
  );
}
