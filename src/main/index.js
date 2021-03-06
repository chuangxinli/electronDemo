import {app, BrowserWindow, ipcMain} from 'electron'

const {autoUpdater} = require('electron-updater')

import global from '../renderer/global'

import store from '../renderer/store'

console.log('savePath:', store.state.reportData.savePath)
const dataPath = store.state.reportData.dataPath

store.dispatch('GET_APP_PATH', {appPath: app.getAppPath()})
console.log('app.getAppPath:', app.getAppPath())
console.log(app.getVersion()) //electron的版本

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

console.log('--------------------')
console.log(process.env.NODE_ENV)
console.log('--------------------')
console.log(app.getName())

let mainWindow, isClose = false
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9081`
  : `file://${__dirname}/index.html`

//只能打开一个窗口
const isSecondInstance = app.makeSingleInstance(() => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

if (isSecondInstance) {
  app.quit()
}

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 680,
    useContentSize: true,
    width: 1400,
    webPreferences: {webSecurity: false},
    minWidth: 1400,
    minHeight: 680
  })
  setTimeout(() => {
    mainWindow.maximize()
  }, 2000)
  //调试的时候用
  //mainWindow.webContents.openDevTools()

  mainWindow.loadURL(winURL)
  mainWindow.on('close', (e) => {
    if(!isClose){
      e.preventDefault()
      mainWindow.webContents.send('close', 'close')
    }
  })
  mainWindow.on('closed', () => {
    isClose = false
    mainWindow = null
  })

  //清空生成报告时临时所需的html和img
  console.log('+++++++++++++++++')
  console.log(dataPath)
  if(dataPath){

    global.delTemp(dataPath)
  }
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

ipcMain.on('master-close', () => {
  isClose = true
  mainWindow.close()
});

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

const uploadUrl = `http://download-emingren-com.oss-cn-hangzhou.aliyuncs.com/reportDownTool/win`; // 更新包位置

// 主进程监听渲染进程传来的信息（这里我是手动检查更新，可以在 electron的 ready 事件完成后触发）
// 会重复触发（这里我暂时不做这些逻辑了）
ipcMain.on('update', (e, arg) => {
  console.log("update");
  updateHandle();
});

// 检测更新，在你想要检查更新的时候执行，renderer事件触发后的操作自行编写
function updateHandle() {
  let message = {
    error: '检查更新出错',
    checking: '正在检查更新……',
    updateAva: '检测到新版本，正在下载……',
    updateNotAva: '现在使用的就是最新版本，不用更新',
  };
  // 这里的URL就是更新服务器的放置文件的地址
  autoUpdater.setFeedURL(uploadUrl);
  autoUpdater.on('error', function (error) {
    sendUpdateMessage(message.error)
  });
  autoUpdater.on('checking-for-update', function () {
    sendUpdateMessage(message.checking)
  });
  autoUpdater.on('update-available', function (info) {
    sendUpdateMessage(message.updateAva)
  });
  autoUpdater.on('update-not-available', function (info) {
    sendUpdateMessage(message.updateNotAva)
  });

  // 更新下载进度事件
  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow.webContents.send('downloadProgress', progressObj)
  })
  // 下载完成事件
  autoUpdater.on('update-downloaded',  (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) => {
    // 通知渲染进程现在完成
    mainWindow.webContents.send('isUpdateNow')
    ipcMain.on('isUpdateNow', (e, arg) => {
      // 关闭程序安装新的软件
      autoUpdater.quitAndInstall();
    })
  });

  //执行自动更新检查
  autoUpdater.checkForUpdates();
}

// 通过main进程发送事件给renderer进程，提示更新信息
// win = new BrowserWindow()
function sendUpdateMessage(text) {
  mainWindow.webContents.send('message', text)
}
