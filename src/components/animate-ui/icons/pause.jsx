'use client';;
import * as React from 'react';
import { motion } from 'motion/react';

import { getVariants, useAnimateIconContext, IconWrapper } from '@animate-ui/react/icons';

const animations = {
  default: {
    rect1: {
      initial: {
        x: 0,
      },
      animate: {
        x: 1.5,
        transition: {
          duration: 0.3,
          ease: 'easeInOut',
        },
      },
    },

    rect2: {
      initial: {
        x: 0,
      },
      animate: {
        x: -1.5,
        transition: {
          duration: 0.3,
          ease: 'easeInOut',
        },
      },
    }
  },

  'default-loop': {
    rect1: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, 1.5, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },

    rect2: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, -1.5, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    }
  }
};

function IconComponent({
  size,
  ...props
}) {
  const { controls } = useAnimateIconContext();
  const variants = getVariants(animations);

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <motion.rect
        x={14}
        y={4}
        width={4}
        height={16}
        rx={1}
        variants={variants.rect1}
        initial="initial"
        animate={controls}
      />
      <motion.rect
        x={6}
        y={4}
        width={4}
        height={16}
        rx={1}
        variants={variants.rect2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Pause(props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export { animations, Pause, Pause as PauseIcon };
