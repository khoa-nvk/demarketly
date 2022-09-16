import type { ReactElement } from 'react'
import LayoutIndex from '../components/LayoutIndex'
import type { NextPageWithLayout } from './_app'
import TopMenu from '../components/IndexComponents/TopMenu'
import ListProduct from '../components/IndexComponents/ListProduct'

const Page: NextPageWithLayout = () => {

  return (
    <div className='index-page-wrapper'>
      <TopMenu></TopMenu>
      <ListProduct></ListProduct>
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
