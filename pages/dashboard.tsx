import type { ReactElement } from 'react'
import LayoutDashboard from '../components/LayoutDashboard'
import type { NextPageWithLayout } from './_app'
import { useEffect, useState } from "react";

import { useAeternity } from "../providers/AeternityProvider";

import PurchasedProducts from '../components/dashboardComponents/PurchasedProducts';
import ReviewsProducts from '../components/dashboardComponents/ReviewsProducts';
import LoadingData from '../components/LoadingData';

const Page: NextPageWithLayout = () => {


  const dataUserSession = useAeternity()
  console.log('data user session', dataUserSession)

  const [templateListProduct, setTemplateListProduct] = useState([]);
  const [listDataReview, setListDataReview] = useState([])
  const [loadingData, setLoadingData] = useState(true)


  useEffect(() => {
    if (dataUserSession.address) {
      if (dataUserSession.contractInstance) {
        getListProductPurchased()
        getListReviewed()
        setLoadingData(false)
      }
    }
  }, [dataUserSession.address])

  useEffect(() => {
    if (dataUserSession.contractInstance) {
      if (dataUserSession.address) {
        getListProductPurchased()
        getListReviewed()
        setLoadingData(false)
      }
    }
  }, [dataUserSession.contractInstance])

  const getListProductPurchased = async () => {
    let listPurchasedProductId = await dataUserSession.contractInstance.methods.get_purchased_products_of_buyer(dataUserSession.address)
    console.log('listPurchasedProductId', listPurchasedProductId.decodedResult)
    getDetailAllProductPurchased(listPurchasedProductId.decodedResult)
  }

  const getDetailAllProductPurchased = (listProductInfo: any) => {

    let listPromise: any[] = []
    listProductInfo.forEach((itemId: any) => {
      listPromise.push(dataUserSession.contractInstance.methods.get_product(itemId.product_id))
    })

    Promise.all(listPromise).then((values) => {
      let listProductDetail: any = []

      values.forEach((item_value, index) => {
        let obj = item_value.decodedResult
        obj.origin_price = Number(listProductInfo[index].origin_price)
        obj.profit_price = Number(listProductInfo[index].profit_price)
        obj.urlBuy = '/detail-product/' + item_value.decodedResult.id
        listProductDetail.push(obj)
      })

      console.log('listProductDetailFinal', listProductDetail);

      templateListProduct = listProductDetail
      let temp = toObject(listProductDetail)
      setTemplateListProduct(temp)
    });
  }

  const getListReviewed = async () => {
    let listReviewedData = await dataUserSession.contractInstance.methods.get_my_reviews(dataUserSession.address)
    console.log('listReviewedData', listReviewedData.decodedResult)
    getDetailAllReview(listReviewedData.decodedResult)


  }

  const getDetailAllReview = (listReviewInfo: any) => {

    let listPromise: any[] = []
    listReviewInfo.forEach((itemId: any) => {
      listPromise.push(dataUserSession.contractInstance.methods.get_product(itemId.product_id))
    })

    Promise.all(listPromise).then((values) => {
      let listProductDetail: any = []

      values.forEach((item_value, index) => {
        console.log(index, item_value)
        let obj = item_value.decodedResult
        obj.content = listReviewInfo[index].content
        obj.reviewer = listReviewInfo[index].reviewer
        obj.star = Number(listReviewInfo[index].star)
        listProductDetail.push(obj)
      })

      console.log('listDataReview', listProductDetail);

      listDataReview = listProductDetail
      let temp = toObject(listProductDetail)
      setListDataReview(temp)
    });
  }

  const toObject = (data: object) => {
    return JSON.parse(JSON.stringify(data, (key, value) =>
      typeof value === 'bigint'
        ? value.toString()
        : value // return everything else unchanged
    ));
  }


  return (
    <div className="row">
      <div className="col-sm-12">
        <div className="home-tab">
          <div className="d-sm-flex align-items-center justify-content-between border-bottom">
            <ul className="nav nav-tabs" role="tablist">
              <li className="nav-item">
                <a className="nav-link active ps-0" id="home-tab" data-bs-toggle="tab" href="#purchased" role="tab" aria-controls="purchased" aria-selected="true">Purchased</a>
              </li>

              <li className="nav-item">
                <a className="nav-link" id="profile-tab" data-bs-toggle="tab" href="#reviews" role="tab" aria-selected="false">Your Review</a>
              </li>
            </ul>
          </div>

          <div className="tab-content tab-content-basic">
            <div className="tab-pane fade show active" id="purchased" role="tabpanel" aria-labelledby="purchased">
              <LoadingData loading={loadingData}></LoadingData>
              <PurchasedProducts templateListProduct={templateListProduct}></PurchasedProducts>
            </div>
            <div className="tab-pane fade" id="reviews" role="tabpanel" aria-labelledby="reviews">
              <ReviewsProducts templateListReview={listDataReview}></ReviewsProducts>
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