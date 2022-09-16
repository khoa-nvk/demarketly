import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
      <meta name="twitter:card" content="summary" />
      <meta property="og:url" content="https://demarketly.com/" />
      <meta property="og:title" content="DeMarketly.com is a decentralized marketplace platform for the digital products secured on Æternity blockchain" />
      <meta property="og:description" content="DeMarketly.com is a decentralized marketplace platform for the digital products. 
You can easily create a product and sell it on DeMarketly for free. All of your data will be saved on the Æternity blockchain" />
      <meta property="og:image" content="https://i.ibb.co/F7NvkHG/OG-IMAGE.png" />
      
      <meta property="og:url"  content="https://demarketly.com/" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="DeMarketly.com is a decentralized marketplace platform for the digital products secured on Æternity blockchain" />
      <meta property="og:description"  content="DeMarketly.com is a decentralized marketplace platform for the digital products. 
You can easily create a product and sell it on DeMarketly for free. All of your data will be saved on the Æternity blockchain" />
      <meta property="og:image"    content="https://i.ibb.co/F7NvkHG/OG-IMAGE.png" />
      <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className='body-app'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
