import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import {
  Node, RpcAepp, WalletDetector, BrowserWindowMessageConnection, Universal, TxBuilder,
} from '../js-sdk/es/index.mjs'

import { getSdkAeternity, getContractInstance } from "../api/transaction";

import createPersistedState from 'use-persisted-state';

const useCounterStateWalletUser = createPersistedState('walletUser');
const useCounterStateAddress = createPersistedState('address');



interface AeternityContextValue {
  sdkAeternity: null,
  contractInstance: null,
  walletUser: any,
  address?: string,
  handleLogIn: () => void,
  handleLogOut: () => void
}

const AeternityContext = createContext<AeternityContextValue | undefined>(undefined);

export default function AeternityProvider({ children }: PropsWithChildren<{}>) {
  const [sdkAeternity, setSdkAeternity] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [walletUser, setWalletUser] = useCounterStateWalletUser(null);
  const [address, setAddress] = useCounterStateAddress('')



  useEffect(() => {
    console.log('init contract')
    initContractInfo()
    if (address && walletUser) {
      initConnectWalletUser()
    }
  }, []);

  const initConnectWalletUser = async () => {
    await scanForWallets()
  }

  const initContractInfo = async () => {
    getSdkAeternity().then(async function (sdk) {
      console.log('sdk', sdk)
      sdkAeternity = sdk
      setSdkAeternity(sdk)

      getContractInstance(sdk).then((contractInstance) => {
        console.log('contractIns', contractInstance);
        contractInstance = contractInstance
        let copy = Object.assign({}, contractInstance)
        setContractInstance(copy)
      })
    })
  }

  const handleLogIn = async () => {
    // Start looking for wallets
    await scanForWallets() // Start looking for new wallets
  }

  const handleLogOut = async () => {
    setAddress(null)
    setWalletUser(null)
    window.location.reload()
    // let logout = await sdkAeternity.disconnectWallet(false); 
    // console.log('logout',logout)
  }

  const connectToWallet = async (wallet: any) => {

    if (sdkAeternity) {
      wallet.getConnection().then((connectionWallet) => {

        sdkAeternity.connectToWallet(connectionWallet).then((connectWallet) => {

          console.log(connectWallet)
          sdkAeternity.subscribeAddress('subscribe', 'connected').then((accounts) => {
            console.log(accounts)
            sdkAeternity.address().then((selectedAccountAddress) => {
              console.log(selectedAccountAddress)

              walletUser = wallet
              let temp = JSON.parse(JSON.stringify(wallet))
              setWalletUser(temp)

              let info = sdkAeternity.rpcClient.getCurrentAccount()
              console.log('info', info)
              setAddress(info)

              let walletName = sdkAeternity.rpcClient.info.name
              console.log('walletName', walletName);
            })
          })
        })
      })





    } else {
      getSdkAeternity().then(async function (sdk) {
        sdkAeternity = sdk
        setSdkAeternity(sdk)

        getContractInstance(sdk).then((contractInstance) => {
          console.log('contractIns', contractInstance);
          contractInstance = contractInstance
          let copy = Object.assign({}, contractInstance)
          setContractInstance(copy)
        })


        wallet.getConnection().then((connectionWallet) => {

          sdk.connectToWallet(connectionWallet).then((connectWallet) => {

            console.log(connectWallet)
            sdk.subscribeAddress('subscribe', 'connected').then((accounts) => {
              console.log(accounts)
              sdk.address().then((selectedAccountAddress) => {
                console.log(selectedAccountAddress)

                walletUser = wallet
                let temp = JSON.parse(JSON.stringify(wallet))
                setWalletUser(temp)

                let info = sdk.rpcClient.getCurrentAccount()
                console.log('info', info)
                setAddress(info)

                let walletName = sdk.rpcClient.info.name
                console.log('walletName', walletName);

              })
            })



          })
        })




      })
    }

  }

  const scanForWallets = async () => {
    // call-back function for new wallet event
    const handleWallets = async function ({ wallets, newWallet }) {
      newWallet = newWallet || Object.values(wallets)[0]
      // ask if you want to connect
      // if (confirm(`Do you want to connect to wallet ${newWallet.name}`)) {
      // Stop scanning wallets
      detector.stopScan()
      // Connect to wallet
      await connectToWallet(newWallet)
      // }
    }

    // Create connection object for WalletDetector
    const scannerConnection = await BrowserWindowMessageConnection({
      connectionInfo: { id: 'spy' }
    })
    // Initialize WalletDetector 
    const detector = await WalletDetector({ connection: scannerConnection })
    // Start scanning
    detector.scan(handleWallets.bind(this))
  }


  const value: AeternityContextValue = { sdkAeternity, contractInstance, walletUser, address, handleLogIn, handleLogOut };

  return (
    <AeternityContext.Provider value={value}>
      {children}
    </AeternityContext.Provider>
  )
}

export function useAeternity() {
  const context = useContext(AeternityContext);
  if (context === undefined) {
    throw new Error('useAeternity must be used within a AeternityProvider');
  }
  return context;
}