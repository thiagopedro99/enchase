import type { Plugin } from 'postcss'

export class CascadeLadderError extends Error {}

export type Specificity = [number, number, number]

export function specificityOf(selector: string): Specificity
export function ladderValue(b: number, c: number): number
export function ladderSelector(selector: string): string
export function ladderProblems(css: string): string[]

declare const cascadeLadder: (() => Plugin) & { postcss: true }

export default cascadeLadder
