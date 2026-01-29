import { z, defineCollection } from 'astro:content';

const projectsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    publishedAt: z.date(),
    updatedAt: z.date().optional(),
    featured: z.boolean().default(false),
    github: z.string().url().optional(),
    demo: z.string().url().optional(),
    paper: z.string().url().optional(),
    order: z.number().default(0),
    tabs: z.array(z.object({
      label: z.string(),
      id: z.string(),
    })).optional(),
  }),
});

const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    publishedAt: z.date(),
    updatedAt: z.date().optional(),
    related: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  projects: projectsCollection,
  posts: postsCollection,
};