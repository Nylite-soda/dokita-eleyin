/** Escape spreadsheet formulas as well as quotes and line breaks in user input. */
export function csvResponse(filename:string,headers:string[],rows:unknown[][]) {
  function cell(value:unknown) {let text=value==null?'':String(value);if(/^[=+@\-\t\r]/.test(text))text=`'${text}`;return `"${text.replaceAll('"','""')}"`}
  const body='\uFEFF'+[headers,...rows].map(row=>row.map(cell).join(',')).join('\r\n')
  return new Response(body,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="${filename}"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}})
}
