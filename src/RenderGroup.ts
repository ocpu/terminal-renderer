import { IRender } from './render'
import { IScheduler } from './scheduler'
import { Cursor } from './'

export class RenderGroup implements IRender, IScheduler {
  private schedulers: IScheduler[] = []
  private renderers: IRender[] = []
  private subscribers: Set<Function> = new Set()
  private shouldUpdate: boolean = false

  render(cursor: Cursor): void {
    this.renderers.forEach(it => it.render(cursor))
  }

  subscribe(listener: () => void): void {
    this.subscribers.add(listener)
  }

  start(): void {
    this.schedulers.forEach(scheduler => {
      scheduler.start()
    })
  }

  stop(): void {
    this.schedulers.forEach(scheduler => {
      scheduler.stop()
    })
  }

  invalidate = async () => {
    if (!this.shouldUpdate) {
      this.shouldUpdate = true
      this.shouldUpdate = await false
      this.subscribers.forEach(sub => sub())
    }
  }

  add(scheduler: IScheduler): void
  add(item: IRender): void
  add(itemWithScheduler: IRender & IScheduler): void
  add(item: IRender | IScheduler | IRender & IScheduler): void {
    if (typeof (item as IRender).render === 'function') this.renderers.push(item as IRender)

    if (
      typeof (item as IScheduler).subscribe === 'function' &&
      typeof (item as IScheduler).start === 'function' &&
      typeof (item as IScheduler).stop === 'function'
    ) {
      const scheduler = item as IScheduler
      scheduler.subscribe(this.invalidate)
      this.schedulers.push(scheduler)
    }
  }

  addAll(...items: (IRender | IScheduler | IRender & IScheduler)[]): void {
    for (const item of items) {
      //@ts-ignore
      this.add(item)
    }
  }

  remove(scheduler: IScheduler): void
  remove(renderer: IRender): void
  remove(item: IRender & IScheduler): void
  remove(item: IRender | IScheduler | IRender & IScheduler): void {
    scheduler: {
      const index = this.schedulers.indexOf(item as IScheduler)
      if (index === -1)
        break scheduler
      this.schedulers.splice(index, 1)
    }
    renderer: {
      const index = this.renderers.indexOf(item as IRender)
      if (index === -1)
        break renderer
      this.renderers.splice(index, 1)
    }
  }

  removeAll(...items: (IRender | IScheduler | IRender & IScheduler)[]): void {
    for (const item of items) {
      //@ts-ignore
      this.remove(item)
    }
  }
}
