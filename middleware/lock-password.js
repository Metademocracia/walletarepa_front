import localStorageUser from '@/services/local-storage-user';

export default function ({ store, from, route, redirect }) {
  // If the user is not authenticated
  if (!localStorage.getItem('auth')) return

  const lockAuth = store.state.lockAuth,
    designedPath = '/unlock-wallet'

  if (route.path === designedPath) return

  // If the user have lock password
  if (localStorageUser.getLockPassword() && !lockAuth)
    redirect({ path: designedPath, query: { from: from.path === designedPath ? route.path : from.path } })
}
