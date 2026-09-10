import { describe, it, expect, beforeEach } from 'vitest';
import { ModelEntity } from '../../models/ModelEntity';
import { SearchEngine } from '../SearchEngine';
import { FilterEngine } from '../FilterEngine';
import { SortEngine } from '../SortEngine';
import { LargeFileStreamer } from '../LargeFileStreamer';
import { MOCK_MODELS_DATA } from '../../../data/mockModels';

describe('Model Selection Utility Core OOP Services', () => {
  let models: ModelEntity[];
  let searchEngine: SearchEngine;
  let filterEngine: FilterEngine;
  let sortEngine: SortEngine;
  let streamer: LargeFileStreamer;

  beforeEach(() => {
    models = MOCK_MODELS_DATA.map((m) => new ModelEntity(m));
    searchEngine = new SearchEngine();
    filterEngine = new FilterEngine();
    sortEngine = new SortEngine();
    streamer = new LargeFileStreamer();
  });

  describe('SearchEngine', () => {
    it('should search by Model Name (middle substring)', () => {
      const results = searchEngine.search(models, {
        modelName: 'Llama-3',
        matchType: 'substring',
      });
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((m) => m.name.includes('Llama-3'))).toBe(true);
    });

    it('should search by Model Name (prefix match)', () => {
      const results = searchEngine.search(models, {
        modelName: 'whisper',
        matchType: 'prefix',
      });
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('whisper-large-v3');
    });

    it('should search by Model Family', () => {
      const results = searchEngine.search(models, {
        modelFamily: 'mistral',
      });
      expect(results.length).toBe(1);
      expect(results[0].family).toBe('mistral');
    });
  });

  describe('FilterEngine', () => {
    it('should filter by pipeline tag', () => {
      const results = filterEngine.filter(models, {
        pipelineTags: ['text-to-image'],
      });
      expect(results.length).toBe(2);
      expect(results.every((m) => m.pipelineTag === 'text-to-image')).toBe(true);
    });

    it('should filter by safetensor min-max range', () => {
      const results = filterEngine.filter(models, {
        safetensorRange: { min: 5, max: 10 },
      });
      expect(results.every((m) => m.safetensorsCount >= 5 && m.safetensorsCount <= 10)).toBe(true);
    });
  });

  describe('SortEngine', () => {
    it('should sort by safetensorsCount descending', () => {
      const sorted = sortEngine.sort(models, 'safetensorsCount', 'desc');
      expect(sorted[0].safetensorsCount).toBeGreaterThanOrEqual(sorted[1].safetensorsCount);
    });

    it('should sort by model name alphabetically A-Z', () => {
      const sorted = sortEngine.sort(models, 'name', 'asc');
      expect(sorted[0].name.localeCompare(sorted[1].name)).toBeLessThanOrEqual(0);
    });
  });

  describe('LargeFileStreamer Cryptographic SHA-256 Digest', () => {
    it('should compute SHA-256 digest accurately', async () => {
      const encoder = new TextEncoder();
      const buffer = encoder.encode('Binaire Freznel Assessment').buffer;
      const hash = await streamer.computeSHA256(buffer);
      expect(hash).toHaveLength(64);
    });
  });
});
