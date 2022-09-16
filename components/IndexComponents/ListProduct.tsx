import Link from 'next/link'
import { useEffect, useState } from "react";
import { useAeternity } from "../../providers/AeternityProvider";
import LoadingData from '../LoadingData';

import { getAllTxsAddressContract } from '../../api/transaction';


import { urlStackNodeApiV1Contract, fullContractOwnerAddressName } from '../../network-config';

export default function ListProduct() {

  const [templateListProduct, setTemplateListProduct] = useState([]);
  const [loadingData, setLoadingData] = useState(true)
  // const [totalTxsAddress, setTotalTxsAddress] = useState(0)

  const dataUserSession = useAeternity()
  console.log('data user session', dataUserSession)

  useEffect(() => {
    getAllTxsAddressContract().then(txsInfo => {
      console.log('txsInfo', txsInfo)
      formatDataProduct(txsInfo.data)
    })
  }, [])

  const formatDataProduct = (data: any) => {
    console.log('formatProduct')
    let listProduct:any[] = []
    data.forEach((item: any, index: number) => {
      if (item.tx.function) {
        if (item.tx.function == "create_product") {
          let obj = {
            id: item.tx.arguments[0].value,
            name: item.tx.arguments[1].value,
            price: Number(item.tx.arguments[2].value) / 10**18,
            description: item.tx.arguments[3].value,
            image: item.tx.arguments[4].value,
            active: item.tx.arguments[5].value,
            urlBuy: '/detail-product/' + item.tx.arguments[0].value
          }
          listProduct.push(obj)
        }
      }
    })
    console.log('listProduct',listProduct)

    templateListProduct = listProduct
    let temp = JSON.parse(JSON.stringify(listProduct))
    setTemplateListProduct(temp)
    setLoadingData(false)
  }


  const dataProduct = () => {
    if (templateListProduct.length > 0) {
      return (
        <div className="row px-xl-5 pb-3">
          {templateListProduct.map((item: any, id: number) => (
            <div className="col-lg-3 col-md-6 col-sm-12 pb-1" key={id}>
              <div className="card product-item border-0 mb-4">
                <Link href={item.urlBuy}>
                  <div className="card-header product-img position-relative overflow-hidden bg-transparent border p-0">
                    <img className="img-fluid w-100" src={item.image} alt="" />
                  </div>
                </Link>
                <div className="card-body border-left border-right text-center p-0 pt-4 pb-3">
                  <h6 className="text-truncate mb-3">{item.name}</h6>
                </div>
                <div className="card-footer d-flex justify-content-between bg-light border align-items-center">
                  <Link href={item.urlBuy}>
                    <div className="btn btn-sm btn-outline-success"><i className="fas fa-eye text-primary mr-1" />View Detail</div>
                  </Link>

                  <div>
                    <h6 style={{ marginBottom: '0px' }}>AE {item.price.toFixed(3)}</h6>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>)
    } else {
      return (
        <div className='text-center'>
          <h3 className='text-info'> Don't have any product</h3>
        </div>
      )
    }
  }


  return (
    <div className="container-fluid" style={{ position: 'relative' }}>
      <LoadingData loading={loadingData}></LoadingData>
      {dataProduct()}
    </div>
  )
}
