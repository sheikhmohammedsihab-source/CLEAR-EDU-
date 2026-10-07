import React from 'react';
import {
  Atom,
  FlaskConical,
  Calculator,
  Dna,
  Binary,
  Laptop,
  BookOpen,
  Feather,
  Code,
  Globe,
  Compass,
  GraduationCap,
  Sparkles,
  Layers,
  LucideIcon,
} from 'lucide-react';

interface SubjectIconProps {
  iconName?: string;
  className?: string;
  size?: number;
}

const ICON_MAP: Record<string, LucideIcon> = {
  atom: Atom,
  flask: FlaskConical,
  'flask-conical': FlaskConical,
  calculator: Calculator,
  dna: Dna,
  binary: Binary,
  laptop: Laptop,
  'book-open': BookOpen,
  book: BookOpen,
  feather: Feather,
  code: Code,
  globe: Globe,
  compass: Compass,
  graduation: GraduationCap,
  sparkles: Sparkles,
};

export const SubjectIcon: React.FC<SubjectIconProps> = ({
  iconName = 'book-open',
  className = 'w-6 h-6',
  size,
}) => {
  const normalized = (iconName || 'book-open').toLowerCase().trim();
  const IconComponent = ICON_MAP[normalized] || Layers;

  return <IconComponent className={className} size={size} />;
};
