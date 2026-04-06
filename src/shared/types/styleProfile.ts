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
  formality: z.string(),
  tone: z.string(),
  emotion: z.string(),
  sentence_length: z.string(),
  pacing: z.string(),
  habitual_phrases: z.array(z.string()),
  emoji_usage: z.string(),
  style_notes: z.string(),
});

export const structurePatternSchema = z.object({
  overall_flow: z.string(),
  opening_style: z.string(),
  frequent_sections: z.array(z.string()),
});

export const keywordProfileSchema = z.object({
  frequent_words: z.array(z.string()),
  topic_bias: z.string(),
});

export const visualStructureSchema = z.object({
  line_breaks: z.string(),
  paragraph_pattern: z.string(),
});

export const styleProfileSchema = z.object({
  writing_style: writingStyleSchema,
  visual_structure: visualStructureSchema,
  structure_pattern: structurePatternSchema,
  keyword_profile: keywordProfileSchema,
});
