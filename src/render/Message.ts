import { IRender } from '.'
import { IScheduler, Updater } from '../sheduler'
import { Cursor } from '..'

export class Message extends Updater implements IRender, IScheduler {
  constructor()
  constructor(message: string)
  constructor(private _message: string = '') {
    super()
  }

  get message(): string {
    return this._message
  }

  set message(value: string) {
    const isNew = this._message !== value
    if (!isNew) return
    this._message = value
    this.update()
  }

  render(cursor: Cursor) {
    cursor.text(this.message)
  }
}
