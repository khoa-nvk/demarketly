import type { ReactElement } from 'react'
import LayoutDashboard from '../../../components/LayoutDashboard'
import type { NextPageWithLayout } from '../../_app'
import { useEffect, useState } from "react";
import { useAeternity } from "../../../providers/AeternityProvider";

import TableProducts from '../../../components/dashboardComponents/TableProducts';
import Link from 'next/link'
import LoadingData from '../../../components/LoadingData';

const Page: NextPageWithLayout = () => {

  const dataUserSession = useAeternity()
  console.log('data user session', dataUserSession)

  const [templateListProduct, setTemplateListProduct] = useState([]);
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if(dataUserSession.address) {
      if (dataUserSession.contractInstance) {
        getListProducBySeller(dataUserSession.address)
      }
    }
  },[dataUserSession.address])

  useEffect(() => {
    if (dataUserSession.contractInstance) {
      if (dataUserSession.address) {
        getListProducBySeller(dataUserSession.address)
      }
    }
  }, [dataUserSession.contractInstance])

  const getListProducBySeller = async (address: any) => {

    let listProductOfSeller = await dataUserSession.contractInstance.methods.get_seller_products(dataUserSession.address)
    console.log('listProductIDsOfSeller', listProductOfSeller.decodedResult)
    getDetailAllProductOfSeller(listProductOfSeller.decodedResult)
   
  }

  const getDetailAllProductOfSeller = (listProductIds: any) => {

    let listPromise: any[] = []
    listProductIds.forEach((itemId: any) => {
      listPromise.push(dataUserSession.contractInstance.methods.get_product(itemId))
    })

    Promise.all(listPromise).then((values) => {
      let listProductDetail: any = []

      values.forEach((item_value, index) => {
        let obj = item_value.decodedResult
        obj.urlBuy = '/detail-product/' + item_value.decodedResult.id
        listProductDetail.push(obj)
      })

      console.log('listProductSelletDetailFinal', listProductDetail);

      templateListProduct = listProductDetail
      let temp = toObject(listProductDetail)
      setTemplateListProduct(temp)
    });

    setLoadingData(false)
  }

  const toObject = (data : object) => {
    return JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value // return everything else unchanged
    ));
  }


  return (
    <div className="row">
      <div className="col-sm-12">
      <div className="row flex-grow">
      <div className="col-12 grid-margin stretch-card">
        <div className="card card-rounded">
          <div className="card-body">
            <div className="d-sm-flex justify-content-between align-items-start">
              <div>
                <h4 className="card-title card-title-dash">
                  Your Products
                </h4>
                <p className="card-subtitle card-subtitle-dash">
                  List all your products
                </p>
              </div>
              <div>
                <Link href={"/seller/catalog/product/new"}>
                  <button className="btn btn-success text-white mb-0 me-0" type="button">
                    <i className="mdi mdi mdi-plus" />
                    Add new product
                    </button>
                  </Link>
              </div>
            </div>
            <div className="table-responsive  mt-1" style={{position: 'relative'}}>
                <LoadingData loading={loadingData}></LoadingData>
                <TableProducts dataTable={templateListProduct} mode='standard'></TableProducts>
            </div>
          </div>
        </div>
      </div>
    </div>
      </div>
    </div>
  )
}

Page.getLayout = function getLayout(page: ReactElement) {
  return (
    <LayoutDashboard>
      {page}
    </LayoutDashboard>
  )
}

export default Page