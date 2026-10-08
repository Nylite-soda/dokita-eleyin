import { writeFile } from 'node:fs/promises'

const response=await fetch('https://fonts.googleapis.com/css2?family=Fredoka:wght@400..700&display=swap',{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'}})
if(!response.ok)throw new Error('Font stylesheet download failed')
const css=await response.text()
for(const [section,file] of [['latin','Fredoka-Latin.woff2'],['latin-ext','Fredoka-LatinExt.woff2']]) {
  const marker=`/* ${section} */`
  if(css.lastIndexOf(marker)<0){if(section==='latin-ext')continue;await writeFile('test-results/font-response.txt',css);throw new Error('Font stylesheet did not include its Latin subset')}
  const chunk=css.slice(css.lastIndexOf(marker)).split('}')[0]
  const source=chunk.match(/src:\s*url\(([^)]+)\)/)?.[1]
  if(!source || !source.startsWith('https://fonts.gstatic.com/'))throw new Error('Unexpected font resource')
  const font=await fetch(source)
  if(!font.ok)throw new Error('Font download failed')
  await writeFile(`public/fonts/${file}`,Buffer.from(await font.arrayBuffer()))
}
const license=await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/fredoka/OFL.txt')
if(!license.ok)throw new Error('Font license download failed')
await writeFile('public/fonts/Fredoka-LICENSE.txt',await license.text())
console.log('Fredoka variable fonts and license saved for local hosting.')
