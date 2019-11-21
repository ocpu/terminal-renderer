import { IRender } from '.'
import { IScheduler, Updater } from '../scheduler'
import { Cursor } from '..'

type ProgressBarOptions = { pattern: string; emptyPattern: string; length: number; prefix: string; suffix: string }

export class ProgressBar extends Updater implements IRender, IScheduler {
  private static defaultOptions: ProgressBarOptions = {
    pattern: '#',
    emptyPattern: ' ',
    length: 16,
    prefix: '[',
    suffix: ']'
  }
  private _progress: number = -1
  private options!: ProgressBarOptions
  private text: string = ''
  constructor(progress: number = 0, options?: Partial<ProgressBarOptions>) {
    super()
    this.options = Object.assign({}, ProgressBar.defaultOptions, options)
    this.progress = progress
  }
  get progress(): number {
    return this._progress
  }
  set progress(value: number) {
    const clamped = Math.max(Math.min(value, 1), 0)
    const isNew = this._progress !== clamped
    if (!isNew) return
    this._progress = clamped
    const l = Math.ceil(this.options.length * this.progress)
    const bar = this.options.pattern.repeat(Math.ceil(l / this.options.pattern.length)).substring(0, l)
    const sl = this.options.length - l
    const space = this.options.emptyPattern.repeat(Math.ceil(sl / this.options.emptyPattern.length)).substring(0, sl)
    this.text = this.options.prefix + bar + space + this.options.suffix
    this.update()
  }

  render(cursor: Cursor): void {
    cursor.text(this.text)
  }
}
