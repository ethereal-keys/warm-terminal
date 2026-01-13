import type { SiteConfig } from '@/types';

export const SITE: SiteConfig = {
  name: 'sushanth kashyap',
  tagline: 'cloud · systems · creative engineering',
  status: 'currently seeking opportunities',
  connectionMessage: 'connection established — welcome, visitor',

  experience: [
    { prefix: '>', text: 'prev: aruba networks / hpe (2 years)' },
    { prefix: '>', text: 'edu: ms cs @ arizona state' },
  ],

  nav: [
    { id: 'projects', path: '/projects', annotation: "things i've made" },
    { id: 'writing', path: '/writing', annotation: 'thoughts & late nights' },
    { id: 'about', path: '/about', annotation: 'the human' },
    { id: 'contact', path: '/contact', annotation: 'say hello' },
  ],

  social: [
    { name: 'github', url: 'https://github.com/ethereal-keys' },
    { name: 'linkedin', url: 'https://linkedin.com/in/sushanth-kashyap/' },
    { name: 'email', url: 'mailto:srkashy1@asu.edu' },
  ],
};

export const TIMING = {
  breathCycle: 0.0016,
  cursorPulse: 0.008,
  typingSpeed: 38,
  connectionDelay: 800,
  typingDelay: 2400,
  lineDrawDelay: 400,
  markNoticeDelay: 500,
} as const;

export const ANIMATION = {
  easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;