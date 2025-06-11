import React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Grid,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircleOutline,
  AccessTime,
  PlayCircleOutline,
  DoneAll,
} from '@mui/icons-material';

export const Concept: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: <CheckCircleOutline />,
      title: '正確な作業実績',
      description: 'Nowに置かれている間のみを計測。余計な時間を含まない、正確な作業実績を把握できます。',
    },
    {
      icon: <AccessTime />,
      title: '自動計測の仕組み',
      description: '作業を始める前にNowにタスクを移動するだけ。あとは自動で作業時間を計測します。',
    },
    {
      icon: <PlayCircleOutline />,
      title: '意図的な制限設計',
      description: 'Nowには1つのタスクしか置けない。この制限により、現在の作業が一目で分かり、タスクの切り替えも自動で行われるため、操作の手間を最小限に抑えられます。',
    },
    {
      icon: <DoneAll />,
      title: 'ドラッグ＆ドロップ',
      description: '直感的な操作で、タスクの状態を簡単に更新できます。',
    },
  ];

  const taskStatuses = [
    {
      title: 'Backlog',
      description: '未着手の作業。これから取り組むタスクをここに配置します。',
    },
    {
      title: 'In Progress',
      description: '手をつけているが、完了していない作業。次のステップに進む準備ができたタスクです。',
    },
    {
      title: 'Now',
      description: '現在進行中のタスク。一人につき1つまでという制限を設けることで、集中力を高め、正確な作業実績を計測します。作業を始める前に、タスクをここに移動するだけです。',
    },
    {
      title: 'Done',
      description: '完了したタスク。作業履歴として残しておくことができます。',
    },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* ヒーローセクション */}
      <Box
        sx={{
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                }}
              >
                Ittō (一灯)
              </Typography>
              <Typography
                variant="h5"
                sx={{ mb: 2, opacity: 0.9 }}
              >
                暗闇に灯る、ただ一つの光
              </Typography>
              <Typography
                variant="h6"
                sx={{ mb: 4, opacity: 0.8 }}
              >
                人間は同時に一つのことしかできない。
                シンプルな考え方で、より効率的な作業管理を。
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/')}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                }}
              >
                カンバンボードを始める
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  width: '100%',
                  height: 400,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  boxShadow: 3,
                }}
              >
                <Typography variant="h4" sx={{ color: 'white', textAlign: 'center' }}>
                  作業実績を<br />
                  自動で計測する<br />
                  唯一のタスク管理
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* アプリ名の由来セクション */}
      <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h3"
                component="h2"
                gutterBottom
                sx={{ mb: 4 }}
              >
                アプリ名の由来
              </Typography>
              <Typography variant="h4" sx={{ mb: 3, color: 'primary.main' }}>
                Ittō (一灯)
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', mb: 3 }}>
                「暗闇に灯る、ただ一つの光」
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', mb: 3 }}>
                私たちは、日々の仕事の中で多くのタスクに追われ、時に混乱し、時に迷うことがあります。
                そんな中で、今この瞬間に取り組むべきは、ただ一つだけ。
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', mb: 3 }}>
                人間は同時に一つのことしかできない。
                このシンプルな真実に基づき、私たちはIttōを設計しました。
                複数のタスクに分散するのではなく、一つの光に集中することで、
                より効率的で充実した仕事を実現する。それが、Ittōの目指す世界です。
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  width: '100%',
                  height: 400,
                  bgcolor: 'rgba(25, 118, 210, 0.05)',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0) 70%)',
                    animation: 'pulse 4s ease-in-out infinite',
                  },
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'scale(1)',
                      opacity: 0.5,
                    },
                    '50%': {
                      transform: 'scale(1.2)',
                      opacity: 0.8,
                    },
                    '100%': {
                      transform: 'scale(1)',
                      opacity: 0.5,
                    },
                  },
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    color: 'primary.main',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  一つの光に<br />
                  集中する
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 特徴セクション */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          主な特徴
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <Box
                  sx={{
                    color: 'primary.main',
                    fontSize: '3rem',
                    mb: 2,
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* タスクの状態セクション */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            タスクの状態
          </Typography>
          <Grid container spacing={3}>
            {taskStatuses.map((status, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    height: '100%',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      bgcolor: 'primary.main',
                      borderTopLeftRadius: 4,
                      borderBottomLeftRadius: 4,
                    },
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    {status.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {status.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTAセクション */}
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom>
            さっそく始めてみませんか？
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
            シンプルで効率的なタスク管理を、今すぐ体験してください。
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/')}
            sx={{ px: 4, py: 1.5 }}
          >
            カンバンボードを始める
          </Button>
        </Container>
      </Box>
    </Box>
  );
}; 