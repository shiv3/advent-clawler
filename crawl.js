const request = require('request-promise');
const cheerio = require('cheerio')

const DEBUG = 1

const getRand = (min,max) => {
  return Math.random() * (max - min) + min;
}
const getPage = (url) => {
      const options = {
        uri:url,
        method: 'GET',
      }
      return new Promise((resolve, reject) => {
        return setTimeout(()=>{
          return request(options)
            .then((s) => {
              resolve(s);
            })
            .catch((err) => {
              reject(err.statusText);
            })
          }, getRand(100,1000));
      });
}
const parseTopPage = (html) => {
  const $ = cheerio.load(html)
  let c = $('div.mod-main div div ')[0]
  let d = JSON.parse(c.attribs["data-react-props"])
  return d.calendars
}
const parseAdventPage = (html) => {
  return new Promise((resolve, reject) => {
    try{
      const $ = cheerio.load(html)
      let c = $('div.mod-main div div')[1]
      let d = JSON.parse(c.attribs["data-react-props"])
      resolve (d)
    }catch(e){
      reject (e)
    }
  });
}
const debugrand = (advent) =>  Math.floor(Math.random()*advent.length)
const getCrawlUrl = (advent) => {
  if(DEBUG)
    advent = [advent[debugrand(advent)],advent[debugrand(advent)]] //debug
  return advent.map(adv=>`https://adventar.org/calendars/${adv.id}`)
}
const crawlPages = (urlArr) => {
  let promiseArr = urlArr.map(url=>getPage(url))
  return Promise.all(promiseArr)
}
const parseAdventPageLoop = (htmlarr) => {
  let promiseArr = htmlarr.map(html=> {
    return parseAdventPage(html)
  });
  return Promise.all(promiseArr)
}
const view = (json) => {
  let entries = json.map(e=>e.entries);
  entries.filter(e=>e.filter(d=>d.url).length > 0).forEach(ent=>{
    ent.filter(d=>d.url).forEach(s=>
      console.log(s)
    )
  })
}
const main = () => {
  getPage('https://adventar.org/')
    .then(html=>parseTopPage(html))
    .then(advs=>getCrawlUrl(advs))
    .then(url=> crawlPages(url))
    .then(htmlarr=>parseAdventPageLoop(htmlarr))
    .then(json=>view(json))
    .catch(e=>console.log(e))
}
main()
