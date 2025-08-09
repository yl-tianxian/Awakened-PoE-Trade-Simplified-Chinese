import type { ServerEvents } from '../server'
import { app,dialog } from 'electron'
import fs from 'fs/promises'
import path from 'path'

export class ConfigStore {
  private isTmpFile = false
  private cfgPath = path.join(app.getPath('userData'), 'apt-data', 'config.json')

  constructor (server: ServerEvents) {
    server.onEventAnyClient('CLIENT->MAIN::save-config', (cfg) => {
      this.save(cfg.contents, cfg.isTemporary)
      server.sendEventTo('broadcast', {
        name: 'MAIN->CLIENT::config-changed',
        payload: { contents: cfg.contents }
      })
    })
  }

  async load (): Promise<string | null> {
    let contents: string | null = null
    try {
      contents = await fs.readFile(this.cfgPath, 'utf8')
    } catch {}
    return contents
  }

  private async save (contents: string, tmp: boolean) {
    if (process.env.VITE_DEV_SERVER_URL) return

    if (tmp && !this.isTmpFile) {
      this.cfgPath += '.tmp'
      this.isTmpFile = true
    }
    try {
      await fs.mkdir(path.dirname(this.cfgPath), { recursive: true })
      await fs.writeFile(this.cfgPath, contents)
    } catch {
      dialog.showErrorBox(
          '未能写入配置文件',
          // ----------------------
          '未能写入配置文件\n' +
          '请尝试使用管理员权限运行本程序并且保存配置文件\n' +
          '出现本弹窗后本程序将自动退出'
      )
      app.exit(1)
    }
  }
}
