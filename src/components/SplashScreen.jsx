import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { BookOpen } from 'lucide-react';

const SplashScreen = ({ onComplete, duration = 2000 }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete(), 300);
          return 100;
        }
        return prev + 2;
      });
    }, duration / 50);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 50%, #dbeafe 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      {/* Animated Background Circles */}
      <Box
        sx={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)',
          animation: 'pulse 2s ease-in-out infinite'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)',
          animation: 'pulse 3s ease-in-out infinite',
          animationDelay: '0.5s'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          animation: 'pulse 4s ease-in-out infinite',
          animationDelay: '1s'
        }}
      />

      {/* Logo Icon */}
      <Box
        sx={{
          position: 'relative',
          mb: 4,
          animation: 'float 3s ease-in-out infinite'
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 40px rgba(245, 158, 11, 0.3)'
          }}
        >
          <BookOpen size={40} color="white" />
        </Box>
      </Box>

      {/* App Name */}
      <Typography
        variant="h4"
        sx={{
          background: 'linear-gradient(90deg, #f59e0b 0%, #ec4899 50%, #3b82f6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 700,
          mb: 1,
          letterSpacing: '0.5px',
          position: 'relative',
          animation: 'fadeIn 1s ease-out'
        }}
      >
        Organization Management
      </Typography>

      {/* Tagline */}
      <Typography
        variant="body1"
        sx={{
          color: '#6b7280',
          mb: 6,
          position: 'relative',
          animation: 'fadeIn 1s ease-out 0.3s both'
        }}
      >
        Loading your experience...
      </Typography>

      {/* Progress Bar */}
      <Box
        sx={{
          width: 280,
          height: 6,
          background: 'rgba(0, 0, 0, 0.05)',
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #f59e0b 0%, #ec4899 50%, #3b82f6 100%)',
            borderRadius: 3,
            transition: 'width 0.1s linear',
            boxShadow: '0 0 20px rgba(236, 72, 153, 0.4)'
          }}
        />
      </Box>

      {/* Progress Percentage */}
      <Typography
        variant="caption"
        sx={{
          color: '#9ca3af',
          mt: 2,
          position: 'relative',
          animation: 'fadeIn 1s ease-out 0.5s both'
        }}
      >
        {progress}%
      </Typography>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
};

export default SplashScreen;
