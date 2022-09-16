import { CONTRACT_OWNER_ADDRESS, URL_CALL_API, NETWORK_NAME } from "../network-config";
import { Node, RpcAepp } from '../js-sdk/es/index.mjs'
import INFO_DEPLOY from "../deploy/DeMarketly.aes.deploy.json"

export const getAllTxsAddressContract = async () => {
  let finalUrl = URL_CALL_API + '/mdw/v2/txs?direction=forward&contract=' + CONTRACT_OWNER_ADDRESS + '&limit=50'
  const response = await fetch(finalUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  })
  const txsInfo = await response.json();
  return txsInfo;
}


export const getSdkAeternity = async () => {
  let nodes = [];

  nodes.push({
    name: NETWORK_NAME,
    instance: await Node({ url: URL_CALL_API }),
  });


  let client = await RpcAepp({
    name: 'AEPP',
    nodes: nodes,
    compilerUrl: 'https://compiler.aepps.com',
    // call-back for update network notification

    onNetworkChange(params: any) {
      if (this.getNetworkId() !== params.networkId) alert(`Connected network ${this.getNetworkId()} is not supported with wallet network ${params.networkId}`)
    },

    // call-back for update address notification
    onAddressChange: async (addresses: any) => {
      console.log('addresses change', addresses)
      // let pub = await this.client.address()
      // this.balance = await this.client.balance(this.pub).catch(e => '0')
      // this.addressResponse = await errorAsField(this.client.address())
    },
    // call-back for update address notification
    onDisconnect(msg: any) {
      alert(msg)
    }
  })
  return client
}

export const getContractInstance = async (sdk: any) => {

  let aci = JSON.stringify(INFO_DEPLOY.aci);
  let contractAddress = INFO_DEPLOY.address;

  let contractIns = await sdk.getContractInstance(
    { aci: JSON.parse(aci), contractAddress }
  );
  return contractIns
}