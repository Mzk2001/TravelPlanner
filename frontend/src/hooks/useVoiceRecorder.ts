import { useState, useRef, useCallback } from 'react';

interface VoiceRecorderState {
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
  transcript: string | null;
}

interface VoiceRecorderReturn extends VoiceRecorderState {
  startRecording: () => void;
  stopRecording: () => void;
  clearError: () => void;
  clearTranscript: () => void;
}

export const useVoiceRecorder = (): VoiceRecorderReturn => {
  const [state, setState] = useState<VoiceRecorderState>({
    isRecording: false,
    isProcessing: false,
    error: null,
    transcript: null,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startRecording = useCallback(async () => {
    try {
      console.log('🎤 开始语音识别...');
      setState(prev => ({ ...prev, error: null, transcript: null }));

      // 检查浏览器是否支持Web Speech API
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.error('❌ 浏览器不支持语音识别');
        throw new Error('您的浏览器不支持语音识别功能，请使用Chrome、Edge或Safari浏览器');
      }

      console.log('✅ 浏览器支持语音识别');

      // 创建语音识别实例
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognitionRef.current = recognition;

      // 配置语音识别参数
      recognition.continuous = false; // 不连续识别
      recognition.interimResults = true; // 返回中间结果，这样可以看到实时识别
      recognition.lang = 'zh-CN'; // 中文识别
      recognition.maxAlternatives = 1; // 只返回最佳结果

      console.log('🔧 语音识别配置完成');

      // 识别结果处理
      recognition.onresult = (event) => {
        console.log('🎯 语音识别结果:', event);
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        console.log('📝 最终结果:', finalTranscript);
        console.log('⏳ 中间结果:', interimTranscript);

        if (finalTranscript) {
          setState(prev => ({ 
            ...prev, 
            isRecording: false, 
            isProcessing: false,
            transcript: finalTranscript
          }));
        } else if (interimTranscript) {
          // 显示中间结果
          setState(prev => ({ 
            ...prev, 
            transcript: interimTranscript + '...'
          }));
        }
      };

      // 识别结束处理
      recognition.onend = () => {
        console.log('🏁 语音识别结束');
        setState(prev => ({ ...prev, isRecording: false, isProcessing: false }));
      };

      // 识别错误处理
      recognition.onerror = (event) => {
        console.error('❌ 语音识别错误:', event.error);
        let errorMessage = '语音识别失败';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = '未检测到语音，请重新尝试';
            break;
          case 'audio-capture':
            errorMessage = '无法访问麦克风，请检查权限设置';
            break;
          case 'not-allowed':
            errorMessage = '麦克风权限被拒绝，请在浏览器设置中允许访问麦克风';
            break;
          case 'network':
            errorMessage = '网络连接问题，请检查网络连接';
            break;
          case 'aborted':
            errorMessage = '语音识别被中断';
            break;
          default:
            errorMessage = `语音识别错误: ${event.error}`;
        }
        
        setState(prev => ({ 
          ...prev, 
          error: errorMessage,
          isRecording: false,
          isProcessing: false
        }));
      };

      // 识别开始处理
      recognition.onstart = () => {
        console.log('🚀 语音识别开始');
        setState(prev => ({ ...prev, isProcessing: true }));
      };

      // 开始识别
      console.log('🎯 启动语音识别...');
      recognition.start();
      
      setState(prev => ({ ...prev, isRecording: true }));

    } catch (error) {
      console.error('❌ 开始语音识别失败:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : '无法启动语音识别',
        isRecording: false 
      }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && state.isRecording) {
      recognitionRef.current.stop();
    }
  }, [state.isRecording]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: null }));
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    clearError,
    clearTranscript,
  };
};
