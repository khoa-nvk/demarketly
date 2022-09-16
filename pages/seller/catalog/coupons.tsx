import type { ReactElement } from 'react'
import LayoutDashboard from '../../../components/LayoutDashboard'
import type { NextPageWithLayout } from '../../_app'
import { useEffect, useState } from "react";
import { useAeternity } from "../../../providers/AeternityProvider";

import Link from 'next/link'
import TableCoupons from '../../../components/sellerDashboardComponents/TableCoupons';
import LoadingData from '../../../components/LoadingData';


const Page: NextPageWithLayout = () => {

  const dataUserSession = useAeternity()
  console.log('data user session', dataUserSession)

  const [listProductIDs, setListProductIDs] = useState([]);
  const [templateListProduct, setTemplateListProduct] = useState([]);
  const [listCouponAndProductIds, setListCouponAndProductIds] = useState([])
  const [listCouponDetail, setListCouponDetail] = useState([])
  const [loadingData, setLoadingData] = useState(true)


  const [totalTxsAddress, setTotalTxsAddress] = useState([])
  const [totalTxsContract, setTotalTxsContract] = useState([])

  const [listIdProductCreated, setListIdProductCreated] = useState([])


  useEffect(() => {
    if (dataUserSession.address) {
      if (dataUserSession.contractInstance) {
        getListCouponSeller(dataUserSession.address)
      }

    }
  }, [dataUserSession.address])

  useEffect(() => {
    if (dataUserSession.contractInstance) {
      if (dataUserSession.address) {
        getListCouponSeller(dataUserSession.address)
      }
    }
  }, [dataUserSession.contractInstance])


  const getListCouponSeller = async (address: string) => {

    let listCouponOfSeller = await dataUserSession.contractInstance.methods.get_seller_coupons(dataUserSession.address)
    console.log('listCouponIDsOfSeller', listCouponOfSeller.decodedResult)
    getDetailAllCouponOfSeller(listCouponOfSeller.decodedResult)
  }

  const getDetailAllCouponOfSeller = (listCouponIds: any) => {

    let listPromise: any[] = []
    listCouponIds.forEach((item: any) => {
      listPromise.push(dataUserSession.contractInstance.methods.get_coupon_details(item.product_id, item.code, item.seller))
    })

    Promise.all(listPromise).then((values) => {
      let listDetailCoupon: any = []

      values.forEach((item_value, index) => {
        let obj = item_value.decodedResult
        listDetailCoupon.push(obj)
      })

      console.log('listDetailCoupon', listDetailCoupon);

      listCouponDetail = listDetailCoupon
      let temp = toObject(listDetailCoupon)
      setListCouponDetail(temp)
    });

    setLoadingData(false)
  }


  const execPromiseContract = (listPromise: any) => {
    if (listPromise.length > 0) {
      Promise.all(listPromise).then(responses => {
        let listOfPromiseResponse: any = []
        responses.forEach((respone) => {
          listOfPromiseResponse.push(respone.json())
        })

        Promise.all(listOfPromiseResponse).then(values => {
          let totalTxOfContract: any[] = []
          values.forEach((itemFinal: any) => {
            totalTxOfContract = [...totalTxOfContract, ...itemFinal.results]
          })
          let temp = toObject(totalTxOfContract)
          // Have total tx of contract
          totalTxsContract = totalTxOfContract
          setTotalTxsContract(temp)
          console.log('totalTxOfContract', totalTxsContract)
          getTxsOfAddress()
        });

      });
    }
  }

  const getTxsOfAddress = () => {
    getTxsAddressTemp(dataUserSession.address).then(txsInfo => {
      let totalItem: number = txsInfo['total']
      execPromiseAddress(getListPromiseOfAllTxsAdress(dataUserSession.address, totalItem))
    })
  }

  const getListPromiseOfAllTxsAdress = (address: string, total: number) => {
    let listPromise = []
    let limit = 50 // max is 50
    let offset = 0
    listPromise.push(getTxsAddressByPagination(address, limit, offset))

    while (total > offset) {
      offset += limit
      listPromise.push(getTxsAddressByPagination(address, limit, offset))
      if (offset + limit > total) {
        break;
      }
    }

    return listPromise
  }

  const getListPromiseOfAllTxsContract = (total: number) => {
    let listPromise = []
    let limit = 50 // max is 50
    let offset = 0
    listPromise.push(getTxsAddressContractByPagination(limit, offset))

    while (total > offset) {
      offset += limit
      listPromise.push(getTxsAddressContractByPagination(limit, offset))
      if (offset + limit > total) {
        break;
      }
    }

    return listPromise
  }

  const execPromiseAddress = (listPromise: any) => {
    if (listPromise.length > 0) {
      Promise.all(listPromise).then(responses => {
        let listOfPromiseResponse: any = []
        responses.forEach((respone) => {
          listOfPromiseResponse.push(respone.json())
        })

        Promise.all(listOfPromiseResponse).then(values => {
          let totalTxOfAddress: any[] = []
          values.forEach((itemFinal: any) => {
            totalTxOfAddress = [...totalTxOfAddress, ...itemFinal.results]
          })
          // have total tx of adress
          console.log('total txs of address', totalTxOfAddress);
          setTotalTxsAddress([...totalTxsAddress, ...totalTxOfAddress])

          // Get list id product purchased
          let listIdProduct: any[] = formatDataTxsToListIdOfProductCreated(totalTxOfAddress)

          setListIdProductCreated([...listIdProductCreated, ...listIdProduct])

          listIdProductCreated = listIdProduct
          let temp = toObject(listIdProduct)
          setListIdProductCreated(temp)
          console.log('listIdProduct Created', listIdProduct);
          executeGetDataProductFinal()
          getAllCouponBySeller(totalTxOfAddress)

        });

      });
    }
  }

  const getAllCouponBySeller = (totalTxOfAddressSeller: any) => {
    let listCouponCreatedBySeller = formatDataTxsToCoupon(totalTxOfAddressSeller, 'create-coupon')
    let listCouponUpdatedBySeller = formatDataTxsToCoupon(totalTxOfAddressSeller, 'update-coupon')

    let finalListCoupon: any[] = []

    listCouponCreatedBySeller.forEach((itemCoupon: any, index: number) => {
      let obj = itemCoupon

      listCouponUpdatedBySeller.forEach((itemUpdate: any, indexUpdate: number) => {
        if ((itemCoupon['product-id'] == itemUpdate['product-id'])
          && itemCoupon['code'] == itemUpdate['code']) {
          var dateObj = new Date(obj['date-exec'])
          var dateUpdate = new Date(itemUpdate['date-exec'])
          if (dateUpdate > dateObj) {
            obj = itemUpdate
          }
        }
      })

      obj['value-amount'] = 0
      obj['value-percent'] = 0

      if (obj['is-percentage'] == true) {
        obj['value-percent'] = (obj['discount-amount'] / 10000) * 100
      } else {
        obj['is-percentage'] = false
        obj['value-amount'] = obj['discount-amount'] / 1000000
      }

      finalListCoupon.push(obj)
    })

    console.log('finalListCoupon', finalListCoupon)

    listCouponDetail = finalListCoupon
    let obj = toObject(finalListCoupon)
    setListCouponDetail(obj)


    //   listCouponCreatedBySeller.forEach(item)

    //  let listDataReviewFinal:any[] = []

    //   templateListProduct.forEach((itemProduct:any, index:number) => {
    //     listReviewByBuyer.forEach((itemReview: any, indexReview:number)=>{
    //       if(itemProduct['id'] == itemReview['product-id']) {
    //         let obj =  {
    //           productID: itemProduct['id'],
    //           productName: itemProduct['name'],
    //           image: itemProduct['img'],
    //           content: itemReview['content'],
    //           star: itemReview['star']
    //         }
    //         listDataReviewFinal.push(obj)
    //       }
    //     })
    //   })

    //   console.log('listDataReviewFinal', listDataReviewFinal)
    //   listDataReview = listDataReviewFinal
    //   let temp = toObject(listDataReviewFinal)
    //   setListDataReview(temp)
  }


  const formatDataTxsToCoupon = (listTxs: any, compare: string) => {
    let infoCouponList: any[] = []

    listTxs.forEach((item: any, index: number) => {
      if (item['tx_type'] == "contract_call") {
        if (item['contract_call']['function_name'] == compare
          && item['contract_call']['contract_id'] == fullContractOwnerAddressName
          && item['sender_address'] == dataUserSession.address) {
          if (item['tx_status'] == 'success') {
            let objCoupon = formartDataCoupon(item['contract_call']['function_args'],)
            objCoupon['date-exec'] = item['parent_burn_block_time_iso']
            infoCouponList.push(objCoupon)
          }
        }
      }
    })

    console.log('infoCouponList', infoCouponList)

    return infoCouponList
  }


  const formartDataCoupon = (dataProd: any) => {
    let res: any = {}
    dataProd.forEach((item: any) => {
      let hexToCVData = hexToCV(item['hex'])

      if (hexToCVData['type'] == ClarityType.StringASCII || hexToCVData['type'] == ClarityType.StringUTF8) {
        res[item['name']] = hexToCVData['data']
      }
      if (hexToCVData['type'] == ClarityType.UInt) {
        res[item['name']] = Number(hexToCVData['value'])
      }
      if (hexToCVData['type'] == ClarityType.BoolTrue) {
        res[item['name']] = true
      }
      if (hexToCVData['type'] == ClarityType.BoolFalse) {
        res[item['name']] = false
      }
    })

    return res
  }


  const executeGetDataProductFinal = () => {

    let listProductCreatedTxs = filterTxsToForProductCreated(totalTxsContract)
    let listProductUpdatedTxs = filterTxsToForProductUpdated(totalTxsContract)

    console.log('listProductCreatedTxs', listProductCreatedTxs)
    console.log('listProductUpdatedTxs', listProductUpdatedTxs)


    let listDataProductUpdate: any[] = []
    let listDataProductLatestFinal: any[] = []

    listProductUpdatedTxs.forEach((itemUpdate: any, indexUpdate: any) => {
      let hexToCVProductID = hexToCV(itemUpdate['contract_call']['function_args'][0]['hex'])
      let obj = {
        id: hexToCVProductID['data'],
        timeExec: itemUpdate['parent_burn_block_time_iso'],
        data: itemUpdate['contract_call']['function_args']
      }
      let { listProductClone, haveDuplicate } = checkDuplicateUpdateProduct(listDataProductUpdate, obj)
      if (haveDuplicate) {
        listDataProductUpdate = listProductClone
      } else {
        listDataProductUpdate.push(obj)
      }
    }) // Finaly we have a list data product update with latest update


    listProductCreatedTxs.forEach((itemCreate: any, indexUpdate: any) => {
      let hexToCVProductID = hexToCV(itemCreate['contract_call']['function_args'][0]['hex'])
      let obj = {
        id: hexToCVProductID['data'],
        timeExec: itemCreate['parent_burn_block_time_iso'],
        data: itemCreate['contract_call']['function_args']
      }

      let { haveDuplicate, objLatest } = checkDuplicateDataProduct(listDataProductUpdate, obj)

      if (haveDuplicate) {
        listDataProductLatestFinal.push(objLatest)
      } else {
        listDataProductLatestFinal.push(obj)
      }
    })

    console.log('listDataProductLatestFinal', listDataProductLatestFinal)

    let listDataProductFormatFinal: any[] = []
    listDataProductLatestFinal.forEach((itemFinal: any) => {
      let objProduct = formartProductData(itemFinal['data'])
      listDataProductFormatFinal.push(objProduct)
    })

    templateListProduct = listDataProductFormatFinal
    let temp = toObject(listDataProductFormatFinal)
    setTemplateListProduct(temp)
    setLoadingData(false)
  }

  const filterTxsToForProductCreated = (listTxs: any) => {
    let listTxsProductCreated: any[] = []

    listTxs.forEach((item: any, index: number) => {
      if (item['tx_type'] == "contract_call") {
        if (item['contract_call']['function_name'] == 'create-product' && item['contract_call']['contract_id'] == fullContractOwnerAddressName) {
          if (item['tx_status'] == 'success' && checkIdProductInListId(item['contract_call']['function_args'][0]['hex'])) {

            listTxsProductCreated.push(item)
          }
        }
      }
    })
    return listTxsProductCreated
  }

  const checkIdProductInListId = (hex: string) => {
    let hexToCVData = hexToCV(hex)
    let res = false
    if (hexToCVData['type'] == ClarityType.StringASCII || hexToCVData['type'] == ClarityType.StringUTF8) {
      let id = hexToCVData['data']
      listIdProductCreated.forEach((item: any) => {
        if (item.id == id) {
          res = true
        }
      })

    }
    return res
  }

  const filterTxsToForProductUpdated = (listTxs: any) => {
    let listTxsProductUpdated: any[] = []

    listTxs.forEach((item: any, index: number) => {
      if (item['tx_type'] == "contract_call") {
        if (item['contract_call']['function_name'] == 'update-product'
          && item['contract_call']['contract_id'] == fullContractOwnerAddressName) {
          if (item['tx_status'] == 'success' && checkIdProductInListId(item['contract_call']['function_args'][0]['hex'])) {
            listTxsProductUpdated.push(item)
          }
        }
      }
    })
    return listTxsProductUpdated
  }

  const checkDuplicateUpdateProduct = (listProduct: any, itemCheck: any) => {
    let listProductClone = listProduct
    let haveDuplicate = false

    for (var index = 0; index < listProduct.length; ++index) {
      if (listProduct[index].id == itemCheck.id) {
        let timeProduct = new Date(listProduct[index].timeExec)
        let timeCheck = new Date(itemCheck)
        haveDuplicate = true

        if (timeCheck > timeProduct) {
          // update new
          listProductClone[index] = itemCheck
          break;
        }
      }
    }

    return { listProductClone, haveDuplicate }
  }

  const checkDuplicateDataProduct = (listProduct: any, itemCheck: any) => {
    let haveDuplicate = false
    let objLatest = null
    for (var index = 0; index < listProduct.length; ++index) {
      if (listProduct[index].id == itemCheck.id) {
        haveDuplicate = true
        objLatest = listProduct[index]
        break;
      }
    }

    return { haveDuplicate, objLatest }
  }

  const formatDataTxsToListIdOfProductCreated = (listTxs: any) => {
    let productCreatedListId: any[] = []

    listTxs.forEach((item: any, index: number) => {
      if (item['tx_type'] == "contract_call") {
        if (item['contract_call']['function_name'] == 'create-product'
          && item['contract_call']['contract_id'] == fullContractOwnerAddressName
          && item['sender_address'] == dataUserSession.address) {
          if (item['tx_status'] == 'success') {
            let objProduct = formartProductData(item['contract_call']['function_args'],)
            productCreatedListId.push(objProduct)
          }
        }
      }
    })

    console.log('productPurchasedList', productCreatedListId)

    return productCreatedListId
  }

  const formartProductData = (dataProd: any) => {
    let res: any = {}
    dataProd.forEach((item: any) => {
      let hexToCVData = hexToCV(item['hex'])

      if (hexToCVData['type'] == ClarityType.StringASCII || hexToCVData['type'] == ClarityType.StringUTF8) {
        res[item['name']] = hexToCVData['data']
      }
      if (hexToCVData['type'] == ClarityType.UInt) {
        res[item['name']] = Number(hexToCVData['value']) / 1000000
      }
      if (hexToCVData['type'] == ClarityType.BoolTrue) {
        res[item['name']] = true
      }
      if (hexToCVData['type'] == ClarityType.BoolFalse) {
        res[item['name']] = false
      }
    })

    res['urlBuy'] = '/detail-product/' + res['id']
    // res['txIdCreate'] = txID
    return res
  }














  const getListProducBySeller = async (address: any) => {
    const principal: string = contractOwnerAddress

    const buyer = standardPrincipalCV(address);

    console.log('address: ', address)

    // call a read-only function

    const fnCall: ReadOnlyFunctionSuccessResponse = await contractsApi.callReadOnlyFunction({
      contractAddress: principal,
      contractName: contractName,
      functionName: 'get-product-ids-by-seller',
      readOnlyFunctionArgs: {
        sender: principal,
        arguments: [cvToHex(buyer)],
      },
    });

    if (fnCall.result !== undefined) {
      let dataListProduct: any = hexToCV(fnCall.result)
      console.log("dataListProduct", dataListProduct)
      if (dataListProduct) {
        let dataIdListConverted = toObject(dataListProduct['list'])
        listProductIDs = dataIdListConverted
        // setListProductIDs(dataIdListConverted)
        getDataProductsByIDs(dataListProduct['list'])
      }
    }
  }

  const getDataProductsByIDs = (dataIds: any) => {
    let listProductIds = dataIds.map((item: any) => { return item.data })
    let listPromise: any = []
    listProductIds.forEach((item: any) => {
      listPromise.push(getProductByID(item))
    })
    if (listPromise.length > 0) {
      Promise.all(listPromise).then((values) => {
        values.forEach((item_value, index) => {
          let dataProduct: any = hexToCV(item_value.result)

          if (dataProduct['type'] == ClarityType.OptionalSome) {
            let dataFormat = dataProduct['value']['data']
            if (dataFormat['name'].data != 'NULLPRODUCT') {
              let data: any = {
                id: listProductIDs[index]['data'],
                urlBuy: '/detail-product/' + listProductIDs[index]['data'],
                name: dataFormat['name'].data,
                description: dataFormat['description'].data,
                img: dataFormat['img'].data,
                price: Number(dataFormat['price'].value),
                seller: dataFormat['seller'],
              }

              if (dataFormat['is-active'].type === ClarityType.BoolTrue) {
                data['is-active'] = true
              }
              if (dataFormat['is-active'].type === ClarityType.BoolFalse) {
                data['is-active'] = false
              }

              templateListProduct.push(data)
              console.log("templateListProduct", templateListProduct)

              let temp = toObject(templateListProduct)
              setTemplateListProduct(temp)
            }
          }
        })

        // Get data coupon by product
        getListIdCouponOfAllProductIds(dataIds)

      });
    }
  }

  const getDetailCouponByListCouponId = (dataObj: any) => {

    let listPromise: any = []

    dataObj.forEach((item: any) => {
      listPromise.push(getCouponByID(item['couponID'], item['productID'], item['seller']))
    })

    if (listPromise.length > 0) {
      let listDataCouponNotDetail: any = []
      Promise.all(listPromise).then((values) => {

        values.forEach((item_value, index) => {
          let dataCoupon: any = hexToCV(item_value.result)
          listDataCouponNotDetail.push(dataCoupon)
        })

        let listDataCouponDetail: any = []


        listDataCouponNotDetail.forEach((itemData: any, indexData: number) => {
          let obj = {
            'id': listCouponAndProductIds[indexData]['couponID'],
            'productId': listCouponAndProductIds[indexData]['productID'],
            'allowed-uses': Number(itemData['data']['allowed-uses'].value),
            'discount-amount': itemData['data']['discount-amount'].value,
            'is-percentage': false,
            'value-amount': 0,
            'value-percent': 0
          }
          if (itemData['data']['is-percentage'].type == ClarityType.BoolTrue) {
            obj['is-percentage'] = true
            obj['value-percent'] = (Number(itemData['data']['discount-amount'].value) / 10000) * 100
          } else {
            obj['is-percentage'] = false
            obj['value-amount'] = Number(itemData['data']['discount-amount'].value) / 1000000
          }

          listDataCouponDetail.push(obj)
        })


        listCouponDetail = listDataCouponDetail
        let temp = toObject(listDataCouponDetail)
        setListCouponDetail(temp)

        setLoadingData(false)

        console.log('listCouponDetail', listCouponDetail)
      });
    } else {
      setLoadingData(false)
    }
  }

  const getListIdCouponOfAllProductIds = (dataIds: any) => {

    let listProductIds = dataIds.map((item: any) => { return item.data })

    let listPromise: any = []

    listProductIds.forEach((item: any) => {
      listPromise.push(getCouponIdsByProductId(item))
    })

    if (listPromise.length > 0) {
      Promise.all(listPromise).then((values) => {
        let listCouponIdBelongProductId: any = []

        values.forEach((item_value, index) => {
          let dataListCouponId: any = hexToCV(item_value.result)
          if (dataListCouponId['list'].length > 0) {
            dataListCouponId['list'].forEach((itemListCouponIds: any, indexItem: number) => {
              let obj = {
                couponID: itemListCouponIds['data'],
                productID: listProductIDs[index]['data'],
                seller: templateListProduct[index]['seller']
              }
              listCouponIdBelongProductId.push(obj)
            })
          }
        })
        listCouponAndProductIds = listCouponIdBelongProductId
        let temp = toObject(listCouponIdBelongProductId)
        setListCouponAndProductIds(temp)
        console.log('listCouponAndProductIds', listCouponAndProductIds)
        getDetailCouponByListCouponId(listCouponIdBelongProductId)

      });
    }
  }

  const getProductByID = (id: string) => {
    if (id) {
      const principal: string = contractOwnerAddress;

      const productID: StringAsciiCV = stringAsciiCV(id);

      // call a read-only function

      return contractsApi.callReadOnlyFunction({
        contractAddress: principal,
        contractName: contractName,
        functionName: 'get-product-by-id',
        readOnlyFunctionArgs: {
          sender: principal,
          arguments: [cvToHex(productID)],
        },
      })
    }
  }

  const getCouponByID = (couponId: string, productId: string, seller: any) => {
    if (couponId && productId) {
      const principal: string = contractOwnerAddress;

      const couponID: StringAsciiCV = stringAsciiCV(couponId);
      const productID: StringAsciiCV = stringAsciiCV(productId);

      // call a read-only function

      return contractsApi.callReadOnlyFunction({
        contractAddress: principal,
        contractName: contractName,
        functionName: 'get-coupon-details',
        readOnlyFunctionArgs: {
          sender: principal,
          arguments: [cvToHex(couponID), cvToHex(productID), cvToHex(seller)],
        },
      })
    }
  }

  const getCouponIdsByProductId = (id: string) => {
    if (id) {
      const principal: string = contractOwnerAddress;

      const productID: StringAsciiCV = stringAsciiCV(id);

      // call a read-only function

      return contractsApi.callReadOnlyFunction({
        contractAddress: principal,
        contractName: contractName,
        functionName: 'get-coupon-ids-by-product',
        readOnlyFunctionArgs: {
          sender: principal,
          arguments: [cvToHex(productID)],
        },
      })
    }
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
        <div className="row flex-grow">
          <div className="col-12 grid-margin stretch-card">
            <div className="card card-rounded">
              <div className="card-body">
                <div className="d-sm-flex justify-content-between align-items-start">
                  <div>
                    <h4 className="card-title card-title-dash">
                      Your Coupons
                    </h4>
                    <p className="card-subtitle card-subtitle-dash">
                      List all your coupons
                    </p>
                  </div>
                  <div>
                    <Link href={"/seller/catalog/coupon/new"}>
                      <button style={{ display: 'flex' }} className="btn btn-success text-white mb-0 me-0" type="button">
                        <i className="mdi mdi mdi-plus mr-1" />
                        Add new coupon
                      </button>
                    </Link>
                  </div>
                </div>
                <div className="table-responsive mt-1" style={{ position: 'relative' }}>
                  <LoadingData loading={loadingData}></LoadingData>
                  <TableCoupons dataTable={listCouponDetail}></TableCoupons>
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