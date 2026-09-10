import { ModelEntity } from '../models/ModelEntity';
import { SortField, SortOrder } from '../../types/model';

/**
 * OOP SortEngine class implementing comparison algorithms for models.
 */
export class SortEngine {
  /**
   * Sorts array of ModelEntity instances in place or returned as a sorted copy.
   */
  public sort(
    models: ModelEntity[],
    field: SortField,
    order: SortOrder = 'asc'
  ): ModelEntity[] {
    const copy = [...models];

    copy.sort((a, b) => {
      let comparison = 0;

      if (field === 'safetensorsCount') {
        comparison = a.safetensorsCount - b.safetensorsCount;
      } else if (field === 'name') {
        comparison = a.name.localeCompare(b.name, undefined, {
          sensitivity: 'base',
        });
      }

      return order === 'asc' ? comparison : -comparison;
    });

    return copy;
  }
}
