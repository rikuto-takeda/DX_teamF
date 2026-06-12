import { useEffect, useState } from 'react';
import { Coupon, Store } from '../App';
import { CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface CompletionScreenProps {
  coupon: Coupon;
  store: Store;
  onComplete: () => void;
}

export function CompletionScreen({ coupon, store, onComplete }: CompletionScreenProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 px-6 py-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
          {/* Success Icon with Animation */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-block"
            >
              <div className="relative">
                <CheckCircle className="w-24 h-24 text-green-500 mx-auto" />
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="absolute inset-0 bg-green-400 rounded-full blur-xl"
                />
              </div>
            </motion.div>
            
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl text-gray-800 mt-4"
            >
              利用完了
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-gray-600 mt-2"
            >
              クーポンが正常に利用されました
            </motion.p>
          </div>

          {/* Animated Time Display */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 mb-6 text-white text-center"
          >
            <p className="text-sm opacity-90 mb-2">{formatDate(currentTime)}</p>
            <motion.p
              key={currentTime.getSeconds()}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-4xl tabular-nums"
            >
              {formatTime(currentTime)}
            </motion.p>
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-xs opacity-75">この画面の時刻が動いていることを確認してください</p>
            </div>
          </motion.div>

          {/* Coupon and Store Details */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="space-y-4 mb-6"
          >
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">利用クーポン</p>
              <p className="text-lg text-gray-800">{coupon.title}</p>
              <p className="text-sm text-green-600 mt-1">{coupon.discount}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">利用店舗</p>
              <p className="text-lg text-gray-800">{store.name}</p>
              <p className="text-xs text-gray-500 mt-1">店舗コード: {store.code}</p>
            </div>
          </motion.div>

          {/* Pulsing Border Effect */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(34, 197, 94, 0.4)',
                '0 0 0 10px rgba(34, 197, 94, 0)',
                '0 0 0 0 rgba(34, 197, 94, 0)'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6"
          >
            <p className="text-xs text-green-800 text-center">
              ✓ スタッフがこの画面を確認後、サービスが適用されます
            </p>
          </motion.div>

          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={onComplete}
            className="w-full bg-gray-800 text-white py-4 rounded-xl hover:bg-gray-900 transition-colors"
          >
            マイページへ戻る
          </motion.button>
        </motion.div>

        {/* Security Note */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-4"
        >
          <p className="text-xs text-gray-600 text-center">
            🔒 スクリーンショットによる不正利用を防ぐため、時刻表示が動的に更新されています
          </p>
        </motion.div>
      </div>
    </div>
  );
}
