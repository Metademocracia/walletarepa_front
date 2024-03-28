import axios from 'axios';

function routeLogin(action) {
  if(action) {
    if(action === "connect-with-near") {
      return "/"+action
    }
    return "/"
  } else {
    return "/" 
  }
}

function routeAction(_action, route) {
  if(_action){
    return { path: route, query: {action: _action} }
  } else {
    return { path: route }
  }
}

function shortenAddress(address) {
  const addresFinal = address === undefined ? "" : address.length > 25 ? address.substring(0,9)+"..."+address.substring((address.length - process.env.Network.length - 7), address.length) : address;
  return addresFinal
}

function executeQueryRpc(_method, _params) {
  const json = {
    "jsonrpc": "2.0",
    "id": "dontcare",
    "method": _method,
    "params": _params
  };

  return axios.post(process.env.ROUTER_RPC,
    json, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
}


export default {
  routeLogin,
  routeAction,
  shortenAddress,
  executeQueryRpc,
}