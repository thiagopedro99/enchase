import { globalStylesCss } from './css/global.ts'

export const GlobalStyles = () => <style>{globalStylesCss}</style>

export const ThemeVariables = ({ css }: { css: string }) => <style>{css}</style>
