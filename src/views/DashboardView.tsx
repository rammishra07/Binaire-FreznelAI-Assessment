import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ModelEntity } from '../core/models/ModelEntity';
import { SearchEngine } from '../core/services/SearchEngine';
import { FilterEngine } from '../core/services/FilterEngine';
import { SortEngine } from '../core/services/SortEngine';
import { Debouncer } from '../core/services/Debouncer';
import { CacheManager } from '../core/services/CacheManager';
import { MOCK_MODELS_DATA } from '../data/mockModels';
import { ModelCard } from '../components/ModelCard';
import {
  PipelineTag,
  FamilyTag,
  ArchitectureTag,
  WeightTag,
  SortField,
  SortOrder,
} from '../types/model';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardViewProps {
  isOnline: boolean;
}

const ALL_PIPELINES: PipelineTag[] = [
  'text-generation',
  'text-to-image',
  'automatic-speech-recognition',
  'image-classification',
  'fill-mask',
];

const ALL_FAMILIES: FamilyTag[] = [
  'llama',
  'mistral',
  'stable-diffusion',
  'whisper',
  'bert',
  'resnet',
  'flux',
];

const ALL_ARCHITECTURES: ArchitectureTag[] = [
  'transformer',
  'diffusion',
  'encoder-decoder',
  'cnn',
];

const ALL_WEIGHTS: WeightTag[] = ['float16', 'bfloat16', 'float32', 'int8', 'int4'];

export const DashboardView: React.FC<DashboardViewProps> = ({ isOnline }) => {
  // Master models data state
  const [allModels, setAllModels] = useState<ModelEntity[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelEntity | null>(null);

  // Search Query state
  const [searchNameInput, setSearchNameInput] = useState('');
  const [debouncedName, setDebouncedName] = useState('');
  const [searchFamily, setSearchFamily] = useState('');
  const [matchType, setMatchType] = useState<'substring' | 'prefix'>('substring');

  // Filter Tag state
  const [selectedPipelines, setSelectedPipelines] = useState<PipelineTag[]>([]);
  const [selectedFamilies, setSelectedFamilies] = useState<FamilyTag[]>([]);
  const [selectedArchitectures, setSelectedArchitectures] = useState<ArchitectureTag[]>([]);
  const [selectedWeights, setSelectedWeights] = useState<WeightTag[]>([]);
  const [safetensorMin, setSafetensorMin] = useState<number>(0);
  const [safetensorMax, setSafetensorMax] = useState<number>(35);

  // Sort state
  const [sortField, setSortField] = useState<SortField>('safetensorsCount');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Engines
  const searchEngine = useMemo(() => new SearchEngine(), []);
  const filterEngine = useMemo(() => new FilterEngine(), []);
  const sortEngine = useMemo(() => new SortEngine(), []);
  const cacheManager = CacheManager.getInstance();

  // Custom OOP Debouncer ref for search input (Task 2.2)
  const debouncerRef = useRef<Debouncer<(val: string) => void> | null>(null);

  useEffect(() => {
    debouncerRef.current = new Debouncer((val: string) => {
      setDebouncedName(val);
    }, 300);

    return () => {
      debouncerRef.current?.cancel();
    };
  }, []);

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchNameInput(val);
    debouncerRef.current?.execute(val);
  };

  // Load models on mount & handle offline cache loading (Task 2.8)
  useEffect(() => {
    const initializeModels = async () => {
      let metadata = MOCK_MODELS_DATA;

      if (!isOnline) {
        const cached = await cacheManager.getCachedModels();
        if (cached && cached.length > 0) {
          metadata = cached;
        }
      } else {
        // Cache to IndexedDB when online
        await cacheManager.cacheModels(MOCK_MODELS_DATA);
      }

      const entities = metadata.map((m) => new ModelEntity(m));
      setAllModels(entities);
    };

    initializeModels();
  }, [isOnline]);

  // Execute Search -> Filter -> Sort pipeline
  const filteredAndSortedModels = useMemo(() => {
    // 1. Search Query Parameters (Model Name & Family)
    const searched = searchEngine.search(allModels, {
      modelName: debouncedName,
      modelFamily: searchFamily,
      matchType,
    });

    // 2. Filter Tags (Pipeline, Family, Architecture, Weights, Safetensors min-max)
    const filtered = filterEngine.filter(searched, {
      pipelineTags: selectedPipelines,
      familyTags: selectedFamilies,
      architectureTags: selectedArchitectures,
      weightTags: selectedWeights,
      safetensorRange: {
        min: safetensorMin,
        max: safetensorMax,
      },
    });

    // 3. Sorting (Safetensors count & Alphabetical name A-Z, Z-A)
    return sortEngine.sort(filtered, sortField, sortOrder);
  }, [
    allModels,
    debouncedName,
    searchFamily,
    matchType,
    selectedPipelines,
    selectedFamilies,
    selectedArchitectures,
    selectedWeights,
    safetensorMin,
    safetensorMax,
    sortField,
    sortOrder,
    searchEngine,
    filterEngine,
    sortEngine,
  ]);

  // Toggle tag helper
  const toggleTag = <T,>(item: T, current: T[], setFn: React.Dispatch<React.SetStateAction<T[]>>) => {
    if (current.includes(item)) {
      setFn(current.filter((x) => x !== item));
    } else {
      setFn([...current, item]);
    }
  };

  // Reset all filters
  const resetAllFilters = () => {
    setSearchNameInput('');
    setDebouncedName('');
    setSearchFamily('');
    setMatchType('substring');
    setSelectedPipelines([]);
    setSelectedFamilies([]);
    setSelectedArchitectures([]);
    setSelectedWeights([]);
    setSafetensorMin(0);
    setSafetensorMax(35);
    setSortField('safetensorsCount');
    setSortOrder('desc');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Banner Notice for Connection */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              backgroundColor: 'rgba(230, 134, 25, 0.15)',
              border: '1px solid var(--spectrum-amber-400)',
              color: 'var(--spectrum-amber-400)',
              padding: '12px 18px',
              borderRadius: 'var(--spectrum-radius-md)',
              marginBottom: '20px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={16} />
              <span>
                <strong>Offline Mode Active:</strong> Serving model data directly from local <strong>IndexedDB Cache</strong>. All search, filter, and sort capabilities remain fully functional.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid Layout: Left Control Panel + Right Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
        {/* Sidebar Filters & Controls */}
        <aside
          style={{
            backgroundColor: 'var(--spectrum-surface-elevated)',
            border: '1px solid var(--spectrum-border-color)',
            borderRadius: 'var(--spectrum-radius-md)',
            padding: '20px',
            alignSelf: 'start',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SlidersHorizontal size={18} color="var(--spectrum-blue-400)" />
              Search & Filters
            </h2>
            <button
              className="spectrum-Button spectrum-Button--secondary"
              onClick={resetAllFilters}
              style={{ fontSize: '11px', padding: '4px 8px' }}
              title="Reset all search parameters and tags"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          {/* 1. Search Inputs */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--spectrum-text-secondary)', marginBottom: '6px' }}>
              Search Model Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="spectrum-Textfield"
                placeholder="e.g. Llama, Mistral, FLUX..."
                value={searchNameInput}
                onChange={handleNameInputChange}
                style={{ paddingLeft: '34px' }}
              />
              <Search size={15} color="var(--spectrum-text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            </div>
          </div>

          {/* Match Substring Type */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--spectrum-text-secondary)', marginBottom: '6px' }}>
              Search Match Strategy (Task 2.2.1)
            </label>
            <select
              className="spectrum-Textfield"
              value={matchType}
              onChange={(e) => setMatchType(e.target.value as 'substring' | 'prefix')}
            >
              <option value="substring">Middle Substring Match</option>
              <option value="prefix">Start Prefix Match</option>
            </select>
          </div>

          {/* 2. Pipeline Tags */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--spectrum-text-secondary)', marginBottom: '8px' }}>
              Pipeline Tags
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {ALL_PIPELINES.map((p) => {
                const isActive = selectedPipelines.includes(p);
                return (
                  <span
                    key={p}
                    className={`spectrum-Tag ${isActive ? 'spectrum-Tag--active' : ''}`}
                    onClick={() => toggleTag(p, selectedPipelines, setSelectedPipelines)}
                  >
                    {p}
                  </span>
                );
              })}
            </div>
          </div>

          {/* 3. Family Tags */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--spectrum-text-secondary)', marginBottom: '8px' }}>
              Family Tags
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {ALL_FAMILIES.map((fam) => {
                const isActive = selectedFamilies.includes(fam);
                return (
                  <span
                    key={fam}
                    className={`spectrum-Tag ${isActive ? 'spectrum-Tag--active' : ''}`}
                    onClick={() => toggleTag(fam, selectedFamilies, setSelectedFamilies)}
                  >
                    {fam}
                  </span>
                );
              })}
            </div>
          </div>

          {/* 4. Architecture Tags */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--spectrum-text-secondary)', marginBottom: '8px' }}>
              Architecture Tags
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {ALL_ARCHITECTURES.map((arch) => {
                const isActive = selectedArchitectures.includes(arch);
                return (
                  <span
                    key={arch}
                    className={`spectrum-Tag ${isActive ? 'spectrum-Tag--active' : ''}`}
                    onClick={() => toggleTag(arch, selectedArchitectures, setSelectedArchitectures)}
                  >
                    {arch}
                  </span>
                );
              })}
            </div>
          </div>

          {/* 5. Weight Tags */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--spectrum-text-secondary)', marginBottom: '8px' }}>
              Weight Formats
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {ALL_WEIGHTS.map((w) => {
                const isActive = selectedWeights.includes(w);
                return (
                  <span
                    key={w}
                    className={`spectrum-Tag ${isActive ? 'spectrum-Tag--active' : ''}`}
                    onClick={() => toggleTag(w, selectedWeights, setSelectedWeights)}
                  >
                    {w}
                  </span>
                );
              })}
            </div>
          </div>

          {/* 6. Safetensor Range Slider (Min to Max) */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--spectrum-text-secondary)', marginBottom: '8px' }}>
              Safetensors Count (Range: {safetensorMin} to {safetensorMax})
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="range"
                min="0"
                max="35"
                value={safetensorMin}
                onChange={(e) => setSafetensorMin(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--spectrum-blue-500)' }}
              />
              <input
                type="range"
                min="0"
                max="35"
                value={safetensorMax}
                onChange={(e) => setSafetensorMax(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--spectrum-blue-500)' }}
              />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main>
          {/* Top Sorting & Stats Toolbar */}
          <div
            style={{
              backgroundColor: 'var(--spectrum-surface-elevated)',
              border: '1px solid var(--spectrum-border-color)',
              borderRadius: 'var(--spectrum-radius-md)',
              padding: '14px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '14px', color: 'var(--spectrum-text-secondary)' }}>
              Showing <strong style={{ color: 'var(--spectrum-text-primary)' }}>{filteredAndSortedModels.length}</strong> of {allModels.length} models
            </div>

            {/* Sorting Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--spectrum-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowUpDown size={14} /> Sort By:
              </span>
              <select
                className="spectrum-Textfield"
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                style={{ width: '180px', padding: '6px 10px' }}
              >
                <option value="safetensorsCount">Safetensors File Count</option>
                <option value="name">Model Name (Alphabetical)</option>
              </select>

              <button
                className="spectrum-Button spectrum-Button--secondary"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                style={{ padding: '6px 12px', fontSize: '13px' }}
              >
                {sortOrder === 'asc' ? 'Ascending ↑' : 'Descending ↓'}
              </button>
            </div>
          </div>

          {/* Model Selection Detail Modal Banner */}
          <AnimatePresence>
            {selectedModel && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  backgroundColor: 'rgba(38, 128, 235, 0.12)',
                  border: '1px solid var(--spectrum-blue-500)',
                  borderRadius: 'var(--spectrum-radius-md)',
                  padding: '16px 20px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle2 color="var(--spectrum-blue-400)" size={24} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--spectrum-text-primary)' }}>
                      Selected Model: {selectedModel.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--spectrum-text-secondary)' }}>
                      ID: {selectedModel.id} &bull; Checksum: {selectedModel.checksumSHA256.substring(0, 16)}...
                    </div>
                  </div>
                </div>
                <button
                  className="spectrum-Button spectrum-Button--secondary"
                  onClick={() => setSelectedModel(null)}
                  style={{ fontSize: '12px' }}
                >
                  Deselect
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Models Cards Grid */}
          {filteredAndSortedModels.length === 0 ? (
            <div
              style={{
                backgroundColor: 'var(--spectrum-surface-elevated)',
                border: '1px border var(--spectrum-border-color)',
                borderRadius: 'var(--spectrum-radius-md)',
                padding: '60px',
                textAlign: 'center',
                color: 'var(--spectrum-text-secondary)',
              }}
            >
              <AlertCircle size={40} color="var(--spectrum-text-muted)" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--spectrum-text-primary)' }}>
                No Models Match Criteria
              </h3>
              <p style={{ fontSize: '13px', marginTop: '6px' }}>
                Try adjusting your search query, clearing tag filters, or resetting the safetensors count slider.
              </p>
              <button
                className="spectrum-Button spectrum-Button--primary"
                onClick={resetAllFilters}
                style={{ marginTop: '16px' }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px',
              }}
            >
              {filteredAndSortedModels.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  onSelect={(m) => setSelectedModel(m)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
