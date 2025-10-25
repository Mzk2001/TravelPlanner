import { useState, useRef, useCallback } from 'react';

const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  // 检查浏览器支持
  const checkSupport = useCallback(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('您的浏览器不支持语音录制功能');
      setIsSupported(false);
      return false;
    }
    setIsSupported(true);
    return true;
  }, []);

  // 请求麦克风权限
  const requestPermission = useCallback(async () => {
    if (!checkSupport()) return false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      setPermissionGranted(true);
      setError(null);
      streamRef.current = stream;
      return true;
    } catch (err) {
      console.error('获取麦克风权限失败:', err);
      setError('无法访问麦克风，请检查权限设置');
      setPermissionGranted(false);
      return false;
    }
  }, [checkSupport]);

  // 开始录制
  const startRecording = useCallback(async () => {
    if (!permissionGranted) {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    try {
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm;codecs=opus' 
        });
        return audioBlob;
      };

      mediaRecorder.start(100); // 每100ms收集一次数据
      setIsRecording(true);
      setError(null);
      return true;
    } catch (err) {
      console.error('开始录制失败:', err);
      setError('录制失败，请重试');
      return false;
    }
  }, [permissionGranted, requestPermission]);

  // 停止录制
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // 返回录制的音频数据
      const audioBlob = new Blob(audioChunksRef.current, { 
        type: 'audio/webm;codecs=opus' 
      });
      return audioBlob;
    }
    return null;
  }, [isRecording]);

  // 取消录制
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      audioChunksRef.current = [];
    }
  }, [isRecording]);

  // 清理资源
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setPermissionGranted(false);
    setIsRecording(false);
    audioChunksRef.current = [];
  }, []);

  return {
    isRecording,
    isSupported,
    error,
    permissionGranted,
    startRecording,
    stopRecording,
    cancelRecording,
    requestPermission,
    cleanup
  };
};

export default useVoiceRecorder;
