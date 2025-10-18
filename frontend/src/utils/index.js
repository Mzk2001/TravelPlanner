import dayjs from 'dayjs'

// 日期格式化工具
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  return dayjs(date).format(format)
}

export const formatDateTime = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 状态标签颜色映射
export const getStatusColor = (status) => {
  const statusColorMap = {
    DRAFT: 'default',
    PLANNING: 'processing',
    CONFIRMED: 'success',
    COMPLETED: 'success',
    CANCELLED: 'error',
  }
  return statusColorMap[status] || 'default'
}

// 状态文本映射
export const getStatusText = (status) => {
  const statusTextMap = {
    DRAFT: '草稿',
    PLANNING: '规划中',
    CONFIRMED: '已确认',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
  }
  return statusTextMap[status] || status
}

// 金额格式化
export const formatCurrency = (amount) => {
  return `¥${amount.toLocaleString()}`
}

// 计算旅行天数
export const calculateDays = (startDate, endDate) => {
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  return end.diff(start, 'day') + 1
}

// 验证邮箱格式
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证密码强度
export const validatePassword = (password) => {
  if (password.length < 6) {
    return '密码长度至少6位'
  }
  if (!/(?=.*[a-zA-Z])/.test(password)) {
    return '密码必须包含字母'
  }
  if (!/(?=.*\d)/.test(password)) {
    return '密码必须包含数字'
  }
  return null
}

// 本地存储工具
export const storage = {
  set: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value))
  },
  get: (key) => {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  },
  remove: (key) => {
    localStorage.removeItem(key)
  },
  clear: () => {
    localStorage.clear()
  },
}

// 防抖函数
export const debounce = (func, wait) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

