import { ModelEntity } from '../models/ModelEntity';
import { SearchQueryParams } from '../../types/model';

/**
 * OOP SearchEngine class responsible for query parameters parsing and substring searching.
 * Supports prefix matching (start of string) and middle substring matching.
 */
export class SearchEngine {
  /**
   * Evaluates if a target string matches query according to match mode.
   */
  public static matchesQuery(
    targetText: string,
    query: string,
    matchType: 'prefix' | 'substring' = 'substring'
  ): boolean {
    if (!query || query.trim() === '') return true;

    const normalizedTarget = targetText.toLowerCase().trim();
    const normalizedQuery = query.toLowerCase().trim();

    if (matchType === 'prefix') {
      return normalizedTarget.startsWith(normalizedQuery);
    }
    // Middle / General Substring search
    return normalizedTarget.includes(normalizedQuery);
  }

  /**
   * Filters array of ModelEntity objects against SearchQueryParams.
   */
  public search(models: ModelEntity[], params: SearchQueryParams): ModelEntity[] {
    const { modelName, modelFamily, matchType = 'substring' } = params;

    return models.filter((model) => {
      // 1. Model Name search check
      const nameMatch = modelName
        ? SearchEngine.matchesQuery(model.name, modelName, matchType)
        : true;

      // 2. Model Family search check
      const familyMatch = modelFamily
        ? SearchEngine.matchesQuery(model.family, modelFamily, matchType)
        : true;

      return nameMatch && familyMatch;
    });
  }
}
