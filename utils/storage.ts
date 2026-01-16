import { 
  Word, 
  LearningRecord, 
  LearningSettings, 
  LanguageType, 
  LanguageTypes, 
  STORAGE_KEYS 
} from '../types';

// 生成唯一ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 处理日期序列化和反序列化
const serializeDate = (obj: any): any => {
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = serializeDate(obj[key]);
      }
    }
  }
  return obj;
};

const deserializeDate = (obj: any): any => {
  if (typeof obj === 'string') {
    const date = new Date(obj);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = deserializeDate(obj[key]);
      }
    }
  }
  return obj;
};

// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined';

// 安全访问localStorage的辅助函数
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    return isBrowser ? localStorage.getItem(key) : null;
  },
  setItem: (key: string, value: string): void => {
    if (isBrowser) {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (isBrowser) {
      localStorage.removeItem(key);
    }
  }
};

// 单词存储管理
export const wordStorage = {
  // 获取所有单词
  getAllWords: (): Word[] => {
    const wordsJson = safeLocalStorage.getItem(STORAGE_KEYS.WORDS);
    if (!wordsJson) return [];
    
    try {
      const wordsData = JSON.parse(wordsJson);
      return wordsData.map((wordData: any) => deserializeDate(wordData)) as Word[];
    } catch (error) {
      console.error('Failed to parse words from localStorage:', error);
      return [];
    }
  },
  
  // 保存单词
  saveWord: (word: Word): void => {
    const words = wordStorage.getAllWords();
    const existingIndex = words.findIndex(w => w.id === word.id);
    
    if (existingIndex >= 0) {
      words[existingIndex] = word;
    } else {
      words.push(word);
    }
    
    safeLocalStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(words.map(serializeDate)));
  },
  
  // 保存多个单词
  saveWords: (words: Word[]): void => {
    safeLocalStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(words.map(serializeDate)));
  },
  
  // 根据ID获取单词
  getWordById: (id: string): Word | null => {
    const words = wordStorage.getAllWords();
    return words.find(word => word.id === id) || null;
  },
  
  // 根据语言获取单词
  getWordsByLanguage: (language: LanguageType): Word[] => {
    const words = wordStorage.getAllWords();
    return words.filter(word => word.language === language);
  },
  
  // 删除单词
  deleteWord: (id: string): void => {
    const words = wordStorage.getAllWords();
    const filteredWords = words.filter(word => word.id !== id);
    safeLocalStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(filteredWords.map(serializeDate)));
  },
  
  // 切换收藏状态
  toggleFavorite: (id: string, forceFavorite?: boolean): boolean => {
    const words = wordStorage.getAllWords();
    const word = words.find(w => w.id === id);
    if (word) {
      word.isFavorite = forceFavorite !== undefined ? forceFavorite : !word.isFavorite;
      safeLocalStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(words.map(serializeDate)));
      return word.isFavorite;
    }
    return false;
  },
  
  // 获取收藏的单词
  getFavoriteWords: (): Word[] => {
    const words = wordStorage.getAllWords();
    return words.filter(word => word.isFavorite);
  }
};

// 学习记录存储管理
export const recordStorage = {
  // 获取所有学习记录
  getAllRecords: (): LearningRecord[] => {
    const recordsJson = safeLocalStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!recordsJson) return [];
    
    try {
      const recordsData = JSON.parse(recordsJson);
      return recordsData.map((recordData: any) => deserializeDate(recordData)) as LearningRecord[];
    } catch (error) {
      console.error('Failed to parse records from localStorage:', error);
      return [];
    }
  },
  
  // 保存学习记录
  saveRecord: (record: LearningRecord): void => {
    const records = recordStorage.getAllRecords();
    records.push(record);
    safeLocalStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records.map(serializeDate)));
  },
  
  // 获取特定单词的学习记录
  getRecordsByWordId: (wordId: string): LearningRecord[] => {
    const records = recordStorage.getAllRecords();
    return records.filter(record => record.wordId === wordId);
  },
  
  // 获取今日学习记录
  getTodayRecords: (): LearningRecord[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const records = recordStorage.getAllRecords();
    return records.filter(record => record.timestamp >= today);
  }
};

// 设置存储管理
export const settingsStorage = {
  // 获取设置
  getSettings: (): LearningSettings => {
    const settingsJson = safeLocalStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!settingsJson) {
      return {
        language: LanguageTypes.ENGLISH,
        dailyGoal: 20,
        englishSpeed: 1.0,
        japaneseSpeed: 1.0,
        chineseSpeed: 1.0
      };
    }

    try {
      const settingsData = JSON.parse(settingsJson);
      return deserializeDate(settingsData) as LearningSettings;
    } catch (error) {
      console.error('Failed to parse settings from localStorage:', error);
      return {
        language: LanguageTypes.ENGLISH,
        dailyGoal: 20,
        englishSpeed: 1.0,
        japaneseSpeed: 1.0,
        chineseSpeed: 1.0
      };
    }
  },
  
  // 保存设置
  saveSettings: (settings: LearningSettings): void => {
    safeLocalStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(serializeDate(settings)));
  }
};

// 数据备份与恢复
export const backupStorage = {
  // 导出所有数据
  exportData: (): string => {
    const data = {
      words: wordStorage.getAllWords(),
      records: recordStorage.getAllRecords(),
      settings: settingsStorage.getSettings(),
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  },
  
  // 导入数据
  importData: (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      
      // 验证数据格式
      if (!data.words || !data.records || !data.settings) {
        throw new Error('Invalid data format');
      }
      
      // 保存数据
      safeLocalStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(data.words.map(serializeDate)));
      safeLocalStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(data.records.map(serializeDate)));
      safeLocalStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(serializeDate(data.settings)));
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
};

// 初始化示例数据
export const initSampleData = (): void => {
  const words = wordStorage.getAllWords();
  if (words.length > 0) return;
  
  // 添加示例英语单词
  const englishWords: Word[] = [
    {
      id: generateId(),
      language: LanguageTypes.ENGLISH,
      data: { word: 'hello', chinese: '你好' },
      createdAt: new Date(),
      reviewCount: 0,
      lastReviewed: null,
      nextReview: null,
      interval: 1,
      easeFactor: 2.5,
      isFavorite: false
    },
    {
      id: generateId(),
      language: LanguageTypes.ENGLISH,
      data: { word: 'world', chinese: '世界' },
      createdAt: new Date(),
      reviewCount: 0,
      lastReviewed: null,
      nextReview: null,
      interval: 1,
      easeFactor: 2.5,
      isFavorite: false
    },
    {
      id: generateId(),
      language: LanguageTypes.ENGLISH,
      data: { word: 'apple', chinese: '苹果' },
      createdAt: new Date(),
      reviewCount: 0,
      lastReviewed: null,
      nextReview: null,
      interval: 1,
      easeFactor: 2.5,
      isFavorite: false
    },
    {
      id: generateId(),
      language: LanguageTypes.ENGLISH,
      data: { word: 'banana', chinese: '香蕉' },
      createdAt: new Date(),
      reviewCount: 0,
      lastReviewed: null,
      nextReview: null,
      interval: 1,
      easeFactor: 2.5,
      isFavorite: false
    },
    {
      id: generateId(),
      language: LanguageTypes.ENGLISH,
      data: { word: 'cat', chinese: '猫' },
      createdAt: new Date(),
      reviewCount: 0,
      lastReviewed: null,
      nextReview: null,
      interval: 1,
      easeFactor: 2.5,
      isFavorite: false
    }
  ];
  
  // 添加示例日语单词
  const japaneseWords: Word[] = [
    {
      id: generateId(),
      language: LanguageTypes.JAPANESE,
      data: { kana: 'おはよう', kanji: 'おはよう', chinese: '早上好' },
      createdAt: new Date(),
      reviewCount: 0,
      lastReviewed: null,
      nextReview: null,
      interval: 1,
      easeFactor: 2.5,
      isFavorite: false
    },
    {
      id: generateId(),
      language: LanguageTypes.JAPANESE,
      data: { kana: 'こんにちは', kanji: 'こんにちは', chinese: '下午好' },
      createdAt: new Date(),
      reviewCount: 0,
      lastReviewed: null,
      nextReview: null,
      interval: 1,
      easeFactor: 2.5,
      isFavorite: false
    },
    {
      id: generateId(),
      language: LanguageTypes.JAPANESE,
      data: { kana: 'こんばんは', kanji: 'こんばんは', chinese: '晚上好' },
      createdAt: new Date(),
      reviewCount: 0,
      lastReviewed: null,
      nextReview: null,
      interval: 1,
      easeFactor: 2.5,
      isFavorite: false
    },
    {
      id: generateId(),
      language: LanguageTypes.JAPANESE,
      data: { kana: 'おやすみ', kanji: 'おやすみ', chinese: '晚安' },
      createdAt: new Date(),
      reviewCount: 0,
      lastReviewed: null,
      nextReview: null,
      interval: 1,
      easeFactor: 2.5,
      isFavorite: false
    },
    {
      id: generateId(),
      language: LanguageTypes.JAPANESE,
      data: { kana: 'ありがとう', kanji: 'ありがとう', chinese: '谢谢' },
      createdAt: new Date(),
      reviewCount: 0,
      lastReviewed: null,
      nextReview: null,
      interval: 1,
      easeFactor: 2.5,
      isFavorite: false
    }
  ];
  
  // 保存示例单词
  wordStorage.saveWords([...englishWords, ...japaneseWords]);
};