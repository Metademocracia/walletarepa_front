// eslint-disable-next-line import/no-named-as-default
import gql from "graphql-tag";
import walletUtils from '@/services/wallet';
import wallet from '@/services/local-storage-user';

const data = [];

function orderSell() {
  const selects = gql`
    query MyQuery( $address : String) {
      ordersells(
        where: {signer_id: $address}
      orderBy: id
      orderDirection: desc
      first: 1
      ) {
      id
      amount_delivered
      asset
      exchange_rate
      fee_deducted
      fiat_method
      owner_id
      payment_method
      signer_id
      terms_conditions
      time
      operation_amount
      order_id
    }
  }
  `;    
   this.$apollo
      .watchQuery({
        query: selects,
        variables: {
          address: wallet.getCurrentAccount().address // localStorage.getItem("address"),
        }
      })
      .subscribe(({ data }) => {
        Object.entries(data.ordersells).forEach(([key, value]) => {
          data = [];
          data.push(value);
        });
      });
};

function orderBuy() {
  const selects = gql`
    query MyQuery( $address : String) {
      orderbuys(
        where: {signer_id: $address}
      orderBy: id
      orderDirection: desc
      first: 1
      ) {
      id
      amount_delivered
      asset
      exchange_rate
      fee_deducted
      fiat_method
      owner_id
      payment_method
      signer_id
      terms_conditions
      time
      operation_amount
      order_id
    }
  }
  `;    
   this.$apollo
      .watchQuery({
        query: selects,
        variables: {
          address: wallet.getCurrentAccount().address,
        }
      })
      .subscribe(({ data }) => {
        Object.entries(data.orderbuys).forEach(([key, value]) => {
          data = [];
          data.push(value);
        });
      });
};


export default async function(context) {
    orderSell();
    if(data.length === 0){
        orderBuy();
    }
  try {
    const utilsdata = await walletUtils.verifyWallet();
    // console.log(data.data.walletname)
    if (!utilsdata || !utilsdata?.utilsdata?.email || !utilsdata?.utilsdata?.cedula || !utilsdata?.utilsdata?.name || !utilsdata?.utilsdata?.walletname) {
      return context.redirect('/user-profile');
    } else if (data>0) {
      return context.redirect('/trades-pending');
    } else if(!sessionStorage.getItem('selectedFiat')){
      return context.redirect('/send');
    }
  } catch (error) {
    console.error(error);
    // Handle the error as needed
  }
}