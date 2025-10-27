import React, { useState, useEffect } from 'react';
import { Button, Tooltip } from 'antd';
import { VerticalAlignTopOutlined } from '@ant-design/icons';

interface BackToTopProps {
  target?: HTMLElement | null;
  visibilityHeight?: number;
  style?: React.CSSProperties;
}

const BackToTop: React.FC<BackToTopProps> = ({ 
  target, 
  visibilityHeight = 400,
  style 
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const scrollElement = target || window;
    
    const handleScroll = () => {
      const scrollTop = target 
        ? target.scrollTop 
        : document.documentElement.scrollTop || document.body.scrollTop;
      
      setVisible(scrollTop > visibilityHeight);
    };

    scrollElement.addEventListener('scroll', handleScroll);
    
    // 初始检查
    handleScroll();

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
    };
  }, [target, visibilityHeight]);

  const scrollToTop = () => {
    if (target) {
      target.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Tooltip title="回到顶部">
      <Button
        type="primary"
        shape="circle"
        icon={<VerticalAlignTopOutlined />}
        onClick={scrollToTop}
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '30px',
          zIndex: 1000,
          width: '50px',
          height: '50px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          ...style
        }}
      />
    </Tooltip>
  );
};

export default BackToTop;
