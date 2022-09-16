import '../styles/globals.css'
import '../styles/material-icon/css/materialdesignicons.min.css'
import '../styles/ti-icons/css/themify-icons.css'
import '../styles/scss/vertical-layout-light/style.scss'
import 'bootstrap/dist/css/bootstrap.css'
import '../styles/index-page/index-page.css'
import 'sweetalert2/src/sweetalert2.scss'
import '../styles/style.scss'

import type { AppProps } from 'next/app'
import type { ReactElement, ReactNode } from 'react'
import type { NextPage } from 'next'
import { useEffect } from 'react'

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}


export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page)

  return getLayout(<Component {...pageProps} />)
}