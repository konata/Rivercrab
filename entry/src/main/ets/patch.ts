import { hilog } from "@kit.PerformanceAnalysisKit";

export function bark(msg: string) {
  hilog.info(0, "natsuki", msg);
}

export async function defer(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function defers(ms: number) {
  let count = 0
  while (count < ms) {
    await new Promise(_ => setTimeout(_, 1000))
    bark(`wait for ${count}`)
    count += 1000
  }
}

export async function catching(fn: () => Promise<void>) {
  try {
    await fn()
  } catch (e) {
    bark(`catching[e]: ${e}`)
  }
}

export function defaults<T>(fn: () => T, defaultsTo: T) {
  try {
    return fn()
  } catch (e) {
    bark(`defaults[e]: ${e}`)
    return defaultsTo
  }
}

