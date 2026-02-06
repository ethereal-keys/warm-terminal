// Re-export content components for MDX usage
// Import in MDX files like:
// import { AsciiDiagram, DemoEmbed } from '@/components/content';

export { default as AsciiDiagram } from './AsciiDiagram.astro';
export { default as DemoEmbed } from './DemoEmbed.astro';
export { default as YouTubeEmbed } from './YouTubeEmbed.astro';
export { default as Comic } from './Comic.astro';
export { default as AnimatedImage } from './AnimatedImage.astro';