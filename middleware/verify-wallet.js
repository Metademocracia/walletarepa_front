import walletUtils from '@/services/wallet';

export default async function(context) {
  try {
    const data = await walletUtils.verifyWallet();
    // console.log(data.data.walletname)
    if (!data || !data.data.email || !data.data.cedula || !data.data.name || !data.data.walletname) {
      return context.redirect('/user-profile');
    } else if (localStorage.getItem('orderId')) {
      return context.redirect('/trades-pending');
    }
  } catch (error) {
    console.error(error);
    // Handle the error as needed
  }
}