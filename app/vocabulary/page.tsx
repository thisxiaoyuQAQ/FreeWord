'use client';

import { useState, useEffect } from 'react';
import { Word, LanguageTypes, LanguageType } from '../../types';
import { wordStorage } from '../../utils/storage';
import { ttsService } from '../../utils/tts';
import Header from '../components/Header';

const VocabularyPage = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [filterLanguage, setFilterLanguage] = useState<LanguageType | 'all'>('all');
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);

  // 加载单词数据
  useEffect(() => {
    const loadWords = () => {
      const allWords = wordStorage.getAllWords();
      setWords(allWords);
    };

    loadWords();
    ttsService.initTTS();
  }, []);

  // 过滤单词
  useEffect(() => {
    let result = [...words];

    // 按语言过滤
    if (filterLanguage !== 'all') {
      result = result.filter(word => word.language === filterLanguage);
    }

    // 按收藏状态过滤
    if (filterFavorite) {
      result = result.filter(word => word.isFavorite);
    }

    // 按搜索词过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(word => {
        if (word.language === LanguageTypes.ENGLISH) {
          const englishWord = word.data as any;
          return (
            englishWord.word.toLowerCase().includes(term) ||
            englishWord.chinese.toLowerCase().includes(term)
          );
        } else if (word.language === LanguageTypes.JAPANESE) {
          const japaneseWord = word.data as any;
          return (
            japaneseWord.kana.toLowerCase().includes(term) ||
            japaneseWord.kanji.toLowerCase().includes(term) ||
            japaneseWord.chinese.toLowerCase().includes(term)
          );
        }
        return false;
      });
    }

    setFilteredWords(result);
  }, [words, filterLanguage, filterFavorite, searchTerm]);

  // 播放单词发音
  const playWordSound = (word: Word) => {
    let text = '';
    let speed = 1.0;

    if (word.language === LanguageTypes.ENGLISH) {
      text = (word.data as any).word;
      speed = 1.0;
    } else if (word.language === LanguageTypes.JAPANESE) {
      text = (word.data as any).kana;
      speed = 1.0;
    }

    ttsService.speakWord(text, word.language, speed);
  };

  // 切换收藏状态
  const toggleFavorite = (wordId: string) => {
    wordStorage.toggleFavorite(wordId);
    const updatedWords = wordStorage.getAllWords();
    setWords(updatedWords);
  };

  // 删除单词
  const deleteWord = (wordId: string) => {
    if (confirm('确定要删除这个单词吗？')) {
      wordStorage.deleteWord(wordId);
      const updatedWords = wordStorage.getAllWords();
      setWords(updatedWords);
    }
  };

  return (
    <div className="main-container">
      <Header />
      <div className="content-card">
        <div className="card-header">
          <h1>我的词汇</h1>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="favorite-toggle"
              checked={filterFavorite}
              onChange={() => setFilterFavorite(!filterFavorite)}
            />
            <label htmlFor="favorite-toggle" className="toggle-label">
              <span className="toggle-text">只看收藏</span>
            </label>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="search-wrapper" style={{ width: '100%' }}>
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            placeholder="搜索单词..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 语言切换 */}
        <div className="segmented-control three-seg mt-4">
          <input 
            type="radio" 
            name="vocab-type" 
            id="tab-all" 
            checked={filterLanguage === 'all'} 
            onChange={() => setFilterLanguage('all')}
          />
          <label htmlFor="tab-all">全部 ({words.length})</label>
          
          <input 
            type="radio" 
            name="vocab-type" 
            id="tab-en" 
            checked={filterLanguage === LanguageTypes.ENGLISH} 
            onChange={() => setFilterLanguage(LanguageTypes.ENGLISH)}
          />
          <label htmlFor="tab-en">GB 英语 ({words.filter(w => w.language === LanguageTypes.ENGLISH).length})</label>
          
          <input 
            type="radio" 
            name="vocab-type" 
            id="tab-jp" 
            checked={filterLanguage === LanguageTypes.JAPANESE} 
            onChange={() => setFilterLanguage(LanguageTypes.JAPANESE)}
          />
          <label htmlFor="tab-jp">JP 日语 ({words.filter(w => w.language === LanguageTypes.JAPANESE).length})</label>
          
          <div className="marker"></div>
        </div>

        {/* 单词列表 */}
        {filteredWords.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            没有找到匹配的单词
          </div>
        ) : (
          <table className="apple-table">
            <thead>
              <tr>
                <th>单词</th>
                <th>翻译</th>
                <th>语言</th>
                <th>学习次数</th>
                <th className="text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredWords.map((word) => (
                <tr key={word.id}>
                  <td className="primary-text">
                    {word.language === LanguageTypes.ENGLISH ? (
                      (word.data as any).word
                    ) : (
                      <>
                        <div className="kanji-text">{(word.data as any).kanji || (word.data as any).kana}</div>
                        <div className="secondary-text">{(word.data as any).kana}</div>
                      </>
                    )}
                  </td>
                  <td className="secondary-text">
                    {(word.data as any).chinese}
                  </td>
                  <td>
                    <span className={`badge ${word.language === LanguageTypes.ENGLISH ? 'blue' : 'purple'}`}>
                      {word.language === LanguageTypes.ENGLISH ? 'EN' : 'JP'}
                    </span>
                  </td>
                  <td>{word.reviewCount}</td>
                  <td className="actions">
                    {/* 播放发音按钮 */}
                    <button
                      onClick={() => playWordSound(word)}
                      className="icon-btn"
                      title="播放发音"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                    </button>

                    {/* 收藏按钮 */}
                    <button
                      onClick={() => toggleFavorite(word.id)}
                      className={`icon-btn save ${word.isFavorite ? 'active' : ''}`}
                      title={word.isFavorite ? '取消收藏' : '收藏'}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" 
                        className={word.isFavorite ? 'fill-current' : ''} 
                        fill={word.isFavorite ? '#ff2d55' : 'none'} 
                        stroke={word.isFavorite ? 'none' : 'currentColor'} 
                        strokeWidth="2"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>

                    {/* 删除按钮 */}
                    <button
                      onClick={() => deleteWord(word.id)}
                      className="icon-btn delete"
                      title="删除"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default VocabularyPage;