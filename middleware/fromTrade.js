export default function ({ route, redirect }) {
    // If the user is not authenticated or the previous route was not 'trades-pending'
    if (route.name !== 'trades-chat' || route.name !== 'trades-pending') {
      return redirect('/')
    }
  }