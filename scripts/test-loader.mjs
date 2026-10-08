import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { resolve as resolvePath, dirname } from 'node:path'
import ts from 'typescript'

const root=resolvePath(fileURLToPath(new URL('../',import.meta.url)))
const appPrismaPath=resolvePath(root,'src/lib/prisma.ts')
const sqlitePrismaUrl=pathToFileURL(resolvePath(root,'tests/support/sqlite-prisma.mjs')).href
function resolvedFile(path) {
  const resolved=resolvePath(path)
  if(process.env.DOKITA_SQLITE_TEST==='1'&&resolved===appPrismaPath)return sqlitePrismaUrl
  return pathToFileURL(resolved).href
}
export async function resolve(specifier,context,nextResolve) {
  if(specifier==='server-only')return {url:'data:text/javascript,export {}',shortCircuit:true}
  if(specifier.startsWith('@/')) {
    const base=resolvePath(root,'src',specifier.slice(2))
    for(const suffix of ['.ts','.tsx','/index.ts','.js'])if(existsSync(base+suffix))return {url:resolvedFile(base+suffix),shortCircuit:true}
  }
  if(specifier.startsWith('.')&&context.parentURL?.startsWith('file:')) {
    const base=resolvePath(dirname(fileURLToPath(context.parentURL)),specifier)
    for(const suffix of ['','.ts','.tsx','.mjs','.js','/index.ts'])if(existsSync(base+suffix)&&!base.endsWith('/'))return {url:resolvedFile(base+suffix),shortCircuit:true}
  }
  const result=await nextResolve(specifier,context)
  if(process.env.DOKITA_SQLITE_TEST==='1'&&result.url===pathToFileURL(appPrismaPath).href)return {url:sqlitePrismaUrl,shortCircuit:true}
  return result
}
export async function load(url,context,nextLoad) {
  if(url.startsWith('file:')&&/\.(ts|tsx)$/.test(url)) {
    const source=await readFile(fileURLToPath(url),'utf8')
    return {format:'module',source:ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,shortCircuit:true}
  }
  return nextLoad(url,context)
}
