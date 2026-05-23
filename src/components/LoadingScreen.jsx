// src/components/LoadingScreen.jsx
import React, { useState, useEffect, useRef } from "react";

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const startTime = useRef(Date.now());
  const animationFrame = useRef();

  useEffect(() => {
    const start = startTime.current;
    const duration = 3000; // 3 seconds animation

    const animateProgress = (now) => {
      const elapsed = now - start;
      const newProgress = Math.min(100, (elapsed / duration) * 100);
      setProgress(newProgress);

      if (newProgress < 100) {
        animationFrame.current = requestAnimationFrame(animateProgress);
      } else {
        // Animation complete
        setTimeout(() => {
          setLoadingComplete(true);
        }, 500);
      }
    };

    animationFrame.current = requestAnimationFrame(animateProgress);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  if (loadingComplete) {
    return null; // or return children directly
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        {/* Animated Outer Ring */}
        <div className="relative w-36 h-36 mx-auto mb-8">
          {/* Rotating Border */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-b-indigo-500 border-l-indigo-500 animate-spin-slow"></div>
          
          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-blue-200 opacity-30 blur-xl"></div>
          
          {/* Centered Logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="https://res.cloudinary.com/dfqsa6hoc/image/upload/v1779533276/PhotoshopExtension_Image__1_-removebg-preview_fzvzvy.png"
              alt="INDIAN HOMEY"
              className="w-24 h-24 object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/96?text=IH";
              }}
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto mb-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <p className="text-gray-500 text-sm">Loading... {Math.round(progress)}%</p>

        {/* Welcome Message */}
        <div className="mt-6 space-y-2">
          <p className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent animate-pulse">
            Welcome to INDIAN HOMEY
          </p>
          <p className="text-gray-500 text-sm">Your trusted home service partner</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;