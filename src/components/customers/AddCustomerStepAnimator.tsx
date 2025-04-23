
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";

interface AddCustomerStepAnimatorProps {
  step: number;
  direction: 'forward' | 'backward';
  children: ReactNode;
}

const variants = {
  enter: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? 300 : -300,
    opacity: 0,
    rotateY: direction === 'forward' ? 45 : -45,
  }),
  center: {
    x: 0,
    opacity: 1,
    rotateY: 0,
  },
  exit: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? -300 : 300,
    opacity: 0,
    rotateY: direction === 'forward' ? -45 : 45,
  }),
};

export function AddCustomerStepAnimator({ step, direction, children }: AddCustomerStepAnimatorProps) {
  return (
    <AnimatePresence custom={direction} mode="wait">
      <motion.div
        key={step}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
          rotateY: { duration: 0.4 }
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
