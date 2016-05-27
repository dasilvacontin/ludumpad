import { app, BrowserWindow, ipcMain } from 'electron'

let serverAddress = null
function setUserActivity () {
  if (!serverAddress) return
  console.log(`handoff with webpageURL ${serverAddress}`)
  app.setUserActivity('in.dasilvacont.ludumpad.gamepad', {}, serverAddress)
}

ipcMain.on('ludumpad-server:start', (_, address) => {
  serverAddress = address
  setUserActivity()
})

app.on('ready', function () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false
  })
  win.loadURL(`file://${__dirname}/index.html`)
})

app.on('browser-window-focus', () => {
  console.log('window focused')
  setUserActivity()
})

app.on('window-all-closed', () => app.quit())
