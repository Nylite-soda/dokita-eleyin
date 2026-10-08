'use client'
import { useState } from 'react'
import Image from 'next/image'
import { adminRequest } from './api'
interface MediaItem {id:string;filename:string;alt:string;url:string;size:number}
export default function MediaManager({initialMedia,role}:{initialMedia:MediaItem[];role:'admin'|'editor'}) {
  const [media,setMedia]=useState(initialMedia),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('')
  async function upload(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();const form=event.currentTarget;setBusy(true);setError('');setMessage('')
    try{const result=await adminRequest<{media:MediaItem}>('/api/admin/media',{method:'POST',body:new FormData(form)});setMedia(current=>[result.media,...current]);form.reset();setMessage('Image uploaded. It is available in the content editor.')}
    catch(error){setError(error instanceof Error?error.message:'Upload failed.')}finally{setBusy(false)}
  }
  async function remove(id:string) {
    if(!window.confirm('Delete this unused image permanently?'))return
    setBusy(true);setError('');setMessage('')
    try{await adminRequest('/api/admin/media',{method:'DELETE',body:JSON.stringify({id})});setMedia(current=>current.filter(item=>item.id!==id));setMessage('Image deleted.')}
    catch(error){setError(error instanceof Error?error.message:'Delete failed.')}finally{setBusy(false)}
  }
  return <><h1>Media library</h1><p className="admin-muted">Upload images with descriptions, then choose them in your content.</p>{error&&<p className="admin-error" role="alert">{error}</p>}{message&&<p className="admin-notice" role="status">{message}</p>}<form onSubmit={upload} className="admin-panel"><div className="admin-grid"><div className="admin-field"><label htmlFor="media-file">Image file</label><input id="media-file" name="file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" required disabled={busy}/><small>PNG, JPEG, GIF, or WebP. Maximum 5 MB.</small></div><div className="admin-field"><label htmlFor="media-alt">Image description</label><input id="media-alt" name="alt" required maxLength={250} disabled={busy}/><small>Describe the image for people using screen readers.</small></div></div><button className="admin-button" disabled={busy}>{busy?'Uploading…':'Upload image'}</button></form><div className="admin-grid">{media.map(item=><article key={item.id} className="admin-panel"><Image src={item.url} alt={item.alt} width={320} height={220} className="mb-4 h-48 w-full rounded-lg object-contain bg-blue-50" unoptimized/><h2 className="break-all">{item.filename}</h2><p>{item.alt}</p><p className="admin-muted">{Math.round(item.size/1024)} KB</p><div className="admin-actions"><a className="admin-button-secondary" href={item.url} target="_blank" rel="noopener noreferrer">Open image</a>{role==='admin'&&<button className="admin-button-secondary" type="button" disabled={busy} onClick={()=>remove(item.id)}>Delete</button>}</div></article>)}</div>{!media.length&&<p className="admin-panel">No images uploaded yet.</p>}</>
}
