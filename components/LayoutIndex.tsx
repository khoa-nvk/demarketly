import { PropsWithChildren } from "react";
import HeaderIndex from "./IndexComponents/HeaderIndex";
import { useEffect } from "react";
import TransactionToastProvider from '../providers/TransactionToastProvider'
import { Toaster } from 'react-hot-toast'
import AeternityProvider from '../providers/AeternityProvider'

export default function LayoutIndex({ children }: PropsWithChildren<{}>) {

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap");
  }, [])

  return (
    <div id="app">
      <AeternityProvider>
        <Toaster position="bottom-right" />
        <HeaderIndex></HeaderIndex>
        <div className="pt-75-px">
          <main className="mb-auto">
            {children}
          </main>
        </div>
      </AeternityProvider>
    </div>
  )
}
