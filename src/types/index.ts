// =============================================================================
// CONTENT TYPES
// =============================================================================

export interface Project {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  github?: string;
  demo?: string;
  paper?: string;
  featured?: boolean;
  publishedAt: Date;
}

export interface Post {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  publishedAt: Date;
  updatedAt?: Date;
  readingTime: number;
  related?: string[];
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface SignatureMarkProps {
  compact?: boolean;
  soundOn?: boolean;
  onToggleSound?: () => void;
}

export interface NavItemProps {
  id: string;
  annotation: string;
  isActive: boolean;
  onClick: (id: string) => void;
}

export interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  slug: string;
  index?: number;
}

export interface PostCardProps {
  title: string;
  publishedAt: Date;
  readingTime: number;
  slug: string;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  currentPath?: string;
}

// =============================================================================
// SOUND SYSTEM
// =============================================================================

export type SoundName =
  | 'click'
  | 'hover'
  | 'tab'
  | 'error'
  | 'pageTransition'
  | 'navShift'
  | 'paletteOpen'
  | 'paletteClose'
  | 'paletteNav'
  | 'paletteSelect'
  | 'soundOn'
  | 'soundOff'
  | 'easterEgg'
  | 'markHover';

export interface SoundConfig {
  name: SoundName;
  src: string;
  volume?: number;
  loop?: boolean;
}

// =============================================================================
// NAVIGATION
// =============================================================================

export interface NavItem {
  id: string;
  path: string;
  annotation: string;
}

export type NavState = 'hero' | 'sticky' | 'deep';

// =============================================================================
// SITE CONFIG
// =============================================================================

export interface SiteConfig {
  name: string;
  tagline: string;
  status: string;
  connectionMessage: string;
  experience: ExperienceLine[];
  nav: NavItem[];
  social: SocialLink[];
}

export interface ExperienceLine {
  prefix: string;
  text: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon?: string;
}