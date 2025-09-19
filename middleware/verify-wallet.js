import walletUtils from '@/services/wallet';


export default async function(context) {
  const data = localStorage.getItem('data') ? localStorage.getItem('data') : 0;
  try {
    const utilsdata = await walletUtils.verifyWallet();
    if (!utilsdata || !(utilsdata?.data?.email && utilsdata?.data?.cedula && utilsdata?.data?.name && utilsdata?.data?.walletname)) {
      return context.redirect('/user-profile');
    } else if (data>0) {
      return context.redirect('/trades-pending');
    } 
  } catch (error) {
    console.error(error);
    // Handle the error as needed
  }
}