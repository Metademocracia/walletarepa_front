import CryptoJS  from 'crypto-js';

const key = process.env.Network;

const stringToHex = (str) => {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    const hexValue = charCode.toString(16);

    // Pad with zeros to ensure two-digit representation
    hex += hexValue.padStart(2, '0');
  }
  return hex;
};

const hexToString = (hex) => {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    const hexValue = hex.substr(i, 2);
    const decimalValue = parseInt(hexValue, 16);
    str += String.fromCharCode(decimalValue);
  }
  return str;
};


function encryp(data){
  const encrypt = CryptoJS.AES.encrypt(data, key).toString();
  return stringToHex(encrypt);
  // return CryptoJS.enc.Base64.parse(data)
}

function decryp(data){
  const dataString = hexToString(data);
  const wA = CryptoJS.AES.decrypt(dataString, key);
  return wA.toString(CryptoJS.enc.Utf8);
}


export default {
  encryp,
  decryp
}
