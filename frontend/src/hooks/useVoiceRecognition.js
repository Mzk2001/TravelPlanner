import { useState, useRef, useCallback } from 'react';

const useVoiceRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  
  const recognitionRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      console.log('🎤 开始语音识别...');
      setError(null);
      setTranscript('');
      setInterimTranscript('');

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
      recognition.continuous = true; // 连续识别，用户可以手动停止
      recognition.interimResults = true; // 返回中间结果，实时显示识别内容
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
          setTranscript(prev => prev + finalTranscript);
        }
        if (interimTranscript) {
          setInterimTranscript(interimTranscript);
        }
      };

      // 识别结束处理
      recognition.onend = () => {
        console.log('🏁 语音识别结束');
        setIsRecording(false);
        setIsProcessing(false);
        setInterimTranscript('');
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
        
        setError(errorMessage);
        setIsRecording(false);
        setIsProcessing(false);
      };

      // 识别开始处理
      recognition.onstart = () => {
        console.log('🚀 语音识别开始');
        setIsRecording(true);
        setIsProcessing(true);
      };

      // 开始识别
      console.log('🎯 启动语音识别...');
      recognition.start();

    } catch (error) {
      console.error('❌ 开始语音识别失败:', error);
      setError(error instanceof Error ? error.message : '无法启动语音识别');
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      console.log('🛑 停止语音识别');
      recognitionRef.current.stop();
      setIsRecording(false);
      setIsProcessing(false);
    }
  }, [isRecording]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isRecording,
    isProcessing,
    error,
    transcript,
    interimTranscript,
    startRecording,
    stopRecording,
    clearError,
    clearTranscript,
  };
};

export default useVoiceRecognition;