import { app, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import { migrateTemplateV1toV2, loadTemplatesSafe, saveTemplatesSafe } from '../src/lib/migration.js'


const templatesPath = path.join(app.getPath('userData'), 'templates.json')
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'PinitIcon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
    frame: false,
    minHeight: 980,
    minWidth: 1600,
    height: 980,
    width: 1600,
    center: true,
    show: true,  // mostrá directo
    backgroundColor: '#141414',
  })

  win.once('ready-to-show', () => {
    win?.show()
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })
  console.log('RENDERER_DIST:', RENDERER_DIST)
  console.log('__dirname:', __dirname)
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  //win.webContents.openDevTools()
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()

  if (app.isPackaged) {
    autoUpdater.autoDownload = false
    setTimeout(() => autoUpdater.checkForUpdates(), 3000)
  }
})

// ===== IPC =====

ipcMain.on('window:minimize', () => {
  if (win !== null) {
    win.minimize()
  }
})

ipcMain.on('window:close', () => {
  if (win !== null) {
    win.close()
  }
})

ipcMain.on('window:toggle-maximize', () => {
  if (win !== null) {
    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  }

})

log.transports.file.level = 'info'
autoUpdater.logger = log

//UPDATE
// Eventos del updater

// El renderer avisa cuando el usuario aceptó la actualización para que el
// instalado post-descarga no dependa de que el modal siga montado.
let userAcceptedUpdate = false

autoUpdater.on('update-available', (info) => {
  win?.webContents.send('update-available', info.version)
})

autoUpdater.on('download-progress', (progress) => {
  win?.webContents.send('update-progress', Math.round(progress.percent))
})

autoUpdater.on('update-not-available', () => {
  win?.webContents.send('update-status', 'La app está al día')
})

autoUpdater.on('update-downloaded', () => {
  // Si el usuario aceptó, instalamos de inmediato aunque el modal se haya cerrado.
  if (userAcceptedUpdate) {
    autoUpdater.quitAndInstall()
  } else {
    win?.webContents.send('update-downloaded')
  }
})

ipcMain.on('update:user-accepted', () => {
  userAcceptedUpdate = true
})

ipcMain.on('update:start-download', () => {
  autoUpdater.downloadUpdate()
})

ipcMain.on('update:install', () => {
  autoUpdater.quitAndInstall()
})

autoUpdater.on('error', (err) => {
  log.error('Auto-update error:', err)
  win?.webContents.send('update-status', `Error: ${err.message}`)
})
//--------------


ipcMain.handle('templates:list', () => {
  try {
    const raw = fs.existsSync(templatesPath) ? fs.readFileSync(templatesPath, 'utf-8') : null
    const bak = fs.existsSync(templatesPath + '.bak') ? fs.readFileSync(templatesPath + '.bak', 'utf-8') : null
    const arr = loadTemplatesSafe(raw, () => bak)
    return arr
  } catch (e) {
    log.warn('templates:list falló', e)
    return []
  }
})

ipcMain.handle('templates:save', (_, data) => {
  try {
    if (fs.existsSync(templatesPath)) {
      fs.copyFileSync(templatesPath, templatesPath + '.bak')
    }
    const tmp = templatesPath + '.tmp'
    fs.writeFileSync(tmp, JSON.stringify(data), 'utf-8')
    fs.renameSync(tmp, templatesPath)
    return true
  } catch (e) {
    log.warn('templates:save falló', e)
    return false
  }
})