# TEA5767
TEA5767 API for pi

## install & use

```bash
$ npm install tea5767
```

```js
let tea5767 = require("tea5767");
```

## setAddress

```js
tea5767.setAddress(addr = 0x60)
```
- `addr` : `Int`

## getFrequency

```js
tea5767.getFrequency()
```

Return current frequency.

## setFrequency

```js
tea5767.setFrequency(freq, mute = false)
```

- `freq` : `Float` frequency, 87.5 ~ 108
- `mute` : `Boolean`

## mute

```js
tea5767.mute(bool = false)
```

- `bool` : `Boolean`

## autoSearch

```js
autoSearch(freq = 87.5, dir = 1)
```

- `freq` : `Float` frequency, 87.5 ~ 108
- `dir` : `Int` direction

This fn supports circular search.

```js
tea5767.autoSearch(100).then(freq => {
	tea5767.setFrequency(freq);
	freq = tea5767.getFrequency();
});
```