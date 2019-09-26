export interface IScheduler {
  subscribe(listener: () => void): void
  start(): void
  stop(): void
}
