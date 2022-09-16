import type { ReactElement } from 'react'
import { useEffect, useState } from "react";

import LayoutDashboard from '../../components/LayoutDashboard'
import RevenueStatisticComponent from '../../components/sellerDashboardComponents/RevenueStatisticComponent'
import TransactionStatisticComponent from '../../components/sellerDashboardComponents/TransactionStatisticComponent'
import type { NextPageWithLayout } from '../_app'

import { useAeternity } from "../../providers/AeternityProvider";
import ProfitStatisticComponent from '../../components/sellerDashboardComponents/ProfitStatisticComponent';
import LoadingData from '../../components/LoadingData';
import ReviewStatisticComponent from '../../components/sellerDashboardComponents/ReviewStatisticComponent';


const Page: NextPageWithLayout = () => {

  const dataUserSession = useAeternity()

  const [statisticType, setStatisticType] = useState<string>('revenue');

  const [templateListProduct, setTemplateListProduct] = useState([]);
  const [listProductWithReceipt, setListProductWithReceipt] = useState([])
  const [dataChart, setDataChart] = useState([])
  const [dataReviews, setDataReviews] = useState([])


  const [revenueSeller, setRevenueSeller] = useState<number>(0);
  const [profitSeller, setProfitSeller] = useState<number>(0);
  const [loadingData, setLoadingData] = useState(true)



  useEffect(() => {
    if (dataUserSession.address) {
      if (dataUserSession.contractInstance) {
        getListProducBySeller(dataUserSession.address)
      }

    }
  }, [dataUserSession.address])

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

  const getListReviewOfAllProduct = (listProducts: any) => {
    let listPromise: any[] = []
    listProducts.forEach((item: any) => {
      listPromise.push(dataUserSession.contractInstance.methods.get_reviews(item.id))
    })

    Promise.all(listPromise).then((values) => {

      let listProductReview: any = []

      values.forEach((item_value, index) => {
        item_value.decodedResult.forEach((itemReview: any) => {
          let obj = {
            review: itemReview,
            product: listProducts[index]
          }
          listProductReview.push(obj)
        })
      })
      dataReviews = listProductReview
      let temp = toObject(listProductReview)
      setDataReviews(temp)

      console.log('dataReviews', dataReviews)
    });

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

      getBuyersOfEachProduct(listProductDetail)
      getListReviewOfAllProduct(listProductDetail)

      templateListProduct = listProductDetail
      let temp = toObject(listProductDetail)
      setTemplateListProduct(temp)
    });

    setLoadingData(false)
  }

  const getBuyersOfEachProduct = (listProduct: any) => {
    let listPromise: any[] = []
    listProduct.forEach((item: any) => {
      listPromise.push(dataUserSession.contractInstance.methods.get_buyer_addresses(item.id))
    })

    Promise.all(listPromise).then((values) => {
      let listAddressBuyerOfEachProduct: any = []

      values.forEach((item_value, index) => {
        let obj = {
          addressBuyer: item_value.decodedResult,
          product: listProduct[index]
        }
        listAddressBuyerOfEachProduct.push(obj)
      })
      console.log('listAddressBuyerOfEachProduct', listAddressBuyerOfEachProduct)

      getDetailReceiptOfAllProduct(listAddressBuyerOfEachProduct)

    });

  }

  const getDetailReceiptOfAllProduct = (listAddressBuyerOfAllProduct: any) => {
    listAddressBuyerOfAllProduct.forEach((item: any, index: number) => {
      getDetailReceiptOfEachProduct(item)
    })
  }

  const getDetailReceiptOfEachProduct = (listAddressBuyerOfProduct: any) => {
    let listPromise: any[] = []

    listAddressBuyerOfProduct.addressBuyer.forEach((itemAddress: any, index: number) => {
      listPromise.push(dataUserSession.contractInstance.methods.get_purchased_products_of_buyer(itemAddress))
    })


    Promise.all(listPromise).then((values) => {


      values.forEach((item_value, index) => {
        item_value.decodedResult.forEach((item_purchased: any, index2: number) => {

          let dataProductWithReceipt = null

          if (item_purchased.product_id == listAddressBuyerOfProduct.product.id) {
            let obj = {
              dataReceipt: item_purchased,
              addressBuyer: listAddressBuyerOfProduct.addressBuyer[index],
              product: listAddressBuyerOfProduct
            }
            dataProductWithReceipt = obj
          }

          if (dataProductWithReceipt) {
            console.log('dataProductWithReceipt', dataProductWithReceipt);

            let clone = toObject(listProductWithReceipt)
            clone.push(dataProductWithReceipt)
            listProductWithReceipt = clone
            setListProductWithReceipt(clone)
            console.log('listProductWithReceipt', listProductWithReceipt)
            updateStaticInfo()
          }
        })
      })


    });

  }

  const updateStaticInfo = () => {
    let totalRevenue = 0
    let totalProfit = 0
    listProductWithReceipt.forEach((item: any) => {
      totalRevenue += Number(item.dataReceipt.origin_price) / 10 ** 18
      totalProfit += Number(item.dataReceipt.profit_price) / 10 ** 18
    })
    setRevenueSeller(totalRevenue)
    setProfitSeller(totalProfit)

    updateDataChart()
  }

  const updateDataChart = () => {

    let dataChartTemp: any[] = []
    listProductWithReceipt.forEach((itemReceipt: any, index1: number) => {
      // check have product in dataChartTemp
      let checkHaveProduct = false
      let indexProduct = -1
      dataChartTemp.forEach((itemDataChart: any, index2: number) => {
        if (itemDataChart.product_id == itemReceipt.product.product.id) {
          checkHaveProduct = true
          indexProduct = index2
        }
      })

      if (checkHaveProduct) {
        // already have product , total origin price and profit price
        if (indexProduct != -1) {
          dataChartTemp[indexProduct].origin_price += Number(itemReceipt.dataReceipt.origin_price)
          dataChartTemp[indexProduct].profit_price += Number(itemReceipt.dataReceipt.profit_price)
        }

      } else {
        let obj = {
          product_id: itemReceipt.product.product.id,
          product_name: itemReceipt.product.product.name,
          origin_price: Number(itemReceipt.dataReceipt.origin_price),
          profit_price: Number(itemReceipt.dataReceipt.profit_price),
        }
        dataChartTemp.push(obj)
      }
    })

    console.log('dataChartTemp', dataChartTemp)

    // //set datachart
    let clone = toObject(dataChartTemp)
    dataChart = clone
    setDataChart(clone)
  }

  const toObject = (data: object) => {
    return JSON.parse(JSON.stringify(data, (key, value) =>
      typeof value === 'bigint'
        ? value.toString()
        : value // return everything else unchanged
    ));
  }

  const renderContentStatistic = () => {
    if (statisticType == 'revenue') {
      return (
        <RevenueStatisticComponent data={dataChart}></RevenueStatisticComponent>
      )
    }
    if (statisticType == 'profit') {
      return (
        <ProfitStatisticComponent data={dataChart}></ProfitStatisticComponent>
      )
    }
    if (statisticType == 'transaction') {
      return (
        <TransactionStatisticComponent dataTable={listProductWithReceipt}></TransactionStatisticComponent>
      )
    }
    if (statisticType == 'reviews') {
      return (
        <ReviewStatisticComponent dataTable={dataReviews}></ReviewStatisticComponent>
      )
    }
  }

  const renderTopStatistic = () => {
    return (
      <div className="row">
        <div className="col-sm-12">
          <div className="statistics-details d-flex align-items-center justify-content-between">

            <div className={statisticType == 'revenue' ? "item-statistic active" : "item-statistic"} onClick={() => setStatisticType('revenue')}>
              <p className="statistics-title">Revenue</p>
              <h3 className="rate-percentage"><span className='text-success'>{revenueSeller}</span>  AE</h3>
              <p className="text-success d-flex justify-center"><i className="mdi mdi-menu-up" /><span>+ 100%</span></p>
            </div>

            <div className={statisticType == 'profit' ? "item-statistic active" : "item-statistic"} onClick={() => setStatisticType('profit')}>
              <p className="statistics-title">Profit</p>
              <h3 className="rate-percentage"><span className='text-success'>{profitSeller}</span> AE</h3>
              <p className="text-success d-flex justify-center"><i className="mdi mdi-menu-up" /><span>+ 100%</span>
              </p>
            </div>

            <div className={statisticType == 'transaction' ? "item-statistic active" : "item-statistic"} onClick={() => setStatisticType('transaction')}>
              <p className="statistics-title">Transactions</p>
              <h3 className="rate-percentage">{listProductWithReceipt.length}</h3>
              <p className="text-success d-flex justify-center"><i className="mdi mdi-menu-up" /><span>+ 100%</span></p>
            </div>

            {/* <div className={statisticType == 'products' ? "item-statistic active" : "item-statistic"} onClick={() => setStatisticType('products')}>
            <p className="statistics-title">Products</p>
            <h3 className="rate-percentage">{templateListProduct.length}</h3>
            <p className="text-success d-flex justify-center"><i className="mdi mdi-menu-up" /><span>+ 100%</span></p>
          </div>

          <div className={statisticType == 'coupons' ? "item-statistic active" : "item-statistic"} onClick={() => setStatisticType('coupons')}>
            <p className="statistics-title">Coupons</p>
            <h3 className="rate-percentage">2</h3>
            <p className="text-success d-flex justify-center"><i className="mdi mdi-menu-up" /><span>+ 100%</span></p>
          </div> */}

            <div className={statisticType == 'reviews' ? "item-statistic active" : "item-statistic"} onClick={() => setStatisticType('reviews')}>
              <p className="statistics-title">Reviews</p>
              <h3 className="rate-percentage">2</h3>
              <p className="text-success d-flex justify-center"><i className="mdi mdi-menu-up" /><span>+ 100%</span></p>
            </div>

          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="row">
      <div className="col-sm-12">
        <div className="home-tab">
          <div className="d-sm-flex align-items-center justify-content-between border-bottom">

            <ul className="nav nav-tabs" role="tablist">
              <li className="nav-item">
                <a className="nav-link active ps-0" id="home-tab" data-bs-toggle="tab" href="#overview" role="tab" aria-controls="overview" aria-selected="true">Overview</a>
              </li>
            </ul>

          </div>
          <div className="tab-content tab-content-basic">
            <div className="tab-pane fade show active" style={{ position: 'relative' }} id="overview" role="tabpanel" aria-labelledby="overview">

              <LoadingData loading={loadingData}></LoadingData>

              {renderTopStatistic()}

              {renderContentStatistic()}
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
