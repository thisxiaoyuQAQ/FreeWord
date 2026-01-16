// 语言类型
export const LanguageTypes = {
  ENGLISH: 'english',
  JAPANESE: 'japanese'
} as const;

export type LanguageType = typeof LanguageTypes[keyof typeof LanguageTypes];

// 英语单词数据类型
export interface EnglishWordData {
  word: string;
  chinese: string;
}

// 日语单词数据类型
export interface JapaneseWordData {
  kana: string;
  kanji: string;
  chinese: string;
}

// 单词数据联合类型
export type WordData = EnglishWordData | JapaneseWordData;

// 单词类型
export interface Word {
  id: string;
  language: LanguageType;
  data: WordData;
  createdAt: Date;
  reviewCount: number;
  lastReviewed: Date | null;
  nextReview: Date | null;
  interval: number;
  easeFactor: number;
  isFavorite: boolean;
}

// 学习记录类型
export interface LearningRecord {
  wordId: string;
  timestamp: Date;
  isCorrect: boolean;
  attempt: number;
}

// 学习设置类型
export interface LearningSettings {
  language: LanguageType;
  dailyGoal: number;
  englishSpeed: number;
  japaneseSpeed: number;
  chineseSpeed: number;
}

// 存储键名
export const STORAGE_KEYS = {
  WORDS: 'freeword_words',
  RECORDS: 'freeword_records',
  SETTINGS: 'freeword_settings',
  FAVORITES: 'freeword_favorites'
} as const;