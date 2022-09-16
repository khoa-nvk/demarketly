import { PropsWithChildren, useState } from 'react'
import Link from 'next/link'
import Auth from '../Auth'


export default function HeaderDashboard() {

  return (
    <div style={{position: 'relative'}}>
      <nav style={{height: '75px'}} className="navbar default-layout navbar-dashboard col-lg-12 col-12 p-0 fixed-top d-flex align-items-top flex-row">
        <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-start">
          <div className="me-3">
            <button className="navbar-toggler navbar-toggler align-self-center" type="button" data-bs-toggle="minimize">
              <span className="icon-menu" />
            </button>
          </div>
          <div>
            <Link href={'/'}>
              <a className="navbar-brand brand-logo">
                {/* <h1 className="m-0 font-weight-semi-bold text-header-dashboard">
                  <span className="text-primary font-weight-bold border px-2 mr-1">P</span>
                  aydii
                </h1> */}
                <img className="logo-main" src="/logo.png"></img>
              </a>
            </Link>
          </div>
        </div>
        <div className="navbar-menu-wrapper d-flex align-items-center">
          <ul className="navbar-nav">
            <li className="nav-item font-weight-semibold d-none d-lg-block ms-0">
              <h1 className="welcome-text">What's up? <span className="text-black fw-bold">User</span></h1>
            </li>
          </ul>
          <div className="ms-auto">
            <Auth></Auth>
          </div>
        </div>
      </nav>
    
      {/* <div className='warning-not-login-dashboard'>
       You are not logged in, please login to use dashboard
      </div> */}

    </div>
  )
}
