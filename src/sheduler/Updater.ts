import { IScheduler } from './'

export class Updater implements IScheduler {
  private subscribers: Set<Function> = new Set()
  private shouldUpdate: boolean = false

  subscribe(listener: () => void): void {
    this.subscribers.add(listener)
  }

  start(): void {
    this.shouldUpdate = true
  }

  stop(): void {
    this.shouldUpdate = false
  }

  update() {
    if (this.shouldUpdate) this.subscribers.forEach(sub => sub())
  }
}
