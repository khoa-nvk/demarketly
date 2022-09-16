import { AppConfig,showConnect, UserData, UserSession } from "@stacks/connect";
import { StacksNetwork } from "@stacks/network";
import { currentNetwork, isMainnet} from "../network-config";


import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { appDetails } from "../lib/constants";
import { Storage } from '@stacks/storage';

const privateKey = '896adae13a1bf88db0b2ec94339b62382ec6f34cd7e2ff8abae7ec271e05f9d8';

interface StacksContextValue {
  network: StacksNetwork
  address?: string
  userSession: UserSession,
  storage: {},
  handleLogIn: () => void,
  getDataTxPending: () => any
}



const StackContext = createContext<StacksContextValue | undefined>(undefined);

export default function StacksProvider({ children }: PropsWithChildren<{}>) {
  const [userData, setUserData] = useState<UserData | undefined>(undefined);

  const network = new currentNetwork()
  const appConfig = new AppConfig(['store_write'])
  const userSession = new UserSession({ appConfig });
  
  
  let objConnectGaia:any = {
    appPrivateKey: privateKey,
  };

  userSession.store.getSessionData().userData = objConnectGaia

  let address:string | undefined = ''
  if(isMainnet)
    address = userData?.profile?.stxAddress?.mainnet
  else
    address = userData?.profile?.stxAddress?.testnet

   

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData);
      });
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());      
    }

  }, []);

  useEffect(() => {
    let address:string = ''
    if(userData) {
      if(isMainnet)
        address = userData?.profile?.stxAddress?.mainnet
      else
        address = userData?.profile?.stxAddress?.testnet

      console.log('address',address)
    }
    
  }, [userData]);

  const handleLogIn = async () => {
    showConnect({
      appDetails,
      onFinish: () => window.location.reload(),
      userSession,
    });
  }

  const getDataTxPending = () => {
    return getTxPending()
  } 

  const getTxPending = async () => {
      const response = await fetch('/api/transaction', {
        method: 'GET', 
        headers: {
          'Content-Type': 'application/json'
        },
      })
      const listTx = await response.json();
      return listTx;
  }

  const storage = new Storage({ userSession });

  const value: StacksContextValue = { network, address, userSession, storage, handleLogIn, getDataTxPending };

  return (
    <StackContext.Provider value={value}>
      {children}
    </StackContext.Provider>
  )
}

export function useStacks() {
  const context = useContext(StackContext);
  if (context === undefined) {
    throw new Error('useStacks must be used within a StackProvider');
  }
  return context;
}