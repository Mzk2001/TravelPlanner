import React, { useState, useEffect } from 'react';
import { Button, message, Modal, Space, Typography } from 'antd';
import { AudioOutlined, StopOutlined, CloseOutlined } from '@ant-design/icons';
import useVoiceRecorder from '../hooks/useVoiceRecorder';

const { Text } = Typography;

const VoiceRecorder = ({ onRecordingComplete, onCancel, visible, onClose }) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const [timer, setTimer] = useState(null);
  
  const {
    isRecording,
    isSupported,
    error,
    permissionGranted,
    startRecording,
    stopRecording,
    cancelRecording,
    requestPermission,
    cleanup
  } = useVoiceRecorder();

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timer]);

  // 开始录制
  const handleStartRecording = async () => {
    const success = await startRecording();
    if (success) {
      setRecordingTime(0);
      const newTimer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setTimer(newTimer);
    }
  };

  // 停止录制
  const handleStopRecording = () => {
    const audioBlob = stopRecording();
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    setRecordingTime(0);
    
    if (audioBlob && audioBlob.size > 0) {
      onRecordingComplete(audioBlob);
      onClose();
    } else {
      message.error('录制失败，请重试');
    }
  };

  // 取消录制
  const handleCancel = () => {
    cancelRecording();
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    setRecordingTime(0);
    onCancel();
    onClose();
  };

  // 格式化时间显示
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);


  return (
    <Modal
      title="语音录制"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={400}
      centered
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        {error && (
          <div style={{ 
            color: '#ff4d4f', 
            marginBottom: '16px',
            padding: '8px 12px',
            background: '#fff2f0',
            border: '1px solid #ffccc7',
            borderRadius: '6px'
          }}>
            {error}
          </div>
        )}

        {!permissionGranted && !error && (
          <div style={{ marginBottom: '20px' }}>
            <Text>需要访问您的麦克风来录制语音</Text>
            <br />
            <Button 
              type="primary" 
              onClick={requestPermission}
              style={{ marginTop: '12px' }}
            >
              授权麦克风
            </Button>
          </div>
        )}

        {permissionGranted && !isRecording && !error && (
          <div>
            <Text>点击开始录制语音消息</Text>
            <br />
            <Button 
              type="primary" 
              size="large"
              icon={<AudioOutlined />}
              onClick={handleStartRecording}
              style={{ marginTop: '16px' }}
            >
              开始录制
            </Button>
          </div>
        )}

        {isRecording && (
          <div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#ff4d4f',
              marginBottom: '16px'
            }}>
              🔴 {formatTime(recordingTime)}
            </div>
            <Text>正在录制中...</Text>
            <br />
            <Space style={{ marginTop: '16px' }}>
              <Button 
                type="primary" 
                danger
                icon={<StopOutlined />}
                onClick={handleStopRecording}
              >
                停止录制
              </Button>
              <Button 
                icon={<CloseOutlined />}
                onClick={handleCancel}
              >
                取消
              </Button>
            </Space>
          </div>
        )}

      </div>
    </Modal>
  );
};

export default VoiceRecorder;
