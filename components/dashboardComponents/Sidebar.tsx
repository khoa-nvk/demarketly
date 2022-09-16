import { PropsWithChildren } from 'react'
import Link from 'next/link'
import { useEffect, useState } from "react";
import { useRouter } from 'next/router'

export default function Sidebar() {

  const router = useRouter()
  const [typeNav, setTypeNav] = useState<string>('')

  useEffect(() => {
    const path = router.asPath
    console.log('path',path)

    if(path== '/dashboard') {
      setTypeNav('buyer-dashboard')
    }
   
    if(path == '/seller/dashboard') {
      setTypeNav('seller-dashboard')
    }

    if(path == '/seller/catalog/products') {
      setTypeNav('seller-products')
    }

    if(path == '/seller/catalog/coupons') {
      setTypeNav('seller-coupons')
    }
  },[router.asPath])


  return (
        <nav className="sidebar sidebar-offcanvas" id="sidebar">
          <ul className="nav">

            <li className="nav-item nav-category">Customer Dashboard</li>
            <li className={typeNav == 'buyer-dashboard' ? "nav-item active no-pointer" : "nav-item"} >
              <Link href={'/dashboard'}>
                <a className="nav-link">
                  <i className="mdi mdi-grid-large menu-icon" />
                  <span className="menu-title">Overview</span>
                </a>
              </Link>
            </li>

            <li className="nav-item nav-category">Seller Dashboard</li>
            <li className={typeNav == 'seller-dashboard' ? "nav-item active no-pointer" : "nav-item"}>
              <Link href={'/seller/dashboard'}>
                <a className="nav-link">
                  <i className="menu-icon mdi mdi-file-document" />
                  <span className="menu-title">Analytics</span>
                </a>
              </Link>
            </li>
            
            <li className={(typeNav == 'seller-products' )|| (typeNav=='seller-coupons') ? "nav-item active" : "nav-item"}>

              <a className="nav-link" data-bs-toggle="collapse" href="#catalog-menu" aria-expanded={true} aria-controls="ui-basic">
                <i className="menu-icon mdi mdi-floor-plan" />
                  <span className="menu-title">Catalog</span>
                <i className="menu-arrow" />
              </a>

              <div className="collapse show" id="catalog-menu">
                <ul className="nav flex-column sub-menu">
                  <li className="nav-item">
                    <Link href={'/seller/catalog/products'}>
                      <a className={typeNav == 'seller-products' ? "nav-link active no-pointer" : "nav-link"}>
                        Products
                      </a>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href={'/seller/catalog/coupons'}>
                      <a className={typeNav == 'seller-coupons' ? "nav-link active no-pointer" : "nav-link"}>
                      Coupons
                      </a>
                      </Link>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </nav>
  )
}
