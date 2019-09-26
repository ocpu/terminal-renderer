import { IRender } from '.'
import { IScheduler, Interval } from '../sheduler'
import { Cursor } from '..'

export class Spinner extends Interval implements IRender, IScheduler {
  private static defaultSteps: string[] = ['⣷', '⣯', '⣟', '⡿', '⢿', '⣻', '⣽', '⣾']
  private steps: string[]
  private step: number = 0

  constructor()
  constructor(interval: number)
  constructor(steps: string[])
  constructor(steps: string[], interval: number)
  constructor(steps?: string[] | number, interval: number = 0.2) {
    super(typeof steps === 'number' ? steps : interval)
    this.steps = Array.isArray(steps) ? steps : Spinner.defaultSteps
  }

  render(cursor: Cursor) {
    cursor.green`${this.steps[this.step]} `
  }

  protected tick() {
    this.step = (this.step + 1) % this.steps.length
  }
}
