import moment from "moment/moment";

export function formattedTime(seconds) {
  let hour = Math.floor(seconds / 3600);
  hour = (hour < 10)? '0' + hour : hour;
  let minute = Math.floor((seconds / 60) % 60);
  minute = (minute < 10)? '0' + minute : minute;
  let second = seconds % 60;
  second = (second < 10)? '0' + second : second;
  return (Number(hour) === 0 ? '' : (hour + ':')) + minute + ':' + second;

  /* const date = new Date(value);
  let mm = date.getUTCMinutes(),
  ss = date.getUTCSeconds();

  mm = (mm < 10 ? '0' : '') + mm;
  ss = (ss < 10 ? '0' : '') + ss;
  return mm + ':' + ss; */
}

export function timeOf(time) {
  return moment(time.seconds * 1000)
}