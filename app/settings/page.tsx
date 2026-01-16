'use client';

import { useState, useEffect } from 'react';
import { LanguageTypes, LearningSettings, LanguageType } from '../../types';
import { settingsStorage } from '../../utils/storage';
import Header from '../components/Header';

const SettingsPage = () => {
  const [settings, setSettings] = useState<LearningSettings>(settingsStorage.getSettings());
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 加载设置
  useEffect(() => {
    setSettings(settingsStorage.getSettings());
  }, []);

  // 处理设置变更
  const handleSettingChange = (key: keyof LearningSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 保存设置
  const handleSave = () => {
    settingsStorage.saveSettings(settings);
    setSaveSuccess(true);
    
    // 3秒后隐藏成功提示
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="main-container">
      <Header />
      <div className="content-card">
        <div className="card-header">
          <h1>设置</h1>
        </div>
        
        {/* 状态提示 */}
        {saveSuccess && (
          <div className="status-banner success">
            <span>✓</span>
            设置保存成功！
          </div>
        )}
        
        <div className="settings-container">
          
          {/* 语言设置 */}
          <h3 className="settings-group-title">默认学习语言</h3>
          <div className="lang-select-grid">
            <div 
              className={`lang-card ${settings.language === LanguageTypes.ENGLISH ? 'active' : ''}`}
              onClick={() => handleSettingChange('language', LanguageTypes.ENGLISH)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lang-check" width="18" height="18">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <div className="lang-flag">🇬🇧</div>
              <div className="lang-name">英语</div>
            </div>
            
            <div 
              className={`lang-card ${settings.language === LanguageTypes.JAPANESE ? 'active' : ''}`}
              onClick={() => handleSettingChange('language', LanguageTypes.JAPANESE)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lang-check" width="18" height="18">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <div className="lang-flag">🇯🇵</div>
              <div className="lang-name">日语</div>
            </div>
          </div>
          
          {/* 目标设置 */}
          <h3 className="settings-group-title">学习目标</h3>
          <div className="slider-container">
            <div className="slider-header">
              <label className="slider-label">每日新词数量</label>
              <span className="slider-value">{settings.dailyGoal}</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={settings.dailyGoal}
              onChange={(e) => handleSettingChange('dailyGoal', parseInt(e.target.value) || 20)}
              className="apple-range"
              style={{ background: `linear-gradient(to right, var(--accent-blue) 0%, var(--accent-blue) ${(settings.dailyGoal - 5) / 95 * 100}%, #e5e5e5 ${(settings.dailyGoal - 5) / 95 * 100}%, #e5e5e5 100%)` }}
            />
            <div className="slider-meta">
              <span>5</span>
              <span>100</span>
            </div>
          </div>

          {/* TTS 语速设置 */}
          <h3 className="settings-group-title">语音合成速度 (TTS)</h3>
          
          <div className="slider-container">
            <div className="slider-header">
              <label className="slider-label">🇬🇧 英语语速</label>
              <span className="slider-value">{settings.englishSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.englishSpeed}
              onChange={(e) => handleSettingChange('englishSpeed', parseFloat(e.target.value) || 1.0)}
              className="apple-range"
              style={{ background: `linear-gradient(to right, var(--accent-blue) 0%, var(--accent-blue) ${(settings.englishSpeed - 0.5) / 1.5 * 100}%, #e5e5e5 ${(settings.englishSpeed - 0.5) / 1.5 * 100}%, #e5e5e5 100%)` }}
            />
            <div className="slider-meta">
              <span>Slow (0.5x)</span>
              <span>Fast (2.0x)</span>
            </div>
          </div>

          <div className="slider-container">
            <div className="slider-header">
              <label className="slider-label">🇯🇵 日语语速</label>
              <span className="slider-value">{settings.japaneseSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.japaneseSpeed}
              onChange={(e) => handleSettingChange('japaneseSpeed', parseFloat(e.target.value) || 1.0)}
              className="apple-range"
              style={{ background: `linear-gradient(to right, var(--accent-blue) 0%, var(--accent-blue) ${(settings.japaneseSpeed - 0.5) / 1.5 * 100}%, #e5e5e5 ${(settings.japaneseSpeed - 0.5) / 1.5 * 100}%, #e5e5e5 100%)` }}
            />
            <div className="slider-meta">
              <span>Slow (0.5x)</span>
              <span>Fast (2.0x)</span>
            </div>
          </div>

          <div className="slider-container">
            <div className="slider-header">
              <label className="slider-label">🇨🇳 中文语速 (参考)</label>
              <span className="slider-value">{settings.chineseSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.chineseSpeed}
              onChange={(e) => handleSettingChange('chineseSpeed', parseFloat(e.target.value) || 1.0)}
              className="apple-range"
              style={{ background: `linear-gradient(to right, var(--accent-blue) 0%, var(--accent-blue) ${(settings.chineseSpeed - 0.5) / 1.5 * 100}%, #e5e5e5 ${(settings.chineseSpeed - 0.5) / 1.5 * 100}%, #e5e5e5 100%)` }}
            />
            <div className="slider-meta">
              <span>Slow (0.5x)</span>
              <span>Fast (2.0x)</span>
            </div>
          </div>
          
          {/* 保存按钮 */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSave}
              className="apple-btn primary px-8 py-3"
            >
              保存设置
            </button>
          </div>
        </div>
        
        {/* 页脚关于 */}
        <div className="settings-footer">
          <span className="app-logo-small">🎧</span>
          <p className="footer-text">FreeWord v1.0.0</p>
          <p className="footer-sub">Designed for Language Learners</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;