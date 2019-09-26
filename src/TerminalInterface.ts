import { Key, emitKeypressEvents } from 'readline'
import { Cursor } from './'

export class TerminalInterface {
  private co!: Cursor
  private listeners: { [event: string]: Function[] } = {}
  private closed = false

  constructor(private output: NodeJS.WriteStream = process.stdout, private input: NodeJS.ReadStream = process.stdin) {
    this.co = new Cursor(output)
    emitKeypressEvents(input)
    input.on('keypress', this.keyHandler)
    output.on('resize', this.resizeHandler)
    this.setRawMode(true)
  }

  private emit(event: string): boolean
  private emit(event: string, value: any): boolean
  private emit(event: string, value?: any) {
    if (event in this.listeners) for (const listener of this.listeners[event]) listener(value)
    return event in this.listeners && !!this.listeners[event].length
  }

  private setRawMode(mode: boolean) {
    if (typeof this.input.setRawMode === 'function') {
      this.input.setRawMode(mode)
    }
  }

  private resizeHandler = () => {
    this.emit('resize')
  }

  private keyHandler = (str: string, key: Key) => {
    if (this.closed) return
    switch (key.name) {
      case 'return':
      case 'backspace':
      case 'delete':
      case 'space':
      case 'left':
      case 'right':
      case 'home':
      case 'end':
      case 'pageup':
      case 'pagedown':
      case 'up':
      case 'down':
        if (key.name in this.listeners) {
          this.emit(key.name, key)
          if (this.closed) return
          break
        }
        // //@ts-ignore
        // if (!key.str)
        //   //@ts-ignore
        //   key.str = key.name
        break
      case 'w':
        if (key.ctrl && !key.shift && !key.meta && key.sequence === '\u0017' && 'backspace' in this.listeners) {
          this.emit('backspace', {
            sequence: '\u0017',
            str: '\u0017',
            name: 'backspace',
            ctrl: true,
            shift: false,
            meta: false
          })
          if (this.closed) return
          break
        }
      case 'd':
        if (!key.ctrl && key.shift && key.meta && key.sequence === '\u001bD' && 'delete' in this.listeners) {
          this.emit('delete', {
            sequence: '\u001b[3~',
            code: '[3~',
            name: 'delete',
            ctrl: true,
            shift: false,
            meta: false
          })
          if (this.closed) return
          break
        }
      case 'c':
        if (key.ctrl && !key.shift && !key.meta && key.sequence === '\u0003' && 'SIGINT' in this.listeners) {
          this.emit('SIGINT', key)
          if (this.closed) return
          break
        }
      // fallthrough
      default:
        this.emit('key', Object.assign({}, key, { str }))
        if (this.closed) return
    }
    this.emit('any', Object.assign({}, key, { str }))
  }

  get cursor() {
    return this.co
  }

  on(event: 'resize', listener: () => void): TerminalInterface
  on(event: 'SIGINT', listener: (key: Key) => void): TerminalInterface
  on(event: 'return', listener: (key: Key) => void): TerminalInterface
  on(event: 'backspace', listener: (key: Key) => void): TerminalInterface
  on(event: 'delete', listener: (key: Key) => void): TerminalInterface
  on(event: 'space', listener: (key: Key) => void): TerminalInterface
  on(event: 'left', listener: (key: Key) => void): TerminalInterface
  on(event: 'right', listener: (key: Key) => void): TerminalInterface
  on(event: 'up', listener: (key: Key) => void): TerminalInterface
  on(event: 'down', listener: (key: Key) => void): TerminalInterface
  on(event: 'home', listener: (key: Key) => void): TerminalInterface
  on(event: 'end', listener: (key: Key) => void): TerminalInterface
  on(event: 'pageup', listener: (key: Key) => void): TerminalInterface
  on(event: 'pagedown', listener: (key: Key) => void): TerminalInterface
  on(event: 'any', listener: (key: Key & { str: string }) => void): TerminalInterface
  on(event: 'key', listener: (key: Key & { str: string }) => void): TerminalInterface
  on(event: string, listener: Function): TerminalInterface {
    this.listeners[event] = this.listeners[event] || []
    this.listeners[event].push(listener)
    return this
  }

  close() {
    this.closed = true
    this.input.removeAllListeners('keypress')
    this.output.removeListener('resize', this.resizeHandler)
    this.setRawMode(false)
  }
}
