import { app, BrowserWindow } from 'electron'

/* waiting for electron/electron/issues/5566
app.setUserActivity({
  activityType: 'in.dasilvacont.ludumpad.gamepad',
  'webpageURL': server.address
})
*/

app.on('ready', function () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false
  })
  win.loadURL(`file://${__dirname}/index.html`)
})

app.on('window-all-closed', () => app.quit())
