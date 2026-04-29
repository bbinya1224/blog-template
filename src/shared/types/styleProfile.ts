import { z } from 'zod';

export const writingStyleSchema = z.object({
  formality: z.string().optional(),
  tone: z.string().min(1),
  emotion: z.string().optional(),
  sentence_length: z.string().optional(),
  pacing: z.string().optional(),
  habitual_phrases: z.array(z.string()).optional(),
  emoji_usage: z.string().optional(),
  style_notes: z.string().optional(),
});

export const structurePatternSchema = z.object({
  overall_flow: z.string().optional(),
  opening_style: z.string().optional(),
  frequent_sections: z.array(z.string()).optional(),
});

export const keywordProfileSchema = z.object({
  frequent_words: z.array(z.string()).optional(),
  topic_bias: z.string().optional(),
});

export const visualStructureSchema = z.object({
  line_breaks: z.string().optional(),
  paragraph_pattern: z.string().optional(),
});

export const styleProfileSchema = z.object({
  writing_style: writingStyleSchema,
  visual_structure: visualStructureSchema,
  structure_pattern: structurePatternSchema,
  keyword_profile: keywordProfileSchema,
});

export type WritingStyle = z.infer<typeof writingStyleSchema>;
export type StructurePattern = z.infer<typeof structurePatternSchema>;
export type KeywordProfile = z.infer<typeof keywordProfileSchema>;
export type VisualStructure = z.infer<typeof visualStructureSchema>;
export type StyleProfile = z.infer<typeof styleProfileSchema>;
