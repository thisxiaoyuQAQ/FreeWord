'use client';

import { useState, useRef, useCallback } from 'react';
import { Word, LanguageTypes, LanguageType } from '../../types';
import { wordStorage, backupStorage, generateId } from '../../utils/storage';
import Header from '../components/Header';

const ImportPage = () => {
  const [importText, setImportText] = useState('');
  const [language, setLanguage] = useState<LanguageType>(LanguageTypes.ENGLISH);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 解析导入文本
  const parseImportText = (text: string, lang: LanguageType): Word[] => {
    const words: Word[] = [];
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;

      try {
        if (lang === LanguageTypes.ENGLISH) {
          // 英语格式：单词,中文翻译
          const parts = line.split(',');
          if (parts.length >= 2) {
            const word = parts[0].trim();
            const chinese = parts[1].trim();

            words.push({
              id: generateId(),
              language: lang,
              data: { word, chinese },
              createdAt: new Date(),
              reviewCount: 0,
              lastReviewed: null,
              nextReview: null,
              interval: 1,
              easeFactor: 2.5,
              isFavorite: false
            });
          }
        } else if (lang === LanguageTypes.JAPANESE) {
          // 日语格式：假名,汉字,中文翻译
          const parts = line.split(',');
          if (parts.length >= 3) {
            const kana = parts[0].trim();
            const kanji = parts[1].trim();
            const chinese = parts[2].trim();

            words.push({
              id: generateId(),
              language: lang,
              data: { kana, kanji, chinese },
              createdAt: new Date(),
              reviewCount: 0,
              lastReviewed: null,
              nextReview: null,
              interval: 1,
              easeFactor: 2.5,
              isFavorite: false
            });
          }
        }
      } catch (err) {
        throw new Error(`第 ${i + 1} 行格式错误`);
      }
    }

    return words;
  };

  // 处理导入
  const handleImport = () => {
    setError(null);
    setImportResult(null);

    try {
      const newWords = parseImportText(importText, language);
      if (newWords.length === 0) {
        setError('没有找到有效的单词');
        return;
      }

      // 保存到存储
      const existingWords = wordStorage.getAllWords();
      const allWords = [...existingWords, ...newWords];
      wordStorage.saveWords(allWords);

      setImportResult(`成功导入 ${newWords.length} 个单词`);
      setImportText('');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // 示例文本
  const getSampleText = () => {
    if (language === LanguageTypes.ENGLISH) {
      return 'hello,你好\nworld,世界\napple,苹果\nbanana,香蕉\ncat,猫';
    } else {
      return 'おはよう,おはよう,早上好\nこんにちは,こんにちは,下午好\nこんばんは,こんばんは,晚上好\nおやすみ,おやすみ,晚安\nありがとう,ありがとう,谢谢';
    }
  };

  // 加载示例文本
  const loadSampleText = () => {
    setImportText(getSampleText());
  };

  // 处理文件上传
  const processFile = useCallback((file: File) => {
    setError(null);
    setImportResult(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;

      if (file.name.endsWith('.json')) {
        try {
          const data = JSON.parse(content);
          if (!data.words || !data.records || !data.settings) {
            setError('JSON 数据格式不正确：缺少 words、records 或 settings 字段');
            return;
          }
          const wordCount = data.words.length || 0;
          const recordCount = data.records.length || 0;
          const confirmed = window.confirm(
            `即将导入备份数据：\n• ${wordCount} 个单词\n• ${recordCount} 条学习记录\n\n此操作将覆盖当前所有数据，确定继续？`
          );
          if (!confirmed) return;

          const success = backupStorage.importData(content);
          if (success) {
            setImportResult(`成功导入备份数据：${wordCount} 个单词, ${recordCount} 条学习记录`);
          } else {
            setError('数据导入失败，请检查文件内容');
          }
        } catch {
          setError('JSON 文件解析失败，请检查文件格式');
        }
      } else {
        setImportText(content);
        setImportResult('文件内容已加载到文本区域，请确认后点击"导入单词"');
      }
    };

    reader.onerror = () => {
      setError('文件读取失败，请重试');
    };

    reader.readAsText(file);
  }, []);

  // 处理文件选择
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFile]);

  // 处理拖拽
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  return (
    <div className="main-container">
      <Header />
      <div className="content-card">
        <div className="card-header">
          <h1>导入单词</h1>
        </div>

        {/* 语言选择 */}
        <div className="segmented-control mb-6">
          <input 
            type="radio" 
            name="language" 
            id="lang-en" 
            checked={language === LanguageTypes.ENGLISH} 
            onChange={() => setLanguage(LanguageTypes.ENGLISH)}
          />
          <label htmlFor="lang-en">GB 英语</label>
          
          <input 
            type="radio" 
            name="language" 
            id="lang-jp" 
            checked={language === LanguageTypes.JAPANESE} 
            onChange={() => setLanguage(LanguageTypes.JAPANESE)}
          />
          <label htmlFor="lang-jp">JP 日语</label>
          
          <div className="marker"></div>
        </div>

        {/* 文件上传区域 */}
        <div
          className={`apple-dropzone mb-6 ${isDragging ? 'dragging' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="dropzone-icon">📂</div>
          <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
            拖拽文件到此处上传
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            支持 .txt 文本文件 或 .json 备份文件
          </p>
          <div className="file-input-label">
            选择文件
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.json"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {/* 状态提示 */}
        {error && (
          <div className="status-banner error">
            <span>!</span>
            {error}
          </div>
        )}

        {importResult && (
          <div className="status-banner success">
            <span>✓</span>
            {importResult}
          </div>
        )}

        {/* 导入文本区域 */}
        <div className="relative mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="instruction-title">输入单词列表</label>
            <button
              onClick={loadSampleText}
              className="apple-btn secondary text-sm px-3 py-1"
            >
              加载示例
            </button>
          </div>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={10}
            className="apple-textarea"
            placeholder={language === LanguageTypes.ENGLISH
              ? 'hello,你好\nworld,世界' 
              : 'おはよう,おはよう,早上好\nこんにちは,こんにちは,下午好'}
          />
        </div>

        {/* 导入格式说明 */}
        <div className="instruction-box">
          <div className="instruction-title">格式指南</div>
          <ul className="instruction-list">
            <li>🇬🇧 英语：<code>word,中文翻译</code> (单词 逗号 释义)</li>
            <li>🇯🇵 日语：<code>假名,汉字,中文翻译</code> (假名 逗号 汉字 逗号 释义)</li>
            <li>• 系统会自动忽略空行和以 # 开头的注释行</li>
          </ul>
        </div>

        {/* 导入按钮 */}
        <div className="button-group">
          <button
            onClick={handleImport}
            className="apple-btn primary"
          >
            导入单词
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportPage;