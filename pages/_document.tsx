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
        <meta property="og:image" content="https://i.ibb.co/R3FWKyk/demarketly-og.png" />

        <meta property="og:url" content="https://demarketly.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="DeMarketly.com is a decentralized marketplace platform for the digital products secured on Æternity blockchain" />
        <meta property="og:description" content="DeMarketly.com is a decentralized marketplace platform for the digital products. 
You can easily create a product and sell it on DeMarketly for free. All of your data will be saved on the Æternity blockchain" />
        <meta property="og:image" content="https://i.ibb.co/R3FWKyk/demarketly-og.png" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Jost:wght@200;300;400;500;600;700&display=swap" rel="stylesheet" />

      </Head>
      <body className='body-app'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
