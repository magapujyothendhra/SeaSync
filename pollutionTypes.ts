import { PollutionType, SeverityLevel } from './types';

export const POLLUTION_TYPES: {
  value: PollutionType;
  label: string;
  color: string;
  emoji: string;
  keywords: string[];
}[] = [
  {
    value: 'plastic',
    label: 'Plastic Waste',
    color: '#FF6B35',
    emoji: '🥤',
    keywords: ['plastic', 'bottle', 'bag', 'wrapper', 'container', 'straw', 'cup', 'packaging']
  },
  {
    value: 'oil-spill',
    label: 'Oil Spill',
    color: '#2D3142',
    emoji: '🛢️',
    keywords: ['oil', 'petroleum', 'fuel', 'spill', 'sheen', 'slick', 'tar']
  },
  {
    value: 'debris',
    label: 'Marine Debris',
    color: '#8B4513',
    emoji: '🗑️',
    keywords: ['debris', 'trash', 'garbage', 'fishing', 'net', 'rope', 'tire', 'wood']
  },
  {
    value: 'chemical',
    label: 'Chemical Pollution',
    color: '#9D4EDD',
    emoji: '⚠️',
    keywords: ['chemical', 'toxic', 'hazardous', 'contamination', 'industrial', 'waste']
  },
  {
    value: 'sewage',
    label: 'Sewage',
    color: '#6B4423',
    emoji: '💧',
    keywords: ['sewage', 'wastewater', 'effluent', 'discharge', 'overflow']
  },
  {
    value: 'other',
    label: 'Other',
    color: '#718355',
    emoji: '📍',
    keywords: ['other', 'unknown', 'miscellaneous']
  }
];

export const SEVERITY_LEVELS: {
  value: SeverityLevel;
  label: string;
  color: string;
  description: string;
}[] = [
  {
    value: 'low',
    label: 'Low',
    color: '#34C759',
    description: 'Minor pollution, localized impact'
  },
  {
    value: 'medium',
    label: 'Medium',
    color: '#FF9500',
    description: 'Moderate pollution, attention needed'
  },
  {
    value: 'high',
    label: 'High',
    color: '#FF3B30',
    description: 'Significant pollution, requires immediate action'
  },
  {
    value: 'critical',
    label: 'Critical',
    color: '#8E00D3',
    description: 'Severe pollution, emergency response required'
  }
];
