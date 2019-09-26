import { IRender } from './render'
import { IScheduler } from './sheduler'
import { Cursor, RenderGroup } from './'

export class Renderer {
  private root: RenderGroup = new RenderGroup()

  constructor()
  constructor(cursor: Cursor)
  constructor(private _cursor: Cursor = new Cursor()) {
    _cursor.saveState()
    this.root.subscribe(() => {
      _cursor.restoreState()
      _cursor.saveState()
      this.root.render(_cursor)
      _cursor.write()
    })
  }

  get cursor(): Cursor {
    return this._cursor
  }

  add(scheduler: IScheduler): void
  add(item: IRender): void
  add(itemWithScheduler: IRender & IScheduler): void
  add(item: IRender | IScheduler | IRender & IScheduler): void {
    //@ts-ignore
    this.root.add(item)
  }

  addAll(...items: (IRender | IScheduler | IRender & IScheduler)[]): void {
    //@ts-ignore
    this.root.addAll(...items)
  }

  start() {
    this.root.start()
    this.root.render(this._cursor)
  }

  clear() {
    this._cursor.restoreState()
  }

  stop() {
    this.root.stop()
  }

  close(message?: string) {
    this.stop()
    this.clear()
    this._cursor.text(message || '').writeln()
  }
}
