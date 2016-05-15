# ludumpad-mapper

Map keys to LudumPad input.

Current version has a hardcoded mapping for playing [BOXHEAD]. In future versions you'll be able to edit the key mapping using your controller.

```js
var mappings = [
  { // player 1
    xaxis: { '-1': 'left', '1': 'right' },
    yaxis: { '-1': 'down', '1': 'up' },
    a: { '1': '/' },
    b: { '1': '.' }
  },
  { // player 2
    xaxis: { '-1': 'a', '1': 'd' },
    yaxis: { '-1': 's', '1': 'w' },
    a: { '1': 'space' },
    b: { '1': 'e' }
  }
]
```

## Install

```
npm install -g ludumpad-mapper
```

## Usage

```
➜  ~ ludumpad-mapper
 _              _                 ____           _   __  __
| |   _   _  __| |_   _ _ __ ___ |  _ \ __ _  __| | |  \/  | __ _ _ __  _ __   ___ _ __
| |  | | | |/ _` | | | | '_ ` _ \| |_) / _` |/ _` | | |\/| |/ _` | '_ \| '_ \ / _ \ '__|
| |__| |_| | (_| | |_| | | | | | |  __/ (_| | (_| | | |  | | (_| | |_) | |_) |  __/ |
|_____\__,_|\__,_|\__,_|_| |_| |_|_|   \__,_|\__,_| |_|  |_|\__,_| .__/| .__/ \___|_|
                                                                |_|   |_|
v0.0.0

LudumPad Server listening on http://192.168.1.43:3000

< a QR is rendered on the terminal >
```

## LICENSE

LGPL-3.0 © [David da Silva]

[BOXHEAD]: http://www.crazymonkeygames.com/Boxhead-2Play-Rooms.html
[David da Silva]: http://dasilvacont.in
