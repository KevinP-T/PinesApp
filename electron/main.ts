import { app, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'


const require = createRequire(import.meta.url)
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
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    frame: false,
    transparent: true,
    minHeight: 980,
    minWidth: 1600,
    height: 980,
    width: 1600,
    center: true,
    show: false
  })

  win.once('ready-to-show', () => {
    win?.show()
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
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
    setTimeout(() => autoUpdater.checkForUpdatesAndNotify(), 3000)
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
autoUpdater.on('checking-for-update', () => {
  win?.webContents.send('update-status', 'Buscando actualizaciones...')
})

autoUpdater.on('update-available', (info) => {
  win?.webContents.send('update-status', `Nueva versión ${info.version} disponible, descargando...`)
})

autoUpdater.on('update-not-available', () => {
  win?.webContents.send('update-status', 'La app está al día')
})

autoUpdater.on('update-downloaded', () => {
  win?.webContents.send('update-status', 'Actualización lista, reiniciando...')
  // Reinicia e instala automáticamente
  autoUpdater.quitAndInstall()
})

autoUpdater.on('error', (err) => {
  win?.webContents.send('update-status', `Error: ${err.message}`)
})
//--------------
