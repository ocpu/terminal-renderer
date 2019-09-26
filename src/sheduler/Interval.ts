import { IScheduler } from './'

export class Interval implements IScheduler {
  private subscribers: Set<Function> = new Set()
  private timeoutId: NodeJS.Timeout | null = null

  constructor(private interval: number) {}

  subscribe(listener: () => void) {
    this.subscribers.add(listener)
  }

  protected tick() {}

  start() {
    if (this.timeoutId) clearTimeout(this.timeoutId)
    this.timeoutId = setInterval(() => {
      this.tick()
      this.subscribers.forEach(subscriber => subscriber())
    }, 1000 * this.interval)
  }

  stop() {
    if (this.timeoutId) clearInterval(this.timeoutId)
  }
}
