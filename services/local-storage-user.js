import utils from './utils'

function addNewAccount({ _address, _publicKey, _privateKey, _email }) {
  try {
    const dataUser = {
      address: _address,
      publicKey: _publicKey,
      privateKey: _privateKey,
      apps: null,
      email: _email,
    }

    let user = new Map()
    if (
      localStorage.getItem('listUser') !== undefined &&
      localStorage.getItem('listUser') !== null
    ) {
      const list = localStorage.getItem('listUser')
      user = new Map(JSON.parse(list))
    }
    user.set(_address, dataUser)

    const userMapStr = JSON.stringify(Array.from(user.entries()))

    localStorage.setItem('listUser', userMapStr)

    localStorage.setItem('address', _address)
    localStorage.setItem('publicKey', _publicKey)
    localStorage.setItem('privateKey', _privateKey)

    return true
  } catch (error) {
    throw new Error('Error addNewAccount: ' + error.toString())
  }
}

function removeAccount(address) {
  try {
    if (
      localStorage.getItem('listUser') !== undefined &&
      localStorage.getItem('listUser') !== null
    ) {
      let user = new Map()
      const list = localStorage.getItem('listUser')
      user = new Map(JSON.parse(list))

      user.delete(address)

      const userMapStr = JSON.stringify(Array.from(user.entries()))

      localStorage.setItem('listUser', userMapStr)

      return true
    }
    throw new Error('Error removeAccount: listUser not found')
  } catch (error) {
    throw new Error('Error removeAccount: ' + error.toString())
  }
}

function removeAccountWallet() {
  try {
    const currentAccount = getCurrentAccount()
    removeAccount(currentAccount.address)

    localStorage.removeItem('address')
    localStorage.removeItem('publicKey')
    localStorage.removeItem('privateKey')
    localStorage.removeItem('login')
    localStorage.removeItem('auth')

    window.location.reload()
  } catch (error) {
    throw new Error('Error removeAccountWallet: ' + error.toString())
  }
}

function addApp({ _address, _contract, _domain }) {
  try {
    if (localStorage.getItem('listUser')) {
      const dataApp = {
        contract: _contract,
        domain: _domain,
      }

      const list = localStorage.getItem('listUser')
      const users = new Map(JSON.parse(list))
      const dataUser = users.get(_address)

      if (!dataUser) throw new Error('Error addApp: address not found')

      const apps = dataUser.apps
        ? new Map(JSON.parse(dataUser.apps))
        : new Map()

      apps.set(_contract, dataApp)

      dataUser.apps = JSON.stringify(Array.from(apps.entries()))

      users.set(_address, dataUser)

      localStorage.setItem(
        'listUser',
        JSON.stringify(Array.from(users.entries()))
      )

      return true
    }
    throw new Error('Error addApp: address not found')
  } catch (error) {
    throw new Error('Error addApp: ' + error.toString())
  }
}

function getCurrentAccount() {
  try {
    const _address = localStorage.getItem('address')
    const _publicKey = localStorage.getItem('publicKey')
    const _privateKey = localStorage.getItem('privateKey')

    return {
      address: _address,
      publicKey: _publicKey,
      privateKey: _privateKey,
      shortenAddress: utils.shortenAddress(_address),
    }
  } catch (error) {
    throw new Error('Error getCurrentAddress: ' + error.toString())
  }
}

function getAccounts() {
  try {
    const accounts = localStorage.getItem('listUser')

    const result = JSON.parse(accounts).map((item) => {
      return {
        address: item[1].address,
      }
    })

    return result
  } catch (error) {
    throw new Error('Error getAccounts: ' + error.toString())
  }
}

function getListUser() {
  try {
    const accounts = localStorage.getItem('listUser')

    const result = JSON.parse(accounts)

    return result
  } catch (error) {
    throw new Error('Error getListUser: ' + error.toString())
  }
}

function getAccountsWithKeys() {
  try {
    const accounts = localStorage.getItem('listUser')

    const result = JSON.parse(accounts).map((item) => {
      return item[1]
    })

    return result
  } catch (error) {
    throw new Error('Error getAccounts: ' + error.toString())
  }
}

function getAccount(address) {
  try {
    if (localStorage.getItem('listUser')) {
      const list = localStorage.getItem('listUser')
      const users = new Map(JSON.parse(list))
      const dataUser = users.get(address)

      if (!dataUser) throw new Error('Error getAccount: address not found')

      return {
        address: dataUser.address,
        publicKey: dataUser.publicKey,
        privateKey: dataUser.privateKey,
        email: dataUser.email,
      }
    }
    throw new Error('Error getAccount: address not found')
  } catch (error) {
    throw new Error('Error getAccount: ' + error.toString())
  }
}

function getLockPassword() {
  return localStorage.getItem('lock-password')
}

function addLockPassword(password) {
  console.log(password)
  // localStorage.setItem('lock-password', password)
}

function removeLockPassword() {
  localStorage.removeItem('lock-password')
}

export default {
  addNewAccount,
  removeAccount,
  removeAccountWallet,
  addApp,
  getCurrentAccount,
  getAccounts,
  getAccount,
  getAccountsWithKeys,
  getLockPassword,
  addLockPassword,
  removeLockPassword,
  getListUser
}
