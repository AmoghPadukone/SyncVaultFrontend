import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CloudProvider } from '@shared/schema';
import ProviderIcon from '@/components/common/ProviderIcon';
import { Check, CloudOff } from 'lucide-react';

interface ProviderWelcomeAnimationProps {
  provider: CloudProvider;
  isConnected: boolean;
  onAnimationComplete?: () => void;
}

const ProviderWelcomeAnimation: React.FC<ProviderWelcomeAnimationProps> = ({
  provider,
  isConnected,
  onAnimationComplete,
}) => {
  const [animationPhase, setAnimationPhase] = useState<'initial' | 'animating' | 'completed'>('initial');

  useEffect(() => {
    if (isConnected && animationPhase === 'initial') {
      setAnimationPhase('animating');
      
      // After animation completes, set to completed
      const timer = setTimeout(() => {
        setAnimationPhase('completed');
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 3000); // Total animation duration
      
      return () => clearTimeout(timer);
    }
  }, [isConnected, animationPhase, onAnimationComplete]);

  if (animationPhase === 'initial') {
    return null;
  }

  // Different animation styles based on provider type
  const getAnimationStyle = () => {
    switch (provider.type) {
      case 'gcp':
        return {
          background: 'linear-gradient(135deg, #4285F4, #34A853, #FBBC05, #EA4335)',
          boxShadow: '0 8px 32px rgba(66, 133, 244, 0.3)',
        };
      case 'aws':
        return {
          background: 'linear-gradient(135deg, #FF9900, #232F3E)',
          boxShadow: '0 8px 32px rgba(255, 153, 0, 0.3)',
        };
      case 'azure':
        return {
          background: 'linear-gradient(135deg, #0078D4, #5C2D91)',
          boxShadow: '0 8px 32px rgba(0, 120, 212, 0.3)',
        };
      case 'dropbox':
        return {
          background: 'linear-gradient(135deg, #0061FF, #00BFFF)',
          boxShadow: '0 8px 32px rgba(0, 97, 255, 0.3)',
        };
      default:
        return {
          background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
        };
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
      
      <motion.div
        className="relative rounded-2xl p-8 text-white text-center"
        style={getAnimationStyle()}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <motion.div
          className="mb-6 mx-auto rounded-full w-24 h-24 bg-white flex items-center justify-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <ProviderIcon providerId={provider.id} size="large" />
        </motion.div>
        
        <motion.h2
          className="text-2xl font-bold mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {isConnected ? 'Welcome to ' : 'Disconnected from '} {provider.name}!
        </motion.h2>
        
        <motion.p
          className="text-lg opacity-90 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {isConnected 
            ? 'Your account has been successfully connected. SyncVault can now access your files.'
            : 'Your account has been disconnected. SyncVault can no longer access your files.'}
        </motion.p>
        
        <motion.div
          className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 360] }}
          transition={{ delay: 0.8, duration: 0.8, type: 'spring', stiffness: 200 }}
        >
          {isConnected ? (
            <Check className="h-8 w-8 text-green-500" />
          ) : (
            <CloudOff className="h-8 w-8 text-red-500" />
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ProviderWelcomeAnimation;