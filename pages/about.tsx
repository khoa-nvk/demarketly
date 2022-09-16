import type { ReactElement } from 'react'
import LayoutIndex from '../components/LayoutIndex'
import type { NextPageWithLayout } from './_app'


const Page: NextPageWithLayout = () => {
  return (
    <div className='about-wrapper mt-5'>
      <div className='container'>
        <div className='row'>
          <div className='col-lg-6'>
            <h1>
              About DeMarketly
            </h1>

            <div className='mt-3'>
              <h2>About</h2>

              <p>DeMarketly.com is a decentralized marketplace platform for digital products secured on Æternity blockchain.</p>

              <p>You can easily create a product and sell it on DeMarketly for free. All of your data will be saved on the Æternity blockchain.</p>

              <p>Current features</p>

              <ul>
                <li>Create a product and sell it on DeMarketly for free</li>
                <li>Create coupon&nbsp;</li>
                <li>Buy products with and without a coupon&nbsp;</li>
                <li>Review product</li>
              </ul>

              <p>DeMarketly take a 0% fee per transaction and free forever</p>

              <h3>Contract</h3>

              <p>We&#39;re transparent about DeMarketly. You can find the contract code of DeMarketly at&nbsp;</p>

              {/* <p>Mainnet:&nbsp;</p>

              <p><a href="https://explorer.stacks.co/txid/0x08fe0daf265da9c42c3725d2b855d65641aaafa37f860a20b858decaaa96eeff?chain=mainnet">https://explorer.stacks.co/txid/0x08fe0daf265da9c42c3725d2b855d65641aaafa37f860a20b858decaaa96eeff?chain=mainnet</a></p>

              <p>Testnet:&nbsp;</p>

              <p><a href="https://explorer.stacks.co/txid/0x8348bb06706fdb38665b783ebfb2f128358b9348979ebbaee51b1c3af8719aa0?chain=testnet">https://explorer.stacks.co/txid/0x8348bb06706fdb38665b783ebfb2f128358b9348979ebbaee51b1c3af8719aa0?chain=testnet</a></p> */}

              <h3>Contact</h3>

              <p>For business inquiries, please contact email <a href="mailto:hello@paydii.com?subject=Hello%20Paydii">hello@DeMarketly.com</a></p>


            </div>
          </div>

          <div className='col-lg-6'>
            <h1 className='text-center mb-4'>
            DeMarketly walkthrough video
            </h1>
            <iframe width="560" height="315" src="https://www.youtube.com/embed/8ueYd0cKyY8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>

        </div>
      </div>
    </div>
  )
}

Page.getLayout = function getLayout(page: ReactElement) {
  return (
    <LayoutIndex>
      {page}
    </LayoutIndex>
  )
}

export default Page