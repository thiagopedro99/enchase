import type { HTMLAttributes, Ref } from 'react'

export type VisuallyHiddenProps = HTMLAttributes<HTMLSpanElement> & { ref?: Ref<HTMLSpanElement> | undefined }
