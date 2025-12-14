import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getHabits, toggleHabitCompletion } from '../features/habits/habitSlice';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Checkbox, 
  CircularProgress, 
  Container, 
  Grid, 
  Typography, 
  Chip,
  Paper,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { Add, Check, Close, Edit, Delete } from '@mui/icons-material';
import { format, isToday, isBefore, isAfter, isSameDay, addDays } from 'date-fns';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { habits, loading } = useSelector((state) => state.habits);
  const { userInfo } = useSelector((state) => state.auth);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);

  useEffect(() => {
    if (userInfo) {
      dispatch(getHabits());
    } else {
      navigate('/login');
    }
  }, [dispatch, navigate, userInfo]);

  useEffect(() => {
    // Generate dates for the current week
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    setWeekDates(dates);
  }, []);

  const handleToggleHabit = (habitId, completedDates) => {
    dispatch(toggleHabitCompletion(habitId));
  };

  const isHabitCompletedForDate = (habit, date) => {
    if (!habit.completedDates || !habit.completedDates.length) return false;
    
    return habit.completedDates.some(completedDate => {
      const completedDateObj = new Date(completedDate);
      return isSameDay(completedDateObj, date);
    });
  };

  const getDayName = (date) => {
    return format(date, 'EEE');
  };

  const getDayNumber = (date) => {
    return format(date, 'd');
  };

  const isCurrentDay = (date) => {
    return isToday(date);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1" gutterBottom>
            My Habits
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => navigate('/habits/new')}
          >
            New Habit
          </Button>
        </Box>
        
        {/* Week Navigation */}
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">This Week</Typography>
            <Box>
              <IconButton size="small" onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(selectedDate.getDate() - 7);
                setSelectedDate(newDate);
              }}>
                &lt;
              </IconButton>
              <IconButton size="small" onClick={() => setSelectedDate(new Date())}>
                Today
              </IconButton>
              <IconButton size="small" onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(selectedDate.getDate() + 7);
                setSelectedDate(newDate);
              }}>
                &gt;
              </IconButton>
            </Box>
          </Box>
          
          <Grid container spacing={1} justifyContent="space-between">
            {weekDates.map((date, index) => (
              <Grid item key={index} xs={1}>
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center"
                  p={1}
                  bgcolor={isCurrentDay(date) ? 'primary.light' : 'transparent'}
                  borderRadius={1}
                >
                  <Typography variant="caption" color="textSecondary">
                    {getDayName(date)}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight={isCurrentDay(date) ? 'bold' : 'normal'}
                  >
                    {getDayNumber(date)}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>

      {habits.length === 0 ? (
        <Box textAlign="center" mt={8}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No habits found
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Get started by creating your first habit
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => navigate('/habits/new')}
          >
            Create Habit
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {habits.map((habit) => (
            <Grid item xs={12} sm={6} md={4} key={habit._id}>
              <Card 
                variant="outlined"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {habit.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        {habit.description}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" mb={2}>
                        <Chip 
                          size="small" 
                          label={`${habit.frequency.length} days/week`} 
                          sx={{ mr: 1 }} 
                        />
                        {habit.streak > 0 && (
                          <Chip 
                            size="small" 
                            color="primary" 
                            label={`${habit.streak} day${habit.streak !== 1 ? 's' : ''} streak`} 
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                    
                    <Box>
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          onClick={() => navigate(`/habits/${habit._id}/edit`)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />
                  
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      This Week
                    </Typography>
                    <Box display="flex" justifyContent="space-between">
                      {weekDates.map((date, index) => {
                        const isCompleted = isHabitCompletedForDate(habit, date);
                        const isFutureDate = isAfter(date, new Date());
                        const isScheduledDay = habit.frequency.includes(
                          format(date, 'EEEE').toLowerCase()
                        );
                        
                        return (
                          <Box 
                            key={index} 
                            display="flex" 
                            flexDirection="column" 
                            alignItems="center"
                          >
                            <Typography variant="caption" color="textSecondary">
                              {getDayName(date).charAt(0)}
                            </Typography>
                            <Checkbox
                              size="small"
                              checked={isCompleted}
                              disabled={isFutureDate || !isScheduledDay}
                              onChange={() => handleToggleHabit(habit._id, date)}
                              icon={!isScheduledDay ? <Box width={24} height={24} /> : undefined}
                              checkedIcon={
                                isCompleted ? (
                                  <Box 
                                    width={24} 
                                    height={24} 
                                    borderRadius="50%" 
                                    bgcolor="primary.main"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                  >
                                    <Check style={{ color: 'white', fontSize: 16 }} />
                                  </Box>
                                ) : (
                                  <Box 
                                    width={24} 
                                    height={24} 
                                    borderRadius="50%" 
                                    border="1px solid #ccc"
                                  />
                                )
                              }
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;
