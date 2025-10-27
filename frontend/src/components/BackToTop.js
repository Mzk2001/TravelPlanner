import React from 'react';
import { Button, Tooltip } from 'antd';
import { VerticalAlignTopOutlined } from '@ant-design/icons';

const BackToTop = ({ 
  target, 
  style = {},
  className = ''
}) => {
  const scrollToTop = () => {
    if (target && typeof target.scrollTo === 'function') {
      target.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else if (target && typeof target.scrollTop !== 'undefined') {
      target.scrollTop = 0;
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Tooltip title="回到顶部" placement="left">
      <Button
        type="primary"
        shape="circle"
        icon={<VerticalAlignTopOutlined />}
        onClick={scrollToTop}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '50px',
          height: '50px',
          fontSize: '18px',
          zIndex: 99999,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          backgroundColor: '#1890ff',
          border: 'none',
          ...style
        }}
        className={className}
      />
    </Tooltip>
  );
};

export default BackToTop;
