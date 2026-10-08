import type { MotionOverride, RecipeName } from './motionTypes.ts'

export const useMotionRecipe = (name: RecipeName, override?: MotionOverride) => (override === false ? {} : name === 'press' ? { whileTap: { scale: 0.97 } } : { whileHover: { y: -2 } })
