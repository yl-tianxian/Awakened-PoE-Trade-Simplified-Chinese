import { Host } from './IPC'

let lastUpdateTime = 0
export let imgArray: string[]

async function getLabyrinrhImage () {
  if (Date.now() - lastUpdateTime < 10 * 60 * 1000) {
    return imgArray
  }
  const imgArray2: string[] = []
  const response = await Host.proxy('www.poelab.com/')
  if (response.ok) {
    const labweb = new DOMParser().parseFromString(await response.text(), 'text/html')
    for (const a of labweb.getElementById('recent-posts-6')!.querySelector('ul')!.querySelectorAll('a')) {
      const response = await Host.proxy(a.href.replace('https://', ''), { method: 'get', mode: 'no-cors' })
      const labweb = new DOMParser().parseFromString((await response.text()), 'text/html')
      const imgweb = labweb.getElementById('inner-zoomed-container')!.querySelector('img')!.src
      // imgArray.push('proxy/' + imgweb.replace('https://', ''))
      imgArray2.push(imgweb)
    }
    // Host.logs.value += imgweb + '\n'
  }
  lastUpdateTime = Date.now()
  return imgArray2
}

export async function updateImage () {
  getLabyrinrhImage().then(value => {
    imgArray = value
  })
}
