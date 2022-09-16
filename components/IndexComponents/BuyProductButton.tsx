import { useEffect, useState } from "react";

import truncateMiddle from "../../lib/truncate";
import Swal from 'sweetalert2'
import { useAeternity } from "../../providers/AeternityProvider";
import { useRouter } from 'next/router'
import LoadingData from "../LoadingData";

export default function BuyProductButton(props: any) {


  const dataUserSession = useAeternity()
  const router = useRouter()

  console.log('Props button buy product', props)
  const idProduct = props.id
  const addressBuyer = props.address
  const priceProduct = props.price
  const seller = props.seller

  const [couponCode, setCouponCode] = useState<string>('');
  const [validCoupon, setValidCoupon] = useState<boolean>(false);
  const [validTextCoupon, setValidTextCoupon] = useState<boolean>(true);
  const [dataCouponCode, setDataCouponCode] = useState<any>();
  const [discountAmountValue, setDiscountAmountValue] = useState<number>(0);
  const [isDiscountPercent, setIsDiscountPercent] = useState<boolean>(false);

  const [loadingData, setLoadingData] = useState(false)
  const [disableBuyButton, setDisableBuyButton] = useState(false)

  useEffect(() => {
    if (couponCode != '') {
      const timeOutId = setTimeout(() => {
        // Call check coupon function
        getCouponDetail(couponCode)
      }, 500);
      return () => clearTimeout(timeOutId);
    }
  }, [couponCode]);

  const buyProductHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    console.log(`Buy product with ${idProduct} `)
    if (validCoupon) {
      buyProductWithCoupon()
    } else {
      buyProduct()
    }
  }


  const buyProduct = async () => {

    try {
      setLoadingData(true)

      console.log("buyProduct")

      let buyProduct = await dataUserSession.contractInstance.methods.buy_product(idProduct, false, '', { amount: priceProduct })

      console.log(buyProduct)
      setLoadingData(false)

      Swal.fire({
        icon: 'success',
        title: 'Buying products on blockchain, please wait a moment!',
        text: 'Estimated completion time: a few seconds or maybe sooner',
        showConfirmButton: true
      }).then((result) => {
        window.location.reload()
      })
    } catch (error) {
      setLoadingData(false)
      Swal.fire({
        icon: 'error',
        title: 'Have error when buy product',
        showConfirmButton: true
      }).then((result) => {

      })
    }


  }

  const buyProductWithCoupon = async () => {


    try {
      setLoadingData(true)
      console.log("buyProduct With coupon")

      let newAmount = priceProduct - discountAmountValue

      let buyProduct = await dataUserSession.contractInstance.methods.buy_product(idProduct, true, couponCode, { amount: newAmount })

      console.log('buyProduct withcoupon', buyProduct)

      setLoadingData(false)
      Swal.fire({
        icon: 'success',
        title: 'Buying products on blockchain, please wait a moment!',
        text: 'Estimated completion time: a few seconds or maybe sooner',
        showConfirmButton: true
      }).then((result) => {
        window.location.reload()
      })
    } catch (error) {
      setLoadingData(false)
      Swal.fire({
        icon: 'error',
        title: 'Have error when buy product',
        showConfirmButton: true
      }).then((result) => {

      })
    }

  }

  const renderTextValidCoupon = () => {

    if (couponCode == '') {
      return (<></>)
    }
    else {
      if (!validCoupon) {
        return (<div className="coupon-alert-text">Coupon is not valid </div>)
      }
      else {
        let formatPrice = priceProduct
        let discountAmountValueFormat = discountAmountValue
        let newPriceTypeAmount = formatPrice - discountAmountValueFormat

        console.log('discount amount value', newPriceTypeAmount)
        if (newPriceTypeAmount <= 0) {
          return (
            <div className="coupon-success-text mt-2">
              <div>
                Your Coupon is {discountAmountValueFormat / (10 ** 18)} AE off
              </div>
              <div className='text-danger'>
                Please contact the seller to get this product for free!
              </div>
            </div>
          )
        } else {
          return (
            <div className="coupon-success-text mt-2">
              <div>
                Your Coupon is {discountAmountValueFormat / 10 ** 18} AE off
              </div>
              <div>
                The current price of the product is <span className="new-price-discount">{newPriceTypeAmount / 10 ** 18} AE</span>
              </div>
            </div>
          )
        }
      }
    }
  }

  const initDataDiscout = (data: any) => {
    let dataCoupon = data

    let discountAmount = Number(dataCoupon.discount_amount)
    setDiscountAmountValue(discountAmount)
    setIsDiscountPercent(false)

    let formatPrice = priceProduct
    let discountAmountValueFormat = discountAmount
    let newPriceTypeAmount = formatPrice - discountAmountValueFormat


    if (newPriceTypeAmount <= 0) {
      setDisableBuyButton(true)
    } else {
      setDisableBuyButton(false)
    }
  }

  const getCouponDetail = async (couponId: any) => {

    try {

      let dataCouponDetail = await dataUserSession.contractInstance.methods.get_coupon_details(idProduct, couponId, seller)
      console.log('dataCouponDetail', dataCouponDetail)

      if (dataCouponDetail && dataCouponDetail.decodedResult) {
        dataCouponCode = dataCouponDetail.decodedResult
        let copy = Object.assign({}, dataCouponDetail.decodedResult)
        setDataCouponCode(copy)

        if (Number(dataCouponDetail.decodedResult.allowed_uses) > 0) {
          setValidTextCoupon(true)
          setValidCoupon(true)
          initDataDiscout(dataCouponDetail.decodedResult)
        } else {
          setValidCoupon(false)
          setValidTextCoupon(false)
          setDisableBuyButton(false)
        }
      }

    } catch (error) {
      setValidCoupon(false)
      setValidTextCoupon(false)
      setDisableBuyButton(false)
    }
  }

  return (

    <div className="card buy-product-wrapper border-0 mb-4 p-4">
      <LoadingData loading={loadingData}></LoadingData>

      <div className="mb-4">
        <input
          type="text"
          id="coupon-code"
          onChange={(e) => setCouponCode(e.target.value)}
          className="block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter coupon code"
        />

        {renderTextValidCoupon()}
      </div>

      <button className="btn btn-sm btn-info m-auto" disabled={disableBuyButton} onClick={buyProductHandler}>
        <i className="mdi mdi-cart m-auto" />
        Buy Product Now
      </button>

    </div>
  )
}
