const moment = require('moment')
const momenttz = require('moment-timezone')
const timeZone = 'Asia/Calcutta'
let now = () => {
  return moment.utc().format()
}
let standardFormat = () =>{
  return moment().format('h:mm:ss a, Do MMM YYYY')
}

let getLocalTime = () => {
  return moment().tz(timeZone).format()
}

let convertToLocalTime = (time) => {
  return momenttz.tz(time, timeZone).format('LLLL')
}
module.exports = {
  now: now,
  standardFormat:standardFormat,
  getLocalTime: getLocalTime,
  convertToLocalTime: convertToLocalTime

}