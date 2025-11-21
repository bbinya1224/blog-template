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
  paragraph_pattern: string;
  frequent_sections: string[];
};

export type KeywordProfile = {
  frequent_words: string[];
  topic_bias: string;
};

export type StyleProfile = {
  writing_style: WritingStyle;
  structure_pattern: StructurePattern;
  keyword_profile: KeywordProfile;
};
