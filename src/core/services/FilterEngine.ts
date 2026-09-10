import { ModelEntity } from '../models/ModelEntity';
import { FilterParams } from '../../types/model';

/**
 * OOP FilterEngine class handling tag filtering & safetensor range constraints.
 */
export class FilterEngine {
  /**
   * Filters an array of ModelEntity instances based on multi-tag parameter specs.
   */
  public filter(models: ModelEntity[], params: FilterParams): ModelEntity[] {
    const {
      pipelineTags = [],
      familyTags = [],
      architectureTags = [],
      weightTags = [],
      safetensorRange,
    } = params;

    return models.filter((model) => {
      // 1. Pipeline tags filter (OR condition within tag group if tags selected)
      if (
        pipelineTags.length > 0 &&
        !pipelineTags.includes(model.pipelineTag)
      ) {
        return false;
      }

      // 2. Family tags filter
      if (familyTags.length > 0 && !familyTags.includes(model.family)) {
        return false;
      }

      // 3. Architecture tags filter
      if (
        architectureTags.length > 0 &&
        !architectureTags.includes(model.architecture)
      ) {
        return false;
      }

      // 4. Weight tags filter (model must contain at least one of selected weight tags)
      if (weightTags.length > 0) {
        const hasWeight = model.weightTags.some((wt) => weightTags.includes(wt));
        if (!hasWeight) return false;
      }

      // 5. Safetensor range filter (min to max values)
      if (safetensorRange) {
        const { min, max } = safetensorRange;
        if (model.safetensorsCount < min || model.safetensorsCount > max) {
          return false;
        }
      }

      return true;
    });
  }
}
