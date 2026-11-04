// Next 16 при output: "export" кладёт RSC-файлы предзагрузки в папки (__next.flats/__PAGE__.txt),
// а клиент запрашивает их плоским именем (__next.flats.__PAGE__.txt). Копируем под ожидаемое имя.
import { readdirSync, copyFileSync } from 'node:fs'
import { join } from 'node:path'

function filesIn(dir, prefix = '') {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? filesIn(join(dir, e.name), `${prefix}${e.name}.`) : [[join(dir, e.name), prefix + e.name]],
  )
}

function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue
    const path = join(dir, e.name)
    if (e.name.startsWith('__next.')) {
      for (const [src, flat] of filesIn(path)) copyFileSync(src, join(dir, `${e.name}.${flat}`))
    } else walk(path)
  }
}

walk('out')
