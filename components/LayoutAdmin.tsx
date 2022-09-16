import { PropsWithChildren } from "react";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { useEffect } from "react";
import TransactionToastProvider from '../providers/TransactionToastProvider'
import { Toaster } from 'react-hot-toast'

export default function LayoutAdmin({ children }: PropsWithChildren<{}>) {

  useEffect(()=>{
      import("bootstrap/dist/js/bootstrap");
  },[])

  return (
      <TransactionToastProvider>
        <Toaster position="bottom-right" />
        <div >
          <div>
            <main className="mb-auto">
              {children}
            </main>
          </div>
        </div>
      </TransactionToastProvider> 
  )
}
