export const MODEL_HEAVY = '@cf/meta/llama-3.3-70b-instruct-fp8-fast'
export const MODEL_FAST = '@cf/meta/llama-3.1-8b-instruct-fast'
export const MODEL_LOGIC = '@cf/qwen/qwq-32b'

export type AIModelType = typeof MODEL_HEAVY | typeof MODEL_FAST | typeof MODEL_LOGIC
