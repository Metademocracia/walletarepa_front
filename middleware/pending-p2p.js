export default function (data) {
  // If the user is not authenticated
  if(localStorage.getItem('orderId')){
    this.$router.push('trades-pending');
  }
}
