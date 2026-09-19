import { CustomField } from '@/types';

/**
 * Normalizes custom fields from JSONB, Array, or Record object into a clean array of CustomField items.
 * Preserves empty objects while editing in forms.
 */
export function parseCustomFields(rawFields: any): CustomField[] {
  if (!rawFields) return [];

  // If already array of { label, value }
  if (Array.isArray(rawFields)) {
    return rawFields
      .filter((item: any) => item && typeof item === 'object')
      .map((item: any) => ({
        label: item.label !== undefined && item.label !== null ? String(item.label) : '',
        value: item.value !== undefined && item.value !== null ? String(item.value) : ''
      }));
  }

  // If stored as Record object e.g. { "Work Type": "Zari Embroidery", "Stitching": "Semi-Stitched" }
  if (typeof rawFields === 'object') {
    return Object.entries(rawFields)
      .map(([label, value]) => ({
        label: String(label),
        value: String(value)
      }));
  }

  // If stored as JSON string
  if (typeof rawFields === 'string' && (rawFields.trim().startsWith('[') || rawFields.trim().startsWith('{'))) {
    try {
      const parsed = JSON.parse(rawFields);
      return parseCustomFields(parsed);
    } catch (e) {
      return [];
    }
  }

  return [];
}

/**
 * Filters only valid custom fields where both label and value are non-empty.
 */
export function filterValidCustomFields(fields: any): CustomField[] {
  const parsed = parseCustomFields(fields);
  return parsed.filter(item => item.label.trim().length > 0 && item.value.trim().length > 0);
}

/**
 * Converts custom fields into a nicely formatted text block for description fallback.
 */
export function formatCustomFieldsText(fields: CustomField[]): string {
  const valid = filterValidCustomFields(fields);
  if (valid.length === 0) return '';
  
  return valid.map(f => `${f.label.trim()}: ${f.value.trim()}`).join(' | ');
}
