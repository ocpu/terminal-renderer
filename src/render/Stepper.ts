import { IRender } from './IRender'
import { Updater, IScheduler } from '../sheduler'
import { Cursor } from '../Cursor'

export class Stepper extends Updater implements IRender, IScheduler {
  private text: string
  constructor(steps: number)
  constructor(steps: number, step: number)
  constructor(private steps: number, private _step: number = 0) {
    super()
    this.text = `(${_step}/${steps}) `
  }

  get step(): number {
    return this._step
  }

  set step(step: number) {
    const clamped = Math.max(Math.min(step, this.steps), 0)
    if (this._step === clamped) return
    this._step = clamped
    this.text = `(${clamped}/${this.steps}) `
    this.update()
  }

  render(cursor: Cursor) {
    cursor.text(this.text)
  }
}
