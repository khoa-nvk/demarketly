import Link from 'next/link'
import { useEffect, useState } from "react";
import { useAeternity } from "../../providers/AeternityProvider";
import LoadingData from '../LoadingData';


export default function ListProduct() {

  const [templateListProduct, setTemplateListProduct] = useState([]);
  const [loadingData, setLoadingData] = useState(true)
  const dataUserSession = useAeternity()
  console.log('data user session', dataUserSession)

  useEffect(() => {

  }, [])

  useEffect(() => {
    if (dataUserSession.contractInstance) {
      getTotalProductCreated()
    }
  }, [dataUserSession.contractInstance])

  const getTotalProductCreated = async () => {
    let listTotalProduct = await dataUserSession.contractInstance.methods.get_all_products()
    console.log('listTotalProduct', listTotalProduct.decodedResult)
    getDetailAllProduct(listTotalProduct.decodedResult)
  }

  const getDetailAllProduct = (listProductIds: any) => {

    let listPromise: any[] = []
    listProductIds.forEach((itemId: any) => {
      listPromise.push(dataUserSession.contractInstance.methods.get_product(itemId))
    })

    Promise.all(listPromise).then((values) => {
      let listProductDetail: any = []

      values.forEach((item_value, index) => {
        if (item_value.decodedResult.is_active) {
          let obj = item_value.decodedResult
          obj.urlBuy = '/detail-product/' + item_value.decodedResult.id
          listProductDetail.push(obj)
        }
      })

      console.log('listAllProductDetailFinal', listProductDetail);


      templateListProduct = listProductDetail
      let temp = toObject(listProductDetail)
      setTemplateListProduct(temp)
    });

    setLoadingData(false)
  }

  const toObject = (data: object) => {
    return JSON.parse(JSON.stringify(data, (key, value) =>
      typeof value === 'bigint'
        ? value.toString()
        : value // return everything else unchanged
    ));
  }

  const dataProduct = () => {
    if (templateListProduct.length > 0) {
      return (
        <div className='pt-5'>
          <div className="section-title style1 text-center mb-50 w-100 text-center">
            <span>List Product</span>
            <h2>Explore Product</h2>
          </div>

          <div className="row px-xl-5 pb-3">

            {templateListProduct.map((item: any, id: number) => (

              <div className="col-lg-3 col-md-6 col-sm-12 pb-1" key={id}>
                <div className="auction-card style3">
                  <div className="auction-img">
                    <Link href={item.urlBuy}>
                      <img src={item.img} alt="Image" />
                    </Link>
                    <span className="item-popularity">
                      {(Number(item.price) / (10 ** 18)).toFixed(2)} AE
                    </span>

                  </div>
                  <div className="auction-info-wrap">
                    <Link href={item.urlBuy}>
                      <div className="auction-title">
                        {item.name}
                      </div>
                    </Link>
                    <Link href={item.urlBuy}>
                      <button type="button" className="btn style5" data-bs-toggle="modal" data-bs-target="#placeBid">View Detail</button>
                    </Link>
                  </div>
                </div>
              </div>

            ))}
          </div>
        </div>
      )
    } else {
      return (
        <div className='text-center'>
          <h3 className='text-info'> Don't have any product</h3>
        </div>
      )
    }
  }


  return (
    <div className="container-fluid list-product-wrapper" style={{ position: 'relative' }}>
      <LoadingData loading={loadingData}></LoadingData>
      {dataProduct()}
    </div>
  )
}
