const rp = require('request-promise')
 
const jsdom = require('jsdom')
const { JSDOM } = jsdom


const getTbodyData = (dom = {}, selector = '') => {
    if(dom.window === undefined)
      throw new Error('DOM must contains a window property')
  
    if(selector.length === 0)
      throw new Error('Selector is required')
    
    console.log(dom.window.document)
    console.log(selector)
  
    return dom.window.document.querySelector(selector)
  }

const getTextContent = (dom = {}, selector = '') => {
  if(dom.window === undefined)
    throw new Error('DOM must contains a window property')

  if(selector.length === 0)
    throw new Error('Selector is required')

  console.log(dom.window.document)
  console.log(dom.window.document.querySelector)
  return dom.window.document.querySelector(selector).textContent
}

const getDomFromURL = (url = '') => {
  if(url.length === 0) throw new Error('URL is required')

  return JSDOM.fromURL(url)
}



const url = 'https://github.com/italolourenco/tech-loop-docker'
const dom = getDomFromURL(url)


async function run() {

    const DEFAULT_REQUEST_OPTIONS = {
        rejectUnauthorized: false,
        resolveWithFullResponse: true,
        simple: false,
        time: true,
      };
    

const options = {
  uri: 'https://github.com/italolourenco/tech-loop-docker'
}
    const teste = await rp(options);

    const jsdomOpts = Object.assign({}, DEFAULT_REQUEST_OPTIONS, { url: 'https://github.com/italolourenco/tech-loop-docker' });
    const dom = new JSDOM(teste, jsdomOpts);
    const divRepos = dom.window.document.querySelector('#js-repo-pjax-container > div.container-lg.clearfix.new-discussion-timeline.px-3 > div > div.Box.mb-3.Box--condensed')
    const table = divRepos.querySelector('table')
    const tbody = table.querySelector('tbody')
    const rows = tbody.children

    const keys = Object.keys(rows)

    let dataList = []

    for(const key of keys) {
      if(key !== '0') {
        const rowSelector = rows[key]
        const cellSelector = rowSelector.querySelector('tr > td > span > a')
        const fileLink = cellSelector.getAttribute('href')

        const result = await getFileData(fileLink)
        let findElement = false

        dataList.map(data => {
          if(data.extension === result.extension){
            data.lines = data.lines + result.lines
            data.bytes = data.bytes + result.bytes
            findElement = true
            return data
          }
        })

        if(!findElement){
          dataList.push(result)
        }


    }
  }

  console.log(dataList)

}

async function getFileData(path) {
  const GIT_HUB_PATH = 'https://github.com'

  const url = GIT_HUB_PATH + path

  const options = {
    uri: url
  }

  const DEFAULT_REQUEST_OPTIONS = {
    rejectUnauthorized: false,
    resolveWithFullResponse: true,
    simple: false,
    time: true,
  };

  const body = await rp(options);

  const jsdomOpts = Object.assign({}, DEFAULT_REQUEST_OPTIONS, { url: url });
  const dom = new JSDOM(body, jsdomOpts);
  const divRepository = dom.window.document.querySelector('div.text-mono')
  const fileName = dom.window.document.querySelector('strong.final-path')
  const names = fileName.textContent.split('.')
  const extension = names[1]
  const textDiv = divRepository.textContent
  const text = JSON.stringify(textDiv).replace(/[^\d.-]/g, ' ')
  const dataList = text.split(' ')
  const a = [ ]
  dataList.forEach(data => {
    if(data!=='') {
      a.push(data)
    }
  })
  return { extension: extension, lines : parseInt(a[0]), bytes: parseFloat(a[2])}
  
}

run()