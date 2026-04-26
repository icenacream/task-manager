

const { app, BrowserWindow } = require('electron')
const path = require('path')
const Store = require('electron-store')

const store = new Store()

function createWindow() {
     const savedBounds = store.get('windowBounds', {
          width: 320,
          height: 600,
          x: null,
          y: null
     })

     const win = new BrowserWindow({
          width: savedBounds.width,
          height: savedBounds.height,
          x: savedBounds.x,
          y: savedBounds.y,
          minWidth: 260,
          minHeight: 300,
          resizable: true,
          alwaysOnTop: true,          // stays on top of all windows
          frame: false,               // removes default OS title bar
          transparent: false,
          skipTaskbar: false,
          webPreferences: {
               nodeIntegration: true,
               contextIsolation: false
          }
     })

     win.loadFile('src/index.html')

     // save position and size whenever it changes
     const saveBounds = () => {
          store.set('windowBounds', win.getBounds())
     }

     win.on('resize', saveBounds)
     win.on('move', saveBounds)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
     if (process.platform !== 'darwin') app.quit()
})