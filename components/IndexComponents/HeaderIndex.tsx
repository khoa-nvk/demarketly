import Auth from "../../components/Auth";
import { useEffect, useState } from "react";
import { useRouter } from 'next/router'
import Link from "next/link";

export default function HeaderIndex() {

  const router = useRouter()
  const path = router.asPath
  console.log(path)

  return (
    <div className="header-index container-fluid" style={{padding: '0px'}}>
      <div className="warning-testnet">
      The app is supporting <span style={{color: 'blue'}}>Æternity testnet</span> , please download  
      <a style={{color: 'cyan'}} target="_blank" href='https://chrome.google.com/webstore/detail/superhero/mnhmmkepfddpifjkamaligfeemcbhdne/related'> [SuperHero Wallet]</a>
      </div>
      <div className="row align-items-center header-index-wrapper px-xl-5">
        <div className="col-lg-2 d-none d-lg-block">
          <a href="/" className="text-decoration-none">
            {/* <h1 className="m-0 display-5 font-weight-semi-bold"><span className="text-primary font-weight-bold border px-3 mr-1">P</span>aydii</h1> */}
            <img className="logo-main" src="/logo.png"></img>
          </a>
        </div>
        <div className="col-lg-6 col-6 text-left menu-main d-flex justify-content-end">
          <Link href='/'>
            <div className={path == '/'? "mr-4 menu-item active": "mr-4 menu-item"} >
              Home
            </div>
          </Link>
          <Link href='/about'>
            <div className={path == '/about'? "mr-4 menu-item active": "mr-4 menu-item"}>
              About
            </div>
          </Link>
          <Link href='/dashboard'>
            <div className={"mr-4 menu-item"}>
              Buyer Dashboard
            </div>
          </Link>
          <Link href='/seller/catalog/products'>
            <div className={"mr-4 menu-item"}>
              Seller Dashboard
            </div>
          </Link>
        </div>

        <div className="col-lg-4 col-4 text-right auth-header-wrapper">
            <Auth />
        </div>

      </div>
    </div>
  )
}
