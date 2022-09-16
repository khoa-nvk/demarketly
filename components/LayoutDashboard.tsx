import { PropsWithChildren } from "react";
import Sidebar from "./dashboardComponents/Sidebar";
import { useEffect, useState } from "react";
import { Toaster } from 'react-hot-toast'

import AeternityProvider from '../providers/AeternityProvider'

import HeaderDashboard from "./dashboardComponents/HeaderDashboard";

export default function LayoutDashboard({ children }: PropsWithChildren<{}>) {

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap");
  }, [])

  return (
    <div id="app">
      <AeternityProvider>
        <div>
          <div className="container-scroller">
            <HeaderDashboard></HeaderDashboard>

            <div className="container-fluid page-body-wrapper">
              <Sidebar></Sidebar>
              <div className="main-panel">
                <div className="content-wrapper">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AeternityProvider>
    </div>
  )
}
