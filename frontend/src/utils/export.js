import { exportData } from '../data/db'

export async function downloadExport() {
  const data = await exportData()
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mosaic-export-${new Date().toISOString()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
