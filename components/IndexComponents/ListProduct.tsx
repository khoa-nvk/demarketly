import Link from 'next/link'
import { useEffect, useState } from "react";
import { useAeternity } from "../../providers/AeternityProvider";
import LoadingData from '../LoadingData';
import ReactStars from "react-star-rating-component";

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



      getAllReviewOfAllProduct(listProductDetail)

    });

    setLoadingData(false)
  }

  const getAllReviewOfAllProduct = (listProduct: any) => {
    let listPromise: any[] = []
    listProduct.forEach((item: any) => {
      listPromise.push(dataUserSession.contractInstance.methods.get_reviews(item.id))
    })

    Promise.all(listPromise).then((values) => {
      let listProductDetailFinal: any = []

      values.forEach((item_value, index) => {
        let data = listProduct[index]

        let avarageStar = 0
        let totalStar = 0
        item_value.decodedResult.forEach((item_review: any) => {
          totalStar += Number(item_review.star)
        })
        if (item_value.decodedResult.length > 0 && totalStar != 0) {
          avarageStar = parseInt(totalStar / item_value.decodedResult.length)
        }

        data.listReview = item_value.decodedResult
        data.avarageStar = avarageStar

        listProductDetailFinal.push(data)
      })

      console.log('listProductDetailFinal', listProductDetailFinal);

      templateListProduct = listProductDetailFinal
      let temp = toObject(listProductDetailFinal)
      setTemplateListProduct(temp)

    });
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
                    <div className='d-flex justify-content-between mb-2'>
                      <ReactStars name={'rateprod' + id} editing={false} starCount={5} value={Number(item.avarageStar)} starColor={'#ffd700'}></ReactStars>
                      {item.listReview.length > 1 ? (
                        <div style={{ color: '#3d8360' }}>
                          {item.listReview.length} reviews
                        </div>
                      ) : (
                        <div style={{ color: '#3d8360' }}>
                          {item.listReview.length} review
                        </div>
                      )}

                    </div>
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
