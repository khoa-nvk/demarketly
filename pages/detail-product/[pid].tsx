import { useRouter } from 'next/router'
import Link from 'next/link'
import { useEffect, useState } from "react";
import BuyProductButton from '../../components/IndexComponents/BuyProductButton';
import { useAeternity } from "../../providers/AeternityProvider";

import type { ReactElement } from 'react'
import LayoutIndex from '../../components/LayoutIndex'
import type { NextPageWithLayout } from '../_app'
import ReactStars from "react-star-rating-component";
import { useForm } from 'react-hook-form';

import LoadingData from '../../components/LoadingData';
import Swal from 'sweetalert2'


const Page: NextPageWithLayout = () => {
  const router = useRouter()
  const [dataProductDetail, setDataProductDetail] = useState(null);
  const [ratingValue, setRatingValue] = useState(4)
  const [listDataReview, setListDataReview] = useState([])
  const [boughtProduct, setBoughtProduct] = useState(false)
  const [isOwnerProduct, setIsOwnerProduct] = useState(false)
  const [alreadyComment, setAlreadyComment] = useState(false)
  const [isPurchasedProduct, setIsPurchasedProduct] = useState(false)

  const [loadingData, setLoadingData] = useState(false)

  const { pid } = router.query
  console.log(pid)

  const { register, handleSubmit, setValue, watch, getValues, formState: { isValid, errors } } = useForm({ mode: 'onChange' });

  const dataUserSession = useAeternity()

  console.log('data user session', dataUserSession)


  useEffect(() => {
    if (pid) {

    }
  }, [router.query, router.asPath])

  useEffect(() => {
    if (pid) {
      if (dataUserSession.address) {
        console.log('dataProductDetail', dataProductDetail)
        if (dataProductDetail && dataProductDetail.seller) {
          if (dataProductDetail.seller == dataUserSession.address) {
            setIsOwnerProduct(true)
          }
        }

      }
    }
  }, [dataUserSession.address])

  useEffect(() => {
    if (pid) {
      if (dataUserSession.contractInstance) {
        getProductByID(pid)
        getBuyerIdsByProduct(pid)
        getReviewDataByProduct(pid)
      }
    }
  }, [dataUserSession.contractInstance])


  const getProductByID = async (id: any) => {

    let dataProductById = await dataUserSession.contractInstance.methods.get_product(id)

    console.log('dataProductById', dataProductById)

    if (dataProductById && dataProductById.decodedResult) {

      setDataProductDetail(dataProductById.decodedResult)

      if (dataUserSession.address) {
        if (dataProductById.decodedResult.seller == dataUserSession.address) {
          setIsOwnerProduct(true)
        }
      }
    }
  }

  const getBuyerIdsByProduct = async (productId: any) => {

    let tx = await dataUserSession.contractInstance.methods.get_buyer_addresses(productId)

    let listAddressBuyerOfProduct = tx.decodedResult

    console.log('listAddressBuyerOfProduct', listAddressBuyerOfProduct)

    if (dataUserSession.address) {
      listAddressBuyerOfProduct.forEach((item: any, index: number) => {
        if (item == dataUserSession.address) {
          setIsPurchasedProduct(true)
          setBoughtProduct(true)
        }
      })
    }
  }
  const getReviewDataByProduct = async (productId: any) => {
    try {
      let tx = await dataUserSession.contractInstance.methods.get_reviews(productId)
      let listReviewOfProduct = tx.decodedResult
      console.log('listReviewOfProduct', listReviewOfProduct);
      listDataReview = listReviewOfProduct
      let temp = toObject(listReviewOfProduct)
      setListDataReview(temp)

      if (dataUserSession.address) {
        listReviewOfProduct.forEach((item: any) => {
          if (item.reviewer == dataUserSession.address) {
            setAlreadyComment(true)
          }
        })
      }
    } catch (error) {
    }
  }

  const toObject = (data: object) => {
    return JSON.parse(JSON.stringify(data, (key, value) =>
      typeof value === 'bigint'
        ? value.toString()
        : value // return everything else unchanged
    ));
  }

  const handleButtonBuyNow = (id: string, price: number, seller: any) => {
    console.log(dataUserSession.address)

    if (isOwnerProduct) {
      return (
        <div className="card buy-product-wrapper border-0 mb-4 p-4">
          <div className="text-center">
            <h5>
              <span className='text-success'>You are the owner of this product</span>
              <Link href={'/seller/catalog/product/' + id}>
                <button className='btn btn-sm btn-info mt-2 d-flex align-items-center' style={{ margin: 'auto' }}>
                  <i className='mdi mdi-grease-pencil mr-2'></i>
                  Edit product
                </button>
              </Link>
            </h5>
          </div>
        </div>
      )
    }

    if (boughtProduct) {
      return (
        <div className="card buy-product-wrapper border-0 mb-4 p-4">
          <div className="mb-4 text-center">
            <div className='mt-2'>
              <h5 className='text-info'>You already bought this product</h5>
            </div>

            <div className='mt-4'>
              <Link href={'/dashboard/purchased/' + id}>
                <button className="btn btn-sm btn-success">
                  <i className="mdi mdi-cart m-auto" />
                  Go to Dashboard to view detail
                </button>
              </Link>
            </div>
          </div>
        </div>
      )
    } else {
      if (dataUserSession.address) {
        return (
          <BuyProductButton id={id} address={dataUserSession.address} price={price} seller={seller}></BuyProductButton>
        )
      }
      else {
        return (
          <div className="btn btn-info" onClick={dataUserSession.handleLogIn}>
            <i className="mdi mdi-cart m-auto" />
            Buy Now
          </div>
        )
      }
    }
  }

  const handleCreateReview = (dataForm: any) => {
    console.log("dataForm", dataForm)
    console.log('ratingValue', ratingValue)
    createReview(dataForm)
  }

  const createReview = async (dataCoupon: any) => {

    let productID = pid
    let comment = dataCoupon.commentReview
    let rating = Number(ratingValue)

    console.log(productID, comment, rating)

    try {

      setLoadingData(true)

      let tx = await dataUserSession.contractInstance.methods.add_review(productID, comment, rating);

      console.log('tx')

      setLoadingData(false)
      Swal.fire({
        icon: 'success',
        title: 'Create review success!',
        text: 'Estimated completion time: a few seconds or maybe sooner',
        showConfirmButton: true
      }).then((result) => {
        window.location.reload()
      })

    } catch (error) {
      setLoadingData(false)
    }
  }

  const ratingChanged = (newRating: any, prevRating: any, name: any) => {
    // console.log(newRating);
    setRatingValue(newRating)
  };

  const truncateString = (text: string, numberChars: number) => {
    if (text.length <= numberChars) {
      return text
    }

    if (text) {
      let res = text.slice(text.length - numberChars, text.length)
      return res
    }

    return ''
  }

  const renderNoData = () => {
    if (listDataReview.length == 0) {
      return (
        <h5 className='text-info'>This product don't have any review!</h5>
      )
    } else {
      return <></>
    }
  }

  const colorRandom = () => {
    let randomColor1 = Math.floor(Math.random() * 255);
    let randomColor2 = Math.floor(Math.random() * 255);
    let randomColor3 = Math.floor(Math.random() * 255);
    return 'rgb(' + randomColor1 + ',' + randomColor2 + ',' + randomColor3 + ')'
  }

  const renderListReview = () => {

    return (
      <div className='list-review mb-4'>
        <h4 className="mb-4">Reviews</h4>

        {renderNoData()}

        {listDataReview.map((item: any, index: number) => {
          return (
            <div className="media mb-4" key={index}>

              <div className='random-avatar' style={{ backgroundColor: colorRandom() }}>
                {truncateString(item.reviewer, 3)}
              </div>

              <div className="media-body">
                <h6>{item.reviewer}</h6>
                <div className="text-primary mb-2">
                  <ReactStars name={'rateprod' + index} editing={false} starCount={5} value={Number(item.star)} starColor={'#ffd700'}></ReactStars>
                </div>
                <p>{item.content}</p>
              </div>
            </div>
          )
        })}

      </div>
    )
  }

  const renderLeaveReview = () => {

    if (alreadyComment || isOwnerProduct) {
      if (alreadyComment) {
        return (
          <div className='already-comment-product'>
            You already added review for this product!
          </div>
        )
      }
    } else {
      if (dataUserSession.address && isPurchasedProduct) {
        return (
          <div className="comment-review">
            <h4 className="mb-4">Leave a review</h4>
            <div className="d-flex my-2 vote-star-wrapper" >
              <p className="mb-0 mr-2">Your Rating * :</p>
              <div className="text-primary">
                <ReactStars name='rateproduct' onStarClick={ratingChanged.bind(this)} starCount={5} value={ratingValue} starColor={'#ffd700'}></ReactStars>
              </div>
            </div>
            <form onSubmit={handleSubmit(handleCreateReview)}>
              <LoadingData loading={loadingData}></LoadingData>
              <div className="form-group">
                <label htmlFor="message">Your Review *</label>
                <textarea {...register('commentReview', { required: true })} rows={5} className="form-control" />
                {errors?.commentReview?.type === 'required' && <span className='text-error-form'>This field is required!</span>}
              </div>
              <div className="form-group mb-0">
                <button type="submit" className="btn btn-info px-3">Leave Your Review</button>
              </div>
            </form>
          </div>
        )
      } else {
        return <></>
      }

    }
  }

  if (dataProductDetail) {
    return (
      <div className="container-fluid py-5" style={{paddingTop: '100px!important'}}>
        <div className="row px-xl-5">

          <div className="col-lg-5 pb-5">
            <img className="w-100 img-detail-product" src={dataProductDetail['img']} alt="Image" />
          </div>

          <div className="col-lg-7 pb-5">
            <h3 className="font-weight-semi-bold" style={{ color: '#43B4A0' }} >{dataProductDetail['name']}</h3>
            <div className="d-flex mb-2">
              <small className="pt-1">({listDataReview.length} Reviews)</small>
            </div>

            <div className="d-flex mb-4">
              <small className="font-weight-semi-bold">Adress Owner: {dataProductDetail['seller']}</small>
            </div>

            <h3 className="font-weight-semi-bold mb-4">
              {(Number(dataProductDetail['price']) / (10 ** 18)).toFixed(4)}
              <span className='currency-product'> AE</span>
            </h3>

            <p className="mb-4">
              {dataProductDetail['description']}
            </p>

            <div className="d-flex align-items-center mb-4" style={{ paddingTop: '20px', borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
              {handleButtonBuyNow(dataProductDetail['id'], Number(dataProductDetail['price']), dataProductDetail['seller'])}
            </div>
          </div>
        </div>
        <div className="row px-xl-5 pt-5">

          <div className="col-md-6">
            <div className="description-product">
              <h4 className="mb-3">Product Description</h4>
              {dataProductDetail['description']}
            </div>
          </div>

          <div className="col-md-6">
            {renderListReview()}
            {renderLeaveReview()}
          </div>

        </div>
      </div>
    )
  }
  else {
    return (
      <div>
        <LoadingData loading={true}></LoadingData>
      </div>
    )
  }
}

Page.getLayout = function getLayout(page: ReactElement) {
  return (
    <LayoutIndex>
      {page}
    </LayoutIndex>
  )
}

export default Page
