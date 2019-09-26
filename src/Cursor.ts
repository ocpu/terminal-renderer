export class Cursor {
  constructor()
  constructor(stream: NodeJS.WriteStream)
  constructor(private stream: NodeJS.WriteStream = process.stdout) {}

  private command: string = ''

  get hide() {
    this.command += '\x1b[?25l'
    return this
  }

  get show() {
    this.command += '\x1b[?25h'
    return this
  }

  get clearLine() {
    this.command += '\x1b[K'
    return this
  }

  get moveUp() {
    return this.moveVert(1)
  }

  get moveDown() {
    return this.moveVert(-1)
  }

  get moveLeft() {
    return this.moveHori(-1)
  }

  get moveRight() {
    return this.moveHori(1)
  }

  private saving = false
  private saved: { length: number }[] = []
  saveState() {
    this.saving = true
  }

  restoreState() {
    if (!this.saved.length) return
    // console.log([this.saved[this.saved.length - 1]], this.saved[this.saved.length - 1].length)
    this.moveHori(-this.saved[this.saved.length - 1].length)
    for (let i = 0; i < this.saved.length - 1; i++) this.clearLine.moveUp
    this.clearLine.write()
    this.saved = []
    this.saving = false
  }

  moveVert(num: number) {
    // if (num !== 0)
    //   console.log('\n', num < 0 ? 'down' : 'up')
    if (num < 0) this.command += `\x1b[${-num}B`
    if (num > 0) this.command += `\x1b[${num}A`
    return this
  }

  moveHori(num: number) {
    // if (num !== 0)
    //   console.log('\n', num < 0 ? 'left' : 'right')
    if (num < 0) this.command += `\x1b[${-num}D`
    if (num > 0) this.command += `\x1b[${num}C`
    return this
  }

  get reset() {
    this.command += '\x1b[0m'
    return this
  }

  private static parseOption(option: any): string {
    switch (typeof option) {
      case 'string':
      case 'number':
      case 'boolean':
        return '' + option
      case 'object':
        if (option === null) return 'null'
        return Array.isArray(option)
          ? option.map(Cursor.parseOption).join(', ')
          : `[object ${option[Symbol.toStringTag] || 'Object'}]`
      case 'function':
        return '[Function]'
      default:
        return 'undefined'
    }
  }

  private static parseTemplate(templateStrings: TemplateStringsArray, options: any[]) {
    const strings = options.map(Cursor.parseOption) // Changed recently
    return new Array(templateStrings.length + strings.length)
      .fill(null)
      .reduce((acc, _, i) => acc + (i % 2 ? strings[(i / 2) | 0] : templateStrings[(i / 2) | 0]), '')
  }

  private wrap(color: string, str?: string | TemplateStringsArray, ...options: any[]) {
    const message =
      typeof str !== 'undefined'
        ? Array.isArray(str)
          ? Cursor.parseTemplate(str as TemplateStringsArray, options)
          : str
        : void 0
    if (message && this.saving) {
      const lines = message.split('\n')
      if (this.saved.length) {
        this.saved[this.saved.length - 1] += lines.shift()
        if (lines.length) {
          this.saved.push(...lines)
        }
      } else this.saved.push(...lines)
    }
    this.command +=
      (this.stream.isTTY ? color : '') +
      (message ? message : '') +
      (this.stream.isTTY ? (message ? '\x1b[0m' : '') : '')
    return this
  }

  bold(): Cursor
  bold(str: string): Cursor
  bold(str: TemplateStringsArray, ...options: any): Cursor
  bold(str?: string | TemplateStringsArray, ...options: any[]) {
    return this.wrap('\x1b[1m', str, ...options)
  }

  black(): Cursor
  black(str: string): Cursor
  black(str: TemplateStringsArray, ...options: any): Cursor
  black(str?: string | TemplateStringsArray, ...options: any) {
    return this.wrap('\x1b[30m', str, ...options)
  }

  red(): Cursor
  red(str: string): Cursor
  red(str: TemplateStringsArray, ...options: any): Cursor
  red(str?: string | TemplateStringsArray, ...options: any) {
    return this.wrap('\x1b[31m', str, ...options)
  }

  green(): Cursor
  green(str: string): Cursor
  green(str: TemplateStringsArray, ...options: any): Cursor
  green(str?: string | TemplateStringsArray, ...options: any) {
    return this.wrap('\x1b[32m', str, ...options)
  }

  yellow(): Cursor
  yellow(str: string): Cursor
  yellow(str: TemplateStringsArray, ...options: any): Cursor
  yellow(str?: string | TemplateStringsArray, ...options: any) {
    return this.wrap('\x1b[33m', str, ...options)
  }

  blue(): Cursor
  blue(str: string): Cursor
  blue(str: TemplateStringsArray, ...options: any): Cursor
  blue(str?: string | TemplateStringsArray, ...options: any) {
    return this.wrap('\x1b[34m', str, ...options)
  }

  magenta(): Cursor
  magenta(str: string): Cursor
  magenta(str: TemplateStringsArray, ...options: any): Cursor
  magenta(str?: string | TemplateStringsArray, ...options: any) {
    return this.wrap('\x1b[35m', str, ...options)
  }

  cyan(): Cursor
  cyan(str: string): Cursor
  cyan(str: TemplateStringsArray, ...options: any): Cursor
  cyan(str?: string | TemplateStringsArray, ...options: any) {
    return this.wrap('\x1b[36m', str, ...options)
  }

  lightGray(): Cursor
  lightGray(str: string): Cursor
  lightGray(str: TemplateStringsArray, ...options: any): Cursor
  lightGray(str?: string | TemplateStringsArray, ...options: any) {
    return this.wrap('\x1b[37m', str, ...options)
  }

  gray(): Cursor
  gray(str: string): Cursor
  gray(str: TemplateStringsArray, ...options: any): Cursor
  gray(str?: string | TemplateStringsArray, ...options: any) {
    return this.wrap('\x1b[90m', str, ...options)
  }

  brightRed(): Cursor
  brightRed(str: string): Cursor
  brightRed(str: TemplateStringsArray, ...options: any): Cursor
  brightRed(str?: string | TemplateStringsArray, ...options: any) {
    return this.wrap('\x1b[91m', str, ...options)
  }

  brightGreen(): Cursor
  brightGreen(str: string): Cursor
  brightGreen(str: TemplateStringsArray, ...options: any): Cursor
  brightGreen(str?: string | TemplateStringsArray, ...options: any) {
    return this.wrap('\x1b[92m', str, ...options)
  }

  brightYellow(): Cursor
  brightYellow(str: string): Cursor
  brightYellow(str: TemplateStringsArray, ...options: any): Cursor
  brightYellow(str?: string | TemplateStringsArray, ...options: any) {
    return this.wrap('\x1b[93m', str, ...options)
  }

  lightBlue(): Cursor
  lightBlue(str: string): Cursor
  lightBlue(str: TemplateStringsArray, ...options: any): Cursor
  lightBlue(str?: string | TemplateStringsArray, ...options: any) {
    return this.wrap('\x1b[94m', str, ...options)
  }

  pink(): Cursor
  pink(str: string): Cursor
  pink(str: TemplateStringsArray, ...options: any): Cursor
  pink(str?: string | TemplateStringsArray, ...options: any) {
    return this.wrap('\x1b[95m', str, ...options)
  }

  brightCyan(): Cursor
  brightCyan(str: string): Cursor
  brightCyan(str: TemplateStringsArray, ...options: any): Cursor
  brightCyan(str?: string | TemplateStringsArray, ...options: any) {
    return this.wrap('\x1b[96m', str, ...options)
  }

  white(): Cursor
  white(str: string): Cursor
  white(str: TemplateStringsArray, ...options: any): Cursor
  white(str?: string | TemplateStringsArray, ...options: any) {
    return this.wrap('\x1b[97m', str, ...options)
  }

  text(str: string): Cursor
  text(str: TemplateStringsArray, ...options: any): Cursor
  text(str: string | TemplateStringsArray, ...options: any[]) {
    const message = Array.isArray(str) ? Cursor.parseTemplate(str as TemplateStringsArray, options) : str
    if (message && this.saving) {
      const lines = message.split('\n')
      if (this.saved.length) {
        this.saved[this.saved.length - 1] += lines.shift()
        if (lines.length) {
          this.saved.push(...lines)
        }
      } else this.saved.push(...lines)
    }
    this.command += message
    return this
  }

  write() {
    // console.log([this.command])
    this.stream.write(this.toString())
  }

  writeln() {
    // console.log([this.command + '\n'])
    this.stream.write(this.toString() + '\n')
  }

  toString() {
    const c = this.command
    this.command = ''
    // if (this.saving) {
    //   this.saved.push(...c.split('\n'))
    // }
    return c
  }
}
