'use client';

import { useState, useEffect } from 'react';
import { recordStorage, settingsStorage } from '../../utils/storage';
import Header from '../components/Header';

const ProgressPage = () => {
  const [todayCount, setTodayCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [settings, setSettings] = useState(settingsStorage.getSettings());

  // 加载进度数据
  useEffect(() => {
    const loadProgress = () => {
      const allRecords = recordStorage.getAllRecords();
      const todayRecords = recordStorage.getTodayRecords();
      const correctRecords = allRecords.filter(record => record.isCorrect);

      setTotalCount(allRecords.length);
      setTodayCount(todayRecords.length);
      setCorrectCount(correctRecords.length);
      setAccuracy(allRecords.length > 0 ? Math.round((correctRecords.length / allRecords.length) * 100) : 0);
      setSettings(settingsStorage.getSettings());
    };

    loadProgress();
  }, []);

  // 计算学习进度百分比
  const todayProgress = Math.min(Math.round((todayCount / settings.dailyGoal) * 100), 100);

  return (
    <div className="main-container">
      <Header />
      <div className="page-header">
        <h1 className="page-title">学习进度</h1>
        <p className="page-subtitle">追踪您的每日目标与长期成就</p>
      </div>

      <div className="content-card">
        {/* 每日目标 Section */}
        <div className="progress-section mb-8">
          <div className="section-header" style={{ marginTop: 0 }}>
            <span>每日目标</span>
            <span className="badge blue" style={{ marginLeft: 'auto', fontSize: '14px' }}>
              {todayProgress}%
            </span>
          </div>
          
          <div className="goal-card">
            <div className="goal-info">
              <span className="goal-label">今日已学习</span>
              <span className="goal-numbers">
                <span className="current">{todayCount}</span>
                <span className="separator">/</span>
                <span className="target">{settings.dailyGoal}</span>
              </span>
            </div>
            
            <div className="apple-progress-track">
              <div 
                className="apple-progress-fill gradient-blue"
                style={{ width: `${todayProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* 总体统计 Grid */}
        <h3 className="settings-group-title">总体概况</h3>
        <div className="stats-grid">
          {/* 总学习次数 */}
          <div className="stat-widget">
            <div className="stat-label">总学习次数</div>
            <div className="stat-value blue">{totalCount}</div>
          </div>
          
          {/* 正确次数 */}
          <div className="stat-widget">
            <div className="stat-label">正确次数</div>
            <div className="stat-value green">{correctCount}</div>
          </div>
          
          {/* 准确率 */}
          <div className="stat-widget">
            <div className="stat-label">准确率</div>
            <div className="stat-value" style={{ color: accuracy >= 80 ? '#34c759' : '#ff9500' }}>
              {accuracy}<span style={{fontSize: '14px'}}>%</span>
            </div>
          </div>
          
          {/* 今日完成 */}
          <div className="stat-widget">
            <div className="stat-label">今日学习</div>
            <div className="stat-value">{todayCount}</div>
          </div>
        </div>
        
        {/* 学习建议 Box */}
        <div className="suggestion-box">
          <div className="suggestion-icon">💡</div>
          <div className="suggestion-content">
            <h4 className="suggestion-title">学习建议</h4>
            <ul className="suggestion-list">
              {todayCount < settings.dailyGoal && (
                <li>今天还需要学习 <strong>{settings.dailyGoal - todayCount}</strong> 个单词才能达标。</li>
              )}
              {accuracy > 0 && accuracy < 70 && (
                <li>正确率稍低，建议放慢速度，多听发音。</li>
              )}
              {totalCount > 0 && (
                <li>你已经累计学习了 <strong>{totalCount}</strong> 次，继续保持！</li>
              )}
              {todayCount >= settings.dailyGoal && accuracy >= 80 && (
                <li>今日表现完美！保持这个节奏，你的语言能力正在飞速提升。</li>
              )}
              {totalCount === 0 && (
                <li>还没有学习记录？开始你的学习之旅吧！</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;