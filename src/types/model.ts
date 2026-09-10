export type PipelineTag =
  | 'text-generation'
  | 'text-to-image'
  | 'automatic-speech-recognition'
  | 'image-classification'
  | 'fill-mask'
  | 'translation'
  | 'zero-shot-classification';

export type FamilyTag =
  | 'llama'
  | 'mistral'
  | 'stable-diffusion'
  | 'bert'
  | 'gpt'
  | 'whisper'
  | 'resnet'
  | 'flux';

export type ArchitectureTag =
  | 'transformer'
  | 'diffusion'
  | 'conformer'
  | 'cnn'
  | 'encoder-decoder';

export type WeightTag = 'float16' | 'bfloat16' | 'float32' | 'int8' | 'int4';

export interface ModelMetadata {
  id: string;
  name: string;
  family: FamilyTag;
  pipelineTag: PipelineTag;
  architecture: ArchitectureTag;
  weightTags: WeightTag[];
  safetensorsCount: number;
  downloads: number;
  likes: number;
  sizeBytes: number;
  checksumSHA256: string;
  author: string;
  lastModified: string;
  description: string;
}

export type SortField = 'safetensorsCount' | 'name';
export type SortOrder = 'asc' | 'desc';

export interface SearchQueryParams {
  modelName?: string;
  modelFamily?: string;
  matchType?: 'prefix' | 'substring';
}

export interface FilterParams {
  pipelineTags?: PipelineTag[];
  familyTags?: FamilyTag[];
  architectureTags?: ArchitectureTag[];
  weightTags?: WeightTag[];
  safetensorRange?: {
    min: number;
    max: number;
  };
}

export interface UserAuth {
  uid: string;
  email: string | null;
  displayName?: string | null;
  isAnonymous: boolean;
}
