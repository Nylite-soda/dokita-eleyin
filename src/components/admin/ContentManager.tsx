'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { CmsDocument } from '@/lib/cms'
import { CMS_DEFINITIONS, getDefinition, getFieldValue, paragraphBlocks, paragraphText, setFieldValue, type CmsField } from '@/lib/cms-definition'
import { adminRequest } from './api'

interface MediaItem { id:string; filename:string; alt:string; url:string; image: Record<string,unknown> }
interface Revision { id:string; status:string; created_at:string }
function documentLabel(document:CmsDocument) { return String(document.data.title||document.data.name||document.data.fullName||document.data.question||document.data.label||getDefinition(document.type)?.singular||document.id) }

export default function ContentManager({ initialDocuments, initialMedia, initialType='article', role }: { initialDocuments:CmsDocument[]; initialMedia:MediaItem[]; initialType?:string; role:'admin'|'editor' }) {
  const [documents,setDocuments] = useState(initialDocuments), [type,setType] = useState(initialType), [selected,setSelected] = useState<CmsDocument|null>(null)
  const [data,setData] = useState<Record<string,unknown>>({}), [jsonFields,setJsonFields] = useState<Record<string,string>>({})
  const [revisions,setRevisions] = useState<Revision[]>([]), [busy,setBusy] = useState(false), [error,setError] = useState(''), [message,setMessage] = useState(''), [creating,setCreating] = useState(false)
  const definition = getDefinition(type) || CMS_DEFINITIONS[0]
  const dirty = selected ? JSON.stringify(data)!==JSON.stringify(selected.data)||Object.keys(jsonFields).length>0 : true
  const availableTypes = CMS_DEFINITIONS.filter(item=>!item.adminOnly||role==='admin')
  const typedDocuments = documents.filter(document=>document.type===type)

  function clearMessages() { setError('');setMessage('') }
  function chooseType(next:string) { setType(next);setSelected(null);setCreating(false);setData({});setJsonFields({});setRevisions([]);clearMessages() }
  async function chooseDocument(document:CmsDocument) {
    setBusy(true);clearMessages()
    try {
      const result=await adminRequest<{document:CmsDocument;revisions:Revision[]}>(`/api/admin/documents/${document.id}`)
      setSelected(result.document);setData(result.document.data);setRevisions(result.revisions);setJsonFields({});setCreating(false)
    }catch(error){setError(error instanceof Error?error.message:'Unable to open document.')}finally{setBusy(false)}
  }
  function newDocument() {setSelected(null);setData({});setJsonFields({});setRevisions([]);setCreating(true);clearMessages()}
  function applyField(field:CmsField,value:unknown) {setData(current=>setFieldValue(current,field.key,value))}
  function parsedData() {
    let output=data
    for(const [key,value] of Object.entries(jsonFields)) {
      try {output=setFieldValue(output,key,value.trim()?JSON.parse(value):undefined)}catch{throw new Error(`${definition.fields.find(field=>field.key===key)?.label||key} must contain valid JSON.`)}
    }
    return output
  }
  function updateLocal(document:CmsDocument|null,id?:string) {
    setDocuments(current=>document?[document,...current.filter(item=>item.id!==document.id)]:current.filter(item=>item.id!==id))
    setSelected(document);setData(document?.data||{});setJsonFields({});setCreating(false)
  }
  async function save(event:React.FormEvent) {
    event.preventDefault();setBusy(true);clearMessages()
    try {
      const result=await adminRequest<{document:CmsDocument}>(selected?`/api/admin/documents/${selected.id}`:'/api/admin/documents',{method:selected?'PATCH':'POST',body:JSON.stringify(selected?{action:'save',data:parsedData(),updatedAt:selected.updatedAt}:{type,data:parsedData()})})
      updateLocal(result.document);setMessage('Draft saved. The live website changes only after publication.')
    }catch(error){setError(error instanceof Error?error.message:'Unable to save document.')}finally{setBusy(false)}
  }
  async function action(name:string,revisionId?:string) {
    if(!selected)return
    if(name==='delete'&&!window.confirm('Delete this document and its history? This cannot be undone.'))return
    setBusy(true);clearMessages()
    try {
      const result=await adminRequest<{document:CmsDocument|null}>(`/api/admin/documents/${selected.id}`,{method:'PATCH',body:JSON.stringify({action:name,updatedAt:selected.updatedAt,revisionId})})
      updateLocal(result.document,selected.id);setMessage(name==='publish'?'Published to the website.':name==='unpublish'?'Removed from the public website.':name==='restore'?'Revision restored to the draft. Review and publish when ready.':'Document deleted.')
      if(result.document) {const refreshed=await adminRequest<{revisions:Revision[]}>(`/api/admin/documents/${selected.id}`);setRevisions(refreshed.revisions)}
    }catch(error){setError(error instanceof Error?error.message:'The action failed.')}finally{setBusy(false)}
  }
  function renderField(field:CmsField) {
    const value=getFieldValue(data,field.key),id=`cms-${field.key.replaceAll('.','-')}`
    const common={id,disabled:busy}
    const input = field.kind==='boolean'?<label className="flex items-center gap-3"><input {...common} type="checkbox" checked={Boolean(value)} onChange={event=>applyField(field,event.target.checked)}/>{field.label}</label>
      :field.kind==='select'?<select {...common} value={String(value||'')} onChange={event=>applyField(field,event.target.value||undefined)}><option value="">Choose…</option>{field.options?.map(option=><option key={option} value={option}>{option}</option>)}</select>
      :field.kind==='reference'?<select {...common} value={value&&typeof value==='object'?String((value as {_ref?:string;_id?:string})._ref||(value as {_id?:string})._id||''):''} onChange={event=>applyField(field,event.target.value?{_type:'reference',_ref:event.target.value}:undefined)}><option value="">No category</option>{documents.filter(item=>item.type==='category').map(category=><option key={category.id} value={category.id}>{documentLabel(category)}</option>)}</select>
      :field.kind==='image'?<><select {...common} value={value&&typeof value==='object'?String((value as {asset?:{_ref?:string}}).asset?._ref||'').replace(/^local-/,''):''} onChange={event=>applyField(field,initialMedia.find(item=>item.id===event.target.value)?.image)}><option value="">{value?'Keep existing asset / choose image':'No image'}</option>{initialMedia.map(item=><option key={item.id} value={item.id}>{item.filename} · {item.alt}</option>)}</select>{Boolean(value)&&<button className="admin-button-secondary self-start" type="button" onClick={()=>applyField(field,undefined)}>Remove image</button>}<small>Upload new images in <Link href="/admin/media" target="_blank">Media</Link>, then reload this page.</small></>
      :field.kind==='images'?<select {...common} multiple size={Math.min(Math.max(initialMedia.length,2),5)} value={Array.isArray(value)?value.map(image=>String(image?.asset?._ref||'').replace(/^local-/,'')):[]} onChange={event=>applyField(field,Array.from(event.target.selectedOptions).map(option=>initialMedia.find(item=>item.id===option.value)?.image).filter(Boolean))}>{initialMedia.map(item=><option key={item.id} value={item.id}>{item.filename}</option>)}</select>
      :field.kind==='json'?<><textarea {...common} value={jsonFields[field.key]??(value===undefined?'':JSON.stringify(value,null,2))} onChange={event=>{setJsonFields(current=>({...current,[field.key]:event.target.value}))}} rows={5}/><small>Enter valid JSON. Existing values remain intact until this field is edited.</small></>
      :field.kind==='richtext'?<><textarea {...common} value={paragraphText(value)} onChange={event=>applyField(field,paragraphBlocks(event.target.value))} rows={10}/><small>Separate paragraphs with a blank line. Editing this field saves plain paragraphs; existing rich formatting stays intact until you edit it.</small></>
      :field.kind==='strings'?<textarea {...common} value={Array.isArray(value)?value.join('\n'):''} onChange={event=>applyField(field,event.target.value.split('\n').map(line=>line.trim()).filter(Boolean))} rows={4}/>
      :field.kind==='textarea'?<textarea {...common} value={String(value||'')} onChange={event=>applyField(field,event.target.value)} rows={4}/>
      :field.kind==='slug'?<div className="flex flex-wrap gap-2"><input {...common} value={value&&typeof value==='object'?String((value as {current?:string}).current||''):''} onChange={event=>applyField(field,{current:event.target.value})}/><button className="admin-button-secondary" type="button" onClick={()=>applyField(field,{current:String(data.title||data.name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')})}>Generate from title</button></div>
      :field.kind==='number'?<input {...common} type="number" min={0} value={value===undefined?'':String(value)} onChange={event=>applyField(field,event.target.value===''?undefined:Number(event.target.value))}/>
      :field.kind==='date'?<input {...common} type="date" value={typeof value==='string'?value.slice(0,10):''} onChange={event=>applyField(field,event.target.value||undefined)}/>
      :<input {...common} type={field.key==='contactEmail'?'email':'text'} value={String(value||'')} maxLength={1000} onChange={event=>applyField(field,event.target.value)}/>
    return <div className="admin-field" key={field.key}>{field.kind!=='boolean'&&<label htmlFor={id}>{field.label}{field.required&&' *'}</label>}{input}{field.kind==='strings'&&<small>One item per line.</small>}</div>
  }
  return <><h1>{definition.label}</h1><p className="admin-muted">Create drafts, review revisions, and publish approved content.</p>{error&&<p role="alert" className="admin-error">{error}</p>}{message&&<p role="status" className="admin-notice">{message}</p>}<div className="admin-editor-grid"><aside className="admin-panel"><div className="admin-field"><label htmlFor="cms-type">Content type</label><select id="cms-type" value={type} onChange={event=>chooseType(event.target.value)}>{availableTypes.map(item=><option key={item.type} value={item.type}>{item.label}</option>)}</select></div><button type="button" className="admin-button" disabled={busy||(definition.singleton&&typedDocuments.length>0)} onClick={newDocument}>New {definition.singular.toLowerCase()}</button><div className="mt-4 space-y-2">{typedDocuments.map(document=><button key={document.id} type="button" className="block w-full rounded-lg border border-blue-100 p-3 text-left hover:bg-blue-50" disabled={busy} aria-pressed={selected?.id===document.id} onClick={()=>chooseDocument(document)}><strong>{documentLabel(document)}</strong><br/><span className="admin-badge">{document.status}</span>{document.publishedData&&JSON.stringify(document.data)!==JSON.stringify(document.publishedData)&&<span className="ml-2 text-xs">unpublished changes</span>}</button>)}{!typedDocuments.length&&<p className="admin-muted">No documents yet.</p>}</div></aside><section className="admin-panel">{selected||creating?<><h2>{selected?documentLabel(selected):`New ${definition.singular.toLowerCase()}`}</h2>{selected&&<Link href={`/admin/preview/${selected.id}`} target="_blank" className="admin-button-secondary mb-4">Preview saved draft ↗</Link>}{selected&&<p className="admin-muted mb-4">{selected.status==='published'?'The approved version is live. Draft edits remain private.':'This draft is private.'}</p>}<form onSubmit={save}>{definition.fields.map(renderField)}<div className="admin-actions"><button className="admin-button" disabled={busy||(!dirty&&!creating)}>{busy?'Working…':'Save draft'}</button>{selected&&dirty&&<span className="admin-muted">Save before publishing or restoring.</span>}</div></form>{selected&&role==='admin'&&<div className="border-t border-blue-100 pt-4"><div className="admin-actions"><button type="button" className="admin-button" onClick={()=>action('publish')} disabled={busy||dirty}>Publish to website</button>{selected.status==='published'&&<button type="button" className="admin-button-secondary" onClick={()=>action('unpublish')} disabled={busy}>Unpublish</button>}<button type="button" className="admin-button-secondary" onClick={()=>action('delete')} disabled={busy}>Delete document</button></div></div>}{selected&&revisions.length>0&&<details className="mt-5"><summary className="cursor-pointer font-semibold">Revision history ({revisions.length})</summary><ul className="mt-3 space-y-2">{revisions.map(revision=><li key={revision.id} className="flex flex-wrap items-center justify-between gap-2"><span>{new Date(revision.created_at).toLocaleString()} · {revision.status}</span><button type="button" className="admin-button-secondary" disabled={busy||dirty} onClick={()=>action('restore',revision.id)}>Restore to draft</button></li>)}</ul></details>}</>:<p className="admin-muted">Choose a document or create a new draft to begin.</p>}</section></div></>
}


