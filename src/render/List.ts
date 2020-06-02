import { IRender } from '.'
import { IScheduler, Updater } from '../scheduler'
import { Cursor } from '..'

export type ListItemResolver<T> = (item: T) => IRender | IRender & IScheduler

export interface Keyed {
  key: string | number
}

function fromEntries(entries: [string | number, any][]): { [key: string]: any } {
  const res: { [key: string]: any } = {}
  entries.forEach(item => {
    res[item[0]] = item[1]
  })
  return res
}

export class List<T extends Keyed> extends Updater implements IRender, IScheduler {
  private static defaultListItemResolver: ListItemResolver<any> = (item: any) =>
    <IRender>{
      render(cursor: Cursor) {
        if (typeof item.render === 'function' && item.render.length === 1)
          item.render(cursor)
        else
          cursor.text(item)
      }
    }
  private has_set_window_size: boolean = false
  private window_size: number = this.list.length
  private top_index: number = 0
  //@ts-ignore Key should be either a number or string
  private keys: { [key: number | string]: IRender | IRender & IScheduler } = {}
  private _items = new Proxy(this.list, <ProxyHandler<T[]>>{
    get: (target, key) => {
      //@ts-ignore
      const res = target[key]
      if (typeof res === 'function') {
        const _this = this
        return function proxy(...args: any[]) {
          const preModLength = target.length
          res.apply(target, args)
          if (!_this.has_set_window_size && target.length !== preModLength) {
            _this.window_size = target.length
          }
          _this.postListUpdate()
        }
      }
      return res
    },
    set: (target, key, value): boolean => {
      //@ts-ignore
      const res = target[key]
      if (typeof res === 'function') return Reflect.set(target, key, value)
      const result = Reflect.set(target, key, value)
      if (result && res) {
        if (typeof res.stop === 'function') res.stop()
        //@ts-ignore
        delete this.keys[res.key]
        const listItem = this.listItemResolver(value)
        if (
          typeof (listItem as IScheduler).subscribe === 'function' &&
          typeof (listItem as IScheduler).start === 'function' &&
          typeof (listItem as IScheduler).stop === 'function'
        ) {
          const scheduler = listItem as IScheduler
          scheduler.subscribe(this.updater)
        }
        //@ts-ignore
        this.keys[value.key] = listItem
      }
      return result
    }
  })
  set windowSize(value: number) {
    this.has_set_window_size = true
    this.window_size = value
    this.update()
  }
  get windowSize(): number {
    return this.window_size
  }
  set top(value: number) {
    this.top_index = value
    this.update()
  }
  get top(): number {
    return this.top_index
  }
  get items(): T[] {
    return this._items
  }

  constructor(list: T[])
  constructor(list: T[], listItemResolver: ListItemResolver<T>)
  constructor(private list: T[], private listItemResolver: ListItemResolver<T> = List.defaultListItemResolver) {
    super()
    this.keys = fromEntries(
      list.map(it => {
        const listItem = listItemResolver(it)
        if (
          typeof (listItem as IScheduler).subscribe === 'function' &&
          typeof (listItem as IScheduler).start === 'function' &&
          typeof (listItem as IScheduler).stop === 'function'
        ) {
          const scheduler = listItem as IScheduler
          scheduler.subscribe(this.updater)
        }
        return [it.key, listItem]
      })
    )
  }

  updater = () => {
    this.update()
  }

  render(c: Cursor) {
    const lowestIndex = this.list.length - this.windowSize
    const cappedTop = Math.min(this.top, lowestIndex)
    if (this.windowSize < this.list.length) {
      if (cappedTop <= 0) c.text`----------------\n`
      else c.text`----- More -----\n`
    }
    this.list
      .slice(cappedTop, cappedTop + this.windowSize)
      .map(item => {
        //@ts-ignore
        return this.keys[item.key]
      })
      .forEach(listItem => {
        listItem.render(c)
        c.text`\n`
      })
    if (this.windowSize < this.list.length) {
      if (cappedTop !== lowestIndex) c.text`----- More -----`
      else c.text`----------------`
    }
  }

  start() {
    super.start()
    Object.entries(this.keys).forEach(([_, it]) => {
      if (
        typeof (it as IScheduler).subscribe === 'function' &&
        typeof (it as IScheduler).start === 'function' &&
        typeof (it as IScheduler).stop === 'function'
      ) {
        const scheduler = it as IScheduler
        scheduler.start()
      }
    })
  }

  stop() {
    super.stop()
    Object.entries(this.keys).forEach(([_, it]) => {
      if (
        typeof (it as IScheduler).subscribe === 'function' &&
        typeof (it as IScheduler).start === 'function' &&
        typeof (it as IScheduler).stop === 'function'
      ) {
        const scheduler = it as IScheduler
        scheduler.stop()
      }
    })
  }

  private postListUpdate() {
    const currentKeys = Object.keys(this.keys)
    this.list.forEach(it => {
      //@ts-ignore
      const index = currentKeys.indexOf(it.key)
      if (~index) {
        currentKeys.splice(index, 1)
      } else {
        //@ts-ignore
        const listItem = (this.keys[it.key] = this.listItemResolver(it))
        if (
          typeof (listItem as IScheduler).subscribe === 'function' &&
          typeof (listItem as IScheduler).start === 'function' &&
          typeof (listItem as IScheduler).stop === 'function'
        ) {
          const scheduler = listItem as IScheduler
          scheduler.subscribe(this.updater)
        }
      }
    })
    currentKeys.forEach(key => {
      //@ts-ignore
      const listItem = this.keys[key]
      if (
        typeof (listItem as IScheduler).subscribe === 'function' &&
        typeof (listItem as IScheduler).start === 'function' &&
        typeof (listItem as IScheduler).stop === 'function'
      ) {
        const scheduler = listItem as IScheduler
        scheduler.stop()
      }
      //@ts-ignore
      delete this.keys[key]
    })
  }
}
