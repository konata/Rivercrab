import { hilog } from "@kit.PerformanceAnalysisKit";

export function bark(msg: string) {
  hilog.info(0, "natsuki", msg);
}

export async function defer(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function catching(fn: () => void) {
  try {
    fn()
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

