'use client';

import { useState, useEffect } from 'react';
import { Word, LanguageType, LanguageTypes } from '../../types';
import { wordStorage, recordStorage, settingsStorage } from '../../utils/storage';
import { ttsService } from '../../utils/tts';
import Header from '../components/Header';

const LearningPage = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [hasAnyWords, setHasAnyWords] = useState(false);
  const [settings, setSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      return settingsStorage.getSettings();
    }
    return {
      language: LanguageTypes.ENGLISH,
      dailyGoal: 20,
      englishSpeed: 1.0,
      japaneseSpeed: 1.0,
      chineseSpeed: 1.0
    };
  });
  const [todayCount, setTodayCount] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    const loadData = () => {
      const allWords = wordStorage.getAllWords();
      setHasAnyWords(allWords.length > 0);

      let filteredWords = allWords.filter(word => word.language === settings.language);

      if (filteredWords.length === 0 && allWords.length > 0) {
        const fallbackLang = allWords[0].language;
        filteredWords = allWords.filter(word => word.language === fallbackLang);
        if (fallbackLang !== settings.language) {
          const newSettings = { ...settings, language: fallbackLang };
          setSettings(newSettings);
          settingsStorage.saveSettings(newSettings);
        }
      }

      setWords(filteredWords);
      setCurrentWordIndex(0);

      const todayRecords = recordStorage.getTodayRecords();
      setTodayCount(todayRecords.length);
    };

    loadData();
    ttsService.initTTS();
  }, [settings.language]);

  // 当前单词
  const currentWord = words[currentWordIndex];

  // 重置状态
  const resetState = () => {
    setUserInput('');
    setIsAnswered(false);
    setIsCorrect(false);
    setFeedback('');
    setShowTranslation(false);
  };

  // 播放单词语音
  const playWordSound = () => {
    if (!currentWord) return;

    let text = '';
    let speed = 1.0;

    if (currentWord.language === LanguageTypes.ENGLISH) {
      text = (currentWord.data as any).word;
      speed = settings.englishSpeed;
    } else if (currentWord.language === LanguageTypes.JAPANESE) {
      text = (currentWord.data as any).kana;
      speed = settings.japaneseSpeed;
    }

    ttsService.speakWord(text, currentWord.language, speed);
  };

  // 播放中文翻译语音
  const playTranslationSound = () => {
    if (!currentWord) return;

    let text = '';
    let speed = 1.0;

    if (currentWord.language === LanguageTypes.ENGLISH) {
      text = (currentWord.data as any).chinese;
    } else if (currentWord.language === LanguageTypes.JAPANESE) {
      text = (currentWord.data as any).chinese;
    }
    speed = settings.chineseSpeed;

    ttsService.speakText(text, 'chinese', speed);
  };

  // 处理语言变更
  const handleLanguageChange = (language: LanguageType) => {
    const newSettings = { ...settings, language };
    setSettings(newSettings);
    settingsStorage.saveSettings(newSettings);
  };

  // 检查答案
  const checkAnswer = () => {
    if (!currentWord || !userInput.trim()) return;
    
    let isCorrectAnswer = false;
    if (currentWord.language === LanguageTypes.ENGLISH) {
      isCorrectAnswer = userInput.trim().toLowerCase() === (currentWord.data as any).word.toLowerCase();
    } 
    
    processResult(isCorrectAnswer);
  };

  // 处理结果
  const processResult = (isCorrectAnswer: boolean) => {
    if (!currentWord) return;
    
    setIsAnswered(true);
    setIsCorrect(isCorrectAnswer);
    setFeedback(isCorrectAnswer ? '回答正确！🎉' : '没关系，下次一定行！💪');
    setShowTranslation(true);
    
    // 保存学习记录
    recordStorage.saveRecord({
      wordId: currentWord.id,
      timestamp: new Date(),
      isCorrect: isCorrectAnswer,
      attempt: 1
    });

    // 更新单词学习数据
    const updatedWord = { ...currentWord };
    updatedWord.reviewCount += 1;
    updatedWord.lastReviewed = new Date();
    
    if (isCorrectAnswer) {
      // 简单的间隔算法
      updatedWord.interval = Math.min(updatedWord.interval * updatedWord.easeFactor, 365);
      updatedWord.easeFactor = Math.max(1.3, updatedWord.easeFactor + 0.1);
    } else {
      updatedWord.interval = 1;
      updatedWord.easeFactor = Math.max(1.3, updatedWord.easeFactor - 0.2);
    }
    
    updatedWord.nextReview = new Date();
    updatedWord.nextReview.setDate(updatedWord.nextReview.getDate() + Math.floor(updatedWord.interval));
    
    wordStorage.saveWord(updatedWord);
  };

  // 快速判断
  const handleQuickAnswer = (known: boolean) => {
    processResult(known);
  };

  // 下一个单词
  const nextWord = () => {
    if (!words.length) return;
    
    const newIndex = (currentWordIndex + 1) % words.length;
    setCurrentWordIndex(newIndex);
    
    // 更新今日学习记录数量
    const todayRecords = recordStorage.getTodayRecords();
    setTodayCount(todayRecords.length);
    
    resetState();
  };

  // 上一个单词
  const prevWord = () => {
    if (!words.length) return;
    
    const newIndex = (currentWordIndex - 1 + words.length) % words.length;
    setCurrentWordIndex(newIndex);
    resetState();
  };

  if (!currentWord) {
    return (
      <div className="main-container">
        <Header />
        <div className="content-card">
          <div className="text-center py-12 text-gray-500">
            {hasAnyWords ? (
              <>
                <p className="text-lg font-medium mb-2">当前语言暂无单词</p>
                <p className="mb-4">请尝试切换上方语言选项卡</p>
                <div className="language-toggle" style={{ display: 'inline-flex' }}>
                  <button
                    className={`toggle-btn ${settings.language === LanguageTypes.ENGLISH ? 'active' : ''}`}
                    onClick={() => handleLanguageChange(LanguageTypes.ENGLISH)}
                  >
                    GB 英语
                  </button>
                  <button
                    className={`toggle-btn ${settings.language === LanguageTypes.JAPANESE ? 'active' : ''}`}
                    onClick={() => handleLanguageChange(LanguageTypes.JAPANESE)}
                  >
                    JP 日语
                  </button>
                </div>
              </>
            ) : (
              '没有找到单词，请先导入或添加单词'
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <Header />
      
      {/* 进度与语言控制 */}
      <section className="controls-bar">
        <div className="language-toggle">
          <button
            className={`toggle-btn ${settings.language === LanguageTypes.ENGLISH ? 'active' : ''}`}
            onClick={() => handleLanguageChange(LanguageTypes.ENGLISH)}
          >
            GB 英语
          </button>
          <button
            className={`toggle-btn ${settings.language === LanguageTypes.JAPANESE ? 'active' : ''}`}
            onClick={() => handleLanguageChange(LanguageTypes.JAPANESE)}
          >
            JP 日语
          </button>
        </div>
        <span className="progress-text">单词 {currentWordIndex + 1} / {words.length} | 今日 {todayCount}/{settings.dailyGoal}</span>
      </section>

      {/* 核心卡片 */}
      <div className="learning-card">
        {/* 单词展示区 */}
        <div className="word-display">
          <h1 className="main-word">{currentWord.language === LanguageTypes.ENGLISH
            ? (currentWord.data as any).word
            : (currentWord.data as any).kanji || (currentWord.data as any).kana}</h1>
          {currentWord.language === LanguageTypes.JAPANESE && (
            <p className="text-2xl text-gray-500 mb-2">
              {(currentWord.data as any).kana}
            </p>
          )}
          
          {/* 翻译展示 */}
          {showTranslation && (
            <p className="text-2xl text-green-600 mt-4">
              {(currentWord.data as any).chinese}
            </p>
          )}
          
          <div className="audio-controls">
            <button className="audio-btn" onClick={playWordSound}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
              {settings.language === LanguageTypes.ENGLISH ? "英语" : "日语"}
            </button>
            <button className="audio-btn" onClick={playTranslationSound}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
              中文
            </button>
          </div>
        </div>

        {/* 输入表单区 */}
        <div className="input-section">
          {settings.language === LanguageTypes.ENGLISH ? (
            <div className="input-group">
              <label htmlFor="english-input">请输入对应的英文单词</label>
              <input
                type="text"
                id="english-input"
                className="apple-input"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                disabled={isAnswered}
                placeholder="请输入英文单词..."
              />
              <button 
                className="check-btn full-width mt-4"
                onClick={checkAnswer}
                disabled={isAnswered || !userInput.trim()}
              >
                检查
              </button>
            </div>
          ) : (
            <div className="input-group">
              <label htmlFor="japanese-input">请输入对应的日语</label>
              <input
                type="text"
                id="japanese-input"
                className="apple-input"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                disabled={isAnswered}
                placeholder="请输入日语..."
              />
              <button 
                className="check-btn full-width mt-4"
                onClick={checkAnswer}
                disabled={isAnswered || !userInput.trim()}
              >
                检查
              </button>
            </div>
          )}
        </div>

        {/* 快速判断按钮区 */}
        {!isAnswered && (
          <div className="quick-actions">
            <button className="quick-btn unknown" onClick={() => handleQuickAnswer(false)}>不认识</button>
            <button className="quick-btn known" onClick={() => handleQuickAnswer(true)}>我认识</button>
          </div>
        )}

        {/* 结果反馈区 */}
        {(isAnswered || showTranslation) && (
          <div className={`feedback-section ${!isCorrect ? 'error-state' : ''}`}>
            <div className="feedback-header">
              {!isCorrect && <span className="status-icon">!</span>}
              <h3>{feedback}</h3>
            </div>
            <div className="correct-answer-box">
              <span className="label">正确答案:</span>
              {settings.language === LanguageTypes.ENGLISH ? (
                <div className="answer-item">{(currentWord.data as any).word}</div>
              ) : (
                <div className="answer-item">{(currentWord.data as any).kana} {(currentWord.data as any).kanji}</div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* 导航按钮 */}
      <div className="card-navigation">
        <button 
          className={`nav-arrow-card ${currentWordIndex === 0 ? 'disabled' : ''}`} 
          onClick={prevWord} 
          disabled={currentWordIndex === 0}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <button 
          className="nav-arrow-card primary" 
          onClick={nextWord}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LearningPage;