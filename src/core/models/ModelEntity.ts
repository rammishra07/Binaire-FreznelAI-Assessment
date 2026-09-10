import { ArchitectureTag, FamilyTag, ModelMetadata, PipelineTag, WeightTag } from '../../types/model';

/**
 * OOP Domain Model Entity representing an AI model item in the system.
 * Encapsulates properties, validation logic, and formatting methods.
 */
export class ModelEntity {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _family: FamilyTag;
  private readonly _pipelineTag: PipelineTag;
  private readonly _architecture: ArchitectureTag;
  private readonly _weightTags: WeightTag[];
  private readonly _safetensorsCount: number;
  private readonly _downloads: number;
  private readonly _likes: number;
  private readonly _sizeBytes: number;
  private readonly _checksumSHA256: string;
  private readonly _author: string;
  private readonly _lastModified: string;
  private readonly _description: string;

  constructor(metadata: ModelMetadata) {
    this._id = metadata.id;
    this._name = metadata.name;
    this._family = metadata.family;
    this._pipelineTag = metadata.pipelineTag;
    this._architecture = metadata.architecture;
    this._weightTags = metadata.weightTags;
    this._safetensorsCount = metadata.safetensorsCount;
    this._downloads = metadata.downloads;
    this._likes = metadata.likes;
    this._sizeBytes = metadata.sizeBytes;
    this._checksumSHA256 = metadata.checksumSHA256;
    this._author = metadata.author;
    this._lastModified = metadata.lastModified;
    this._description = metadata.description;
  }

  // Getters
  public get id(): string { return this._id; }
  public get name(): string { return this._name; }
  public get family(): FamilyTag { return this._family; }
  public get pipelineTag(): PipelineTag { return this._pipelineTag; }
  public get architecture(): ArchitectureTag { return this._architecture; }
  public get weightTags(): WeightTag[] { return [...this._weightTags]; }
  public get safetensorsCount(): number { return this._safetensorsCount; }
  public get downloads(): number { return this._downloads; }
  public get likes(): number { return this._likes; }
  public get sizeBytes(): number { return this._sizeBytes; }
  public get checksumSHA256(): string { return this._checksumSHA256; }
  public get author(): string { return this._author; }
  public get lastModified(): string { return this._lastModified; }
  public get description(): string { return this._description; }

  /**
   * Helper method to format file size into human-readable string (GB, MB).
   */
  public getFormattedSize(): string {
    if (this._sizeBytes >= 1073741824) {
      return (this._sizeBytes / 1073741824).toFixed(2) + ' GB';
    }
    return (this._sizeBytes / 1048576).toFixed(1) + ' MB';
  }

  /**
   * Formats downloads number (e.g. 1.2M, 450k).
   */
  public getFormattedDownloads(): string {
    if (this._downloads >= 1000000) {
      return (this._downloads / 1000000).toFixed(1) + 'M';
    }
    if (this._downloads >= 1000) {
      return (this._downloads / 1000).toFixed(1) + 'k';
    }
    return this._downloads.toString();
  }

  /**
   * Serializes entity to plain object.
   */
  public toMetadata(): ModelMetadata {
    return {
      id: this._id,
      name: this._name,
      family: this._family,
      pipelineTag: this._pipelineTag,
      architecture: this._architecture,
      weightTags: [...this._weightTags],
      safetensorsCount: this._safetensorsCount,
      downloads: this._downloads,
      likes: this._likes,
      sizeBytes: this._sizeBytes,
      checksumSHA256: this._checksumSHA256,
      author: this._author,
      lastModified: this._lastModified,
      description: this._description,
    };
  }
}
