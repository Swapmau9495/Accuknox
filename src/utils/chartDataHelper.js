// Palette presets for charts
export const DONUT_COLORS = [
  '#3b82f6',
  '#bfdbfe',
  '#16a34a',
  '#eab308',
  '#dc2626',
  '#94a3b8',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
];

export const STACKED_COLORS = [
  '#b91c1c',
  '#ea580c',
  '#eab308',
  '#94a3b8',
  '#3b82f6',
  '#16a34a',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
];

/**
 * Strips any trailing numeric count like "(28)" or ": 28" from a label string.
 * e.g. "Approved (28)" -> "Approved"
 *      "Failed (1689)" -> "Failed"
 *      "Connected: 2"  -> "Connected"
 */
export function getCleanLabel(label) {
  if (!label || typeof label !== 'string') return '';
  return label
    .replace(/\s*\(\s*\d[\d,]*\s*\)\s*$/, '')
    .replace(/:\s*\d[\d,]*\s*$/, '')
    .trim();
}

/**
 * Extracts label: number pairs from text (e.g. "Connected: 2, Disconnected: 3" or "Active - 10, inactive 5")
 */
export function extractPairsFromText(text) {
  if (!text || typeof text !== 'string') return [];

  const pairs = [];
  // Matches "Label: 123", "Label - 123", "Label (123)", "Label=123", "Label 123"
  const regex = /([A-Za-z\s]+?)(?::|\(|\s*-\s*|=)\s*(\d+)\)?/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const rawLabel = match[1].trim().replace(/^[,;\s]+|[,;\s]+$/g, '');
    const value = parseInt(match[2], 10);
    if (rawLabel && !isNaN(value) && value >= 0) {
      pairs.push({ label: rawLabel, value });
    }
  }

  return pairs;
}

/**
 * Create chart data directly from structured key-value pairs [{ key: 'Active', value: 10 }, { key: 'inactive', value: 5 }]
 */
export function createChartDataFromPairs(pairs, type = 'donut') {
  const validPairs = (pairs || [])
    .filter((p) => p && p.key && p.key.trim() && !isNaN(Number(p.value)) && Number(p.value) >= 0)
    .map((p) => ({
      key: p.key.trim(),
      value: Number(p.value),
    }));

  if (validPairs.length === 0) return null;

  const total = validPairs.reduce((sum, p) => sum + p.value, 0);

  if (type === 'donut') {
    const segments = validPairs.map((p, idx) => ({
      label: `${p.key} (${p.value})`,
      value: p.value,
      color: DONUT_COLORS[idx % DONUT_COLORS.length],
    }));

    return {
      total,
      centerLabel: 'Total',
      segments,
      description: validPairs.map((p) => `${p.key}: ${p.value}`).join(', '),
    };
  }

  if (type === 'stacked_bar') {
    const segments = validPairs.map((p, idx) => ({
      label: `${p.key} (${p.value})`,
      value: p.value,
      color: STACKED_COLORS[idx % STACKED_COLORS.length],
    }));

    return {
      totalMetric: String(total),
      totalLabel: 'Total Findings',
      segments,
      description: validPairs.map((p) => `${p.key}: ${p.value}`).join(', '),
    };
  }

  return {
    description: validPairs.map((p) => `${p.key}: ${p.value}`).join(', '),
  };
}

/**
 * Generate Donut Chart data for CSPM or donut widgets
 */
export function generateDonutData(name, text, existingData = {}) {
  // If already has valid segments, return existing
  if (existingData?.segments && existingData.segments.length > 0) {
    return existingData;
  }

  const parsedPairs = extractPairsFromText(text);

  if (parsedPairs.length >= 1) {
    const total = parsedPairs.reduce((sum, p) => sum + p.value, 0);
    const segments = parsedPairs.map((p, idx) => ({
      label: `${p.label} (${p.value})`,
      value: p.value,
      color: DONUT_COLORS[idx % DONUT_COLORS.length],
    }));

    return {
      total,
      centerLabel: 'Total',
      segments,
      description: text,
    };
  }

  // If no structured pairs, generate realistic segments based on name & text
  const cleanName = (name || 'Security Posture').toLowerCase();
  let segments = [];
  let total = 0;

  if (cleanName.includes('health') || cleanName.includes('cluster')) {
    total = 14;
    segments = [
      { label: 'Healthy (11)', value: 11, color: '#16a34a' },
      { label: 'Warning (2)', value: 2, color: '#eab308' },
      { label: 'Critical (1)', value: 1, color: '#dc2626' },
    ];
  } else if (cleanName.includes('account') || cleanName.includes('cloud')) {
    total = 4;
    segments = [
      { label: 'Active (3)', value: 3, color: '#3b82f6' },
      { label: 'Inactive (1)', value: 1, color: '#bfdbfe' },
    ];
  } else if (cleanName.includes('compliance') || cleanName.includes('audit')) {
    total = 100;
    segments = [
      { label: 'Compliant (82)', value: 82, color: '#16a34a' },
      { label: 'Non-Compliant (18)', value: 18, color: '#dc2626' },
    ];
  } else {
    total = 10;
    segments = [
      { label: 'Passed (7)', value: 7, color: '#3b82f6' },
      { label: 'Attention (2)', value: 2, color: '#eab308' },
      { label: 'Failed (1)', value: 1, color: '#dc2626' },
    ];
  }

  return {
    total,
    centerLabel: 'Total',
    segments,
    description: text,
  };
}

/**
 * Generate Stacked Bar data for Registry Scan / Image widgets
 */
export function generateStackedBarData(name, text, existingData = {}) {
  if (existingData?.segments && existingData.segments.length > 0) {
    return existingData;
  }

  const parsedPairs = extractPairsFromText(text);

  if (parsedPairs.length >= 1) {
    const total = parsedPairs.reduce((sum, p) => sum + p.value, 0);
    const segments = parsedPairs.map((p, idx) => ({
      label: `${p.label} (${p.value})`,
      value: p.value,
      color: STACKED_COLORS[idx % STACKED_COLORS.length],
    }));

    return {
      totalMetric: `${total}`,
      totalLabel: 'Total Findings',
      segments,
      description: text,
    };
  }

  const cleanName = (name || 'Registry Scan').toLowerCase();
  let segments = [];
  let totalMetric = '850';
  let totalLabel = 'Total Vulnerabilities';

  if (cleanName.includes('image') || cleanName.includes('container')) {
    totalMetric = '12';
    totalLabel = 'Total Scanned Images';
    segments = [
      { label: 'Critical (3)', value: 3, color: '#b91c1c' },
      { label: 'High (4)', value: 4, color: '#ea580c' },
      { label: 'Medium (3)', value: 3, color: '#eab308' },
      { label: 'Clean (2)', value: 2, color: '#16a34a' },
    ];
  } else {
    totalMetric = '620';
    totalLabel = 'Security Findings';
    segments = [
      { label: 'Critical (12)', value: 12, color: '#b91c1c' },
      { label: 'High (84)', value: 84, color: '#ea580c' },
      { label: 'Medium (210)', value: 210, color: '#eab308' },
      { label: 'Low (314)', value: 314, color: '#94a3b8' },
    ];
  }

  return {
    totalMetric,
    totalLabel,
    segments,
    description: text,
  };
}

/**
 * Helper to determine default widget type for a category
 */
export function getDefaultTypeForCategory(categoryId) {
  switch (categoryId) {
    case 'cspm':
      return 'donut';
    case 'registry_scan':
    case 'image':
      return 'stacked_bar';
    case 'cwpp':
      return 'empty_chart';
    case 'ticket':
    default:
      return 'text';
  }
}
