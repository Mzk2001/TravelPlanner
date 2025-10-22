import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  Fab
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { Expense, CreateExpenseRequest, UpdateExpenseRequest, BudgetAnalysis } from '../types';
import apiService from '../services/api';

const ExpenseManagementPage: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgetAnalysis, setBudgetAnalysis] = useState<BudgetAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 对话框状态
  const [openDialog, setOpenDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<CreateExpenseRequest>({
    planId: parseInt(planId || '0'),
    userId: 0,
    category: 'MEAL',
    amount: 0,
    currency: 'CNY',
    description: '',
    location: '',
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    tags: '',
    isReimbursable: false,
    notes: ''
  });

  const expenseCategories = [
    { value: 'TRANSPORTATION', label: '交通' },
    { value: 'ACCOMMODATION', label: '住宿' },
    { value: 'MEAL', label: '餐饮' },
    { value: 'ACTIVITY', label: '活动' },
    { value: 'SHOPPING', label: '购物' },
    { value: 'HEALTH', label: '医疗' },
    { value: 'ENTERTAINMENT', label: '娱乐' },
    { value: 'OTHER', label: '其他' }
  ];

  const paymentMethods = [
    { value: 'CASH', label: '现金' },
    { value: 'CREDIT_CARD', label: '信用卡' },
    { value: 'ALIPAY', label: '支付宝' },
    { value: 'WECHAT', label: '微信支付' },
    { value: 'BANK_TRANSFER', label: '银行转账' }
  ];

  useEffect(() => {
    if (planId) {
      loadExpenses();
      loadBudgetAnalysis();
    }
  }, [planId]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const response = await apiService.getExpensesByPlan(parseInt(planId || '0'));
      setExpenses(response.expenses);
    } catch (err) {
      setError('加载费用记录失败');
      console.error('Load expenses error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBudgetAnalysis = async () => {
    try {
      const analysis = await apiService.getBudgetAnalysis(parseInt(planId || '0'));
      setBudgetAnalysis(analysis);
    } catch (err) {
      console.error('Load budget analysis error:', err);
    }
  };

  const handleCreateExpense = async () => {
    try {
      await apiService.createExpense(formData);
      setOpenDialog(false);
      resetForm();
      loadExpenses();
      loadBudgetAnalysis();
    } catch (err) {
      setError('创建费用记录失败');
      console.error('Create expense error:', err);
    }
  };

  const handleUpdateExpense = async () => {
    if (!editingExpense) return;
    
    try {
      const updateData: UpdateExpenseRequest = {
        category: formData.category,
        amount: formData.amount,
        currency: formData.currency,
        description: formData.description,
        location: formData.location,
        expenseDate: formData.expenseDate,
        paymentMethod: formData.paymentMethod,
        tags: formData.tags,
        isReimbursable: formData.isReimbursable,
        notes: formData.notes
      };
      
      await apiService.updateExpense(editingExpense.id, updateData);
      setOpenDialog(false);
      setEditingExpense(null);
      resetForm();
      loadExpenses();
      loadBudgetAnalysis();
    } catch (err) {
      setError('更新费用记录失败');
      console.error('Update expense error:', err);
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (!window.confirm('确定要删除这条费用记录吗？')) return;
    
    try {
      await apiService.deleteExpense(expenseId);
      loadExpenses();
      loadBudgetAnalysis();
    } catch (err) {
      setError('删除费用记录失败');
      console.error('Delete expense error:', err);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      planId: expense.planId,
      userId: expense.userId,
      category: expense.category,
      amount: expense.amount,
      currency: expense.currency,
      description: expense.description || '',
      location: expense.location || '',
      expenseDate: expense.expenseDate,
      paymentMethod: expense.paymentMethod || '',
      tags: expense.tags || '',
      isReimbursable: expense.isReimbursable,
      notes: expense.notes || ''
    });
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({
      planId: parseInt(planId || '0'),
      userId: 0,
      category: 'MEAL',
      amount: 0,
      currency: 'CNY',
      description: '',
      location: '',
      expenseDate: new Date().toISOString().split('T')[0],
      paymentMethod: '',
      tags: '',
      isReimbursable: false,
      notes: ''
    });
    setEditingExpense(null);
  };

  const getCategoryLabel = (category: string) => {
    const cat = expenseCategories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'TRANSPORTATION': '#2196F3',
      'ACCOMMODATION': '#4CAF50',
      'MEAL': '#FF9800',
      'ACTIVITY': '#9C27B0',
      'SHOPPING': '#E91E63',
      'HEALTH': '#F44336',
      'ENTERTAINMENT': '#795548',
      'OTHER': '#607D8B'
    };
    return colors[category] || '#607D8B';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          费用管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          添加费用
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 预算分析卡片 */}
      {budgetAnalysis && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">总预算</Typography>
                </Box>
                <Typography variant="h4" color="primary">
                  ¥{budgetAnalysis.totalBudget.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ReceiptIcon color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h6">已支出</Typography>
                </Box>
                <Typography variant="h4" color="secondary">
                  ¥{budgetAnalysis.totalExpense.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CategoryIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">剩余预算</Typography>
                </Box>
                <Typography variant="h4" color={budgetAnalysis.remainingBudget >= 0 ? 'success.main' : 'error.main'}>
                  ¥{budgetAnalysis.remainingBudget.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>预算使用率</Typography>
                <Typography variant="h4" color={budgetAnalysis.budgetUtilization > 100 ? 'error.main' : 'primary.main'}>
                  {budgetAnalysis.budgetUtilization.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 费用记录表格 */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            费用记录
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>日期</TableCell>
                  <TableCell>类别</TableCell>
                  <TableCell>描述</TableCell>
                  <TableCell>地点</TableCell>
                  <TableCell>金额</TableCell>
                  <TableCell>支付方式</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.expenseDate}</TableCell>
                    <TableCell>
                      <Chip
                        label={getCategoryLabel(expense.category)}
                        size="small"
                        sx={{ backgroundColor: getCategoryColor(expense.category), color: 'white' }}
                      />
                    </TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{expense.location}</TableCell>
                    <TableCell>¥{expense.amount.toLocaleString()}</TableCell>
                    <TableCell>{expense.paymentMethod}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditExpense(expense)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteExpense(expense.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* 添加/编辑费用对话框 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingExpense ? '编辑费用记录' : '添加费用记录'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>费用类别</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                >
                  {expenseCategories.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="金额"
                type="number"
                value={formData.amount}
                onChange={(e: any) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="描述"
                value={formData.description}
                onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="地点"
                value={formData.location}
                onChange={(e: any) => setFormData({ ...formData, location: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="费用日期"
                type="date"
                value={formData.expenseDate}
                onChange={(e: any) => setFormData({ ...formData, expenseDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>支付方式</InputLabel>
                <Select
                  value={formData.paymentMethod}
                  onChange={(e: any) => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  {paymentMethods.map((method) => (
                    <MenuItem key={method.value} value={method.value}>
                      {method.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="备注"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e: any) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>取消</Button>
          <Button
            variant="contained"
            onClick={editingExpense ? handleUpdateExpense : handleCreateExpense}
          >
            {editingExpense ? '更新' : '创建'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExpenseManagementPage;
