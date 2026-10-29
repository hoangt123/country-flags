// Minimal typings for the File System Access API (Chrome/Edge) not yet in lib.dom.
interface FilePickerAcceptType {
  description?: string
  accept: Record<string, string[]>
}
interface FilePickerOptions {
  types?: FilePickerAcceptType[]
  suggestedName?: string
  id?: string
  excludeAcceptAllOption?: boolean
}
interface FileSystemHandle {
  queryPermission?(descriptor: { mode: 'read' | 'readwrite' }): Promise<PermissionState>
  requestPermission?(descriptor: { mode: 'read' | 'readwrite' }): Promise<PermissionState>
}
interface Window {
  showSaveFilePicker?(options?: FilePickerOptions): Promise<FileSystemFileHandle>
  showOpenFilePicker?(options?: FilePickerOptions & { multiple?: boolean }): Promise<FileSystemFileHandle[]>
}
