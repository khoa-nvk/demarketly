import { PropsWithChildren } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Logo from '../styles/images/logo.png'

export default function TopMenu() {
  return (

    <div>

      <div className="container-fluid">
        <div className="row px-xl-5">
          <div className="col-lg-12">
            <nav className="navbar navbar-expand-lg bg-light navbar-light py-3 py-lg-0 px-0">
              <a href="/" className="text-decoration-none d-block d-lg-none">
                <h1 className="m-0 display-5 font-weight-semi-bold"><span className="text-primary font-weight-bold border px-3 mr-1">DeMarketly</span></h1>
              </a>
              <button type="button" className="navbar-toggler" data-toggle="collapse" data-target="#navbarCollapse">
                <span className="navbar-toggler-icon" />
              </button>
            </nav>
            <div>




            </div>

          </div>
        </div>
      </div>

      <section className="hero-wrap style2 bg-f">
        <img src="/img/shape/shape-5.png" alt="Image" className="hero-shape-one bounce" />
        <img src="/img/shape/shape-3.png" alt="Image" className="hero-shape-two rotate" />
        <img src="/img/shape/shape-1.png" alt="Image" className="hero-shape-three moveVertical" />
        <img src="/img/shape/shape-4.png" alt="Image" className="hero-shape-four animationFramesTwo" />
        <img src="/img/shape/shape-8.png" alt="Image" className="hero-shape-six bounce" />
        <img src="/img/hero/hero-shape-10.png" alt="Image" className="hero-shape-seven moveHorizontal" />
        <img src="/img/hero/hero-shape-11.png" alt="Image" className="hero-shape-eight" />
        <div className="container">
          <div className="row gx-5 align-items-center">
            <div className="col-lg-6">
              <div className="hero-img-wrap">
                <img style={{width: '70%', margin: 'auto'}} src="/img/hero/main.png" alt="Image" />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-content">
                <h1 data-aos="fade-up" data-aos-duration={1200} data-aos-delay={200}>Decentralized marketplace secured on Æternity blockchain</h1>
                <p data-aos="fade-up" data-aos-duration={1200} data-aos-delay={300}>DeMarketly.com is a decentralized marketplace platform for the digital products like ebooks, courses, softwares secured on Æternity blockchain. DeMarketly will be FREE forever, no commission!</p>
                <div className="hero-btn" data-aos="fade-up" data-aos-duration={1200} data-aos-delay={400}>
                  <Link href="/seller/catalog/products">
                    <button className="btn style1">Create Your Product</button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
