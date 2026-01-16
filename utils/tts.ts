// TTS服务配置
interface TTSConfig {
  englishSpeed: number;
  japaneseSpeed: number;
  chineseSpeed: number;
}

// 文本转语音服务
export const ttsService = {
  // 初始化TTS服务
  initTTS: (): void => {
    // 浏览器TTS API不需要特殊初始化
    console.log('TTS service initialized');
  },

  // 播放文本语音
  speakText: (text: string, language: string, speed: number = 1.0): void => {
    // 检查浏览器是否支持SpeechSynthesis API
    if (!('speechSynthesis' in window)) {
      console.error('SpeechSynthesis API is not supported in this browser');
      return;
    }

    // 停止当前正在播放的语音
    window.speechSynthesis.cancel();

    // 设置语音选项
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed;

    // 根据语言设置语音
    switch (language) {
      case 'english':
        utterance.lang = 'en-US';
        break;
      case 'japanese':
        utterance.lang = 'ja-JP';
        break;
      case 'chinese':
        utterance.lang = 'zh-CN';
        break;
      default:
        utterance.lang = 'en-US';
    }

    // 播放语音
    window.speechSynthesis.speak(utterance);
  },

  // 播放单词语音（根据语言类型）
  speakWord: (text: string, language: string, speed: number = 1.0): void => {
    ttsService.speakText(text, language, speed);
  },

  // 停止当前播放的语音
  stopSpeaking: (): void => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },

  // 检查TTS是否正在播放
  isSpeaking: (): boolean => {
    if ('speechSynthesis' in window) {
      return window.speechSynthesis.speaking;
    }
    return false;
  },

  // 获取可用的语音列表
  getAvailableVoices: (): SpeechSynthesisVoice[] => {
    if ('speechSynthesis' in window) {
      return window.speechSynthesis.getVoices();
    }
    return [];
  },

  // 根据语言获取推荐的语音
  getRecommendedVoice: (language: string): SpeechSynthesisVoice | null => {
    const voices = ttsService.getAvailableVoices();
    const langCode = {
      english: 'en-US',
      japanese: 'ja-JP',
      chinese: 'zh-CN'
    }[language] || 'en-US';

    // 优先选择匹配语言的本地语音
    const matchedVoice = voices.find(voice => 
      voice.lang === langCode && voice.localService
    );

    // 如果没有本地语音，选择匹配语言的任何语音
    if (matchedVoice) {
      return matchedVoice;
    }

    return voices.find(voice => voice.lang === langCode) || null;
  }
};