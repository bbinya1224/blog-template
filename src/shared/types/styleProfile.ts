import { z } from 'zod';

export type WritingStyle = {
  formality: string;
  tone: string;
  emotion: string;
  sentence_length: string;
  pacing: string;
  habitual_phrases: string[];
  emoji_usage: string;
  style_notes: string;
};

export type StructurePattern = {
  overall_flow: string;
  opening_style: string;
  frequent_sections: string[];
};

export type KeywordProfile = {
  frequent_words: string[];
  topic_bias: string;
};

export type VisualStructure = {
  line_breaks: string;
  paragraph_pattern: string;
};

export type StyleProfile = {
  writing_style: WritingStyle;
  visual_structure: VisualStructure;
  structure_pattern: StructurePattern;
  keyword_profile: KeywordProfile;
};

export const writingStyleSchema = z.object({
  formality: z.string().optional(),
  tone: z.string().optional(),
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
