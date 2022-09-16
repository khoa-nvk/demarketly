import { PropsWithChildren } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Logo from '../styles/images/logo.png'

export default function Sidebar() {
  return (
    
    <div className="container-fluid mb-5">
      <div className="row px-xl-5">
        <div className="col-lg-12">
          <nav className="navbar navbar-expand-lg bg-light navbar-light py-3 py-lg-0 px-0">
            <a href="/" className="text-decoration-none d-block d-lg-none">
              <h1 className="m-0 display-5 font-weight-semi-bold"><span className="text-primary font-weight-bold border px-3 mr-1">Paydii</span></h1>
            </a>
            <button type="button" className="navbar-toggler" data-toggle="collapse" data-target="#navbarCollapse">
              <span className="navbar-toggler-icon" />
            </button>
            {/* <div className="collapse navbar-collapse justify-content-between" id="navbarCollapse">
              <div className="navbar-nav ml-auto py-0">
                <Link href={'/seller/catalog/products'}>
                  <button type="button" className="btn btn-info  btn-fw">Seller Dashboard</button>
                </Link>
              </div>
            </div> */}
          </nav>
          <div>
            {/* Carousel */}
          </div>
        
        </div>
      </div>
  </div>
  )
}
