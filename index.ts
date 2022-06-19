type F = number
type S = string
type Byte = number

const
  background = [237, 66, 69],
  foreground = [0, 0, 0],
  thresholds = [
    [15, 135, 45, 165],
    [195, 75, 225, 105],
    [60, 180, 30, 150],
    [240, 120, 210, 90]
  ]

// Bayer / "Gameboy"
const dither = (img: ImageData) => {
  const
    d = img.data,
    w = img.width

  for (let i = 0; i <= d.length; i += 4) {
    const
      x = i / 4 % w,
      y = Math.floor(i / 4 / w)
    d[i] = d[i] * 0.21 + d[i + 1] * 0.71 + d[i + 2] * 0.07 // luminance
    const on = ((d[i] + thresholds[x % 4][y % 4]) / 2) < 128;
    [d[i], d[i + 1], d[i + 2]] = on ? foreground : background
  }

  return img
}

const transform = (source: HTMLImageElement): S => {
  const canvas = document.createElement('canvas')
  canvas.width = source.width
  canvas.height = source.height
  const g = canvas.getContext('2d')
  if (!g) return ''
  g.drawImage(source, 0, 0)
  const d = g.getImageData(0, 0, canvas.width, canvas.height)
  g.putImageData(dither(d), 0, 0)
  return canvas.toDataURL('image/png')
}

window.onload = () => {
  const
    source = document.getElementById('source') as HTMLImageElement,
    target = document.getElementById('target') as HTMLImageElement,
    picker = document.getElementById('picker') as HTMLInputElement

  source.onload = () => {
    target.src = transform(source)
    source.style.display = target.style.display = 'inline'
  }
  picker.addEventListener('change', (e: any) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      source.src = e.target?.result as S
    }
    reader.readAsDataURL(e.target.files[0])
  }, false)
}