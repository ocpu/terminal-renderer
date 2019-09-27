# Terminal Renderer

A command line renderer that updates asynchronusly from the work that is done.

![A illustrasion of a working example](media/example.gif)

```js
const { Renderer, Spinner, Message } = require('terminal-renderer')

let counter = 0

const renderer = new Renderer()
const message = new Message('Counter: ' + counter)

renderer.add(new Spinner(.1))
renderer.add(message)

const counterId = setInterval(() => {
  counter++
  message.message = 'Counter: ' + counter
}, 1000)

renderer.start()

setTimeout(() => {
  clearInterval(counterId)
  renderer.close('Counter: Done!')
}, 21 * 1000)
```

## Builtin component list

- Spinner
- Progress Bar
- Generic Message
- List
- Task Stepper
