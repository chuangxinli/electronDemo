import {app, BrowserWindow} from 'electron'

import store from '../renderer/store'

console.log(store.state.reportData.savePath)

store.dispatch('GET_APP_PATH', {appPath: app.getAppPath()})

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.webContents.openDevTools()

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  require('./app')

  /*const { execFile } = require('child_process');
   const child = execFile('exe/wkhtmltopdf.exe', ['http://www.baidu.com', 'F:/test/1.pdf'], (error, stdout, stderr) => {
   if (error) {
   throw error;
   }
   console.log(stdout);
   });*/

}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})


/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
 import { autoUpdater } from 'electron-updater'

 autoUpdater.on('update-downloaded', () => {
 autoUpdater.quitAndInstall()
 })

 app.on('ready', () => {
 if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
 })
 */
