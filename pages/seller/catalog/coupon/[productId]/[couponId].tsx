import type { ReactElement } from 'react'
import LayoutDashboard from '../../../../../components/LayoutDashboard'
import type { NextPageWithLayout } from '../../../../_app'
import { useForm } from 'react-hook-form';
import { useEffect, useState } from "react"
import { useRouter } from 'next/router';


import truncateMiddle from "../../../../../lib/truncate";
import { useAeternity } from "../../../../../providers/AeternityProvider";
import Swal from 'sweetalert2'
import LoadingData from '../../../../../components/LoadingData';


const Page: NextPageWithLayout = () => {

    const router = useRouter()
    const { productId, couponId } = router.query
    console.log(productId)

    const dataUserSession = useAeternity()

    const { register, handleSubmit, setValue, watch, getValues, formState: { isValid, errors } } = useForm({ mode: 'onChange' });

    const [templateListProduct, setTemplateListProduct] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (dataUserSession.address) {
            if (couponId && productId) {
                // getListProducBySeller(dataUserSession.address)
            }
        }
    }, [router.query])

    useEffect(() => {
        if (dataUserSession.contractInstance) {
            if (dataUserSession.address) {
                getDetailCouponById(couponId)
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
            setLoadingData(false)

        });

    }

    const getDetailCouponById = async (couponID: any) => {
        let tx_couponDetail = await dataUserSession.contractInstance.methods.get_coupon_details(productId, couponId, dataUserSession.address)
        console.log('tx_couponDetail', tx_couponDetail.decodedResult)

        setValue('codeCoupon', tx_couponDetail.decodedResult.code, { shouldValidate: true })
        setValue('belongProduct', tx_couponDetail.decodedResult.product_id, { shouldValidate: true })
        setValue('allowedUser', Number(tx_couponDetail.decodedResult.allowed_uses), { shouldValidate: true })
        setValue('amountValueCoupon', (Number(tx_couponDetail.decodedResult.discount_amount) / (10 ** 18)))
    }

    const handleEditCoupon = (dataForm: any) => {
        console.log("dataForm", dataForm)
        editCoupon(dataForm)
    }


    const editCoupon = async (dataCoupon: any) => {

        try {
            setLoadingData(true)
            let tx_create_coupon = await dataUserSession.contractInstance.methods.update_coupon(
                dataCoupon['belongProduct'],
                dataCoupon['codeCoupon'],
                Number(dataCoupon['allowedUser']),
                Number(dataCoupon['amountValueCoupon']) * (10 ** 18)
            )
            if (tx_create_coupon) {
                setLoadingData(false)
                Swal.fire({
                    icon: 'success',
                    title: 'Updating coupon on blockchain, please wait a moment!',
                    text: 'Estimated completion time: 1 to 2 minutes or maybe sooner',
                    showConfirmButton: true
                }).then((result) => {
                    router.push('/seller/catalog/coupons')
                })
            }
        } catch (error) {
            setLoadingData(false)
            console.log(error)
            Swal.fire({
                icon: 'error',
                title: 'Have error when update coupon!',
                text: '',
                showConfirmButton: true
            }).then((result) => {
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


    const renderSelectBelongProduct = () => {

        templateListProduct.map((item: any) => {
            return (
                <option value={item['id']}>{item['name']}</option>
            )
        })

        return (
            <div className="form-group">
                <label>Applicable Product</label>
                <select {...register('belongProduct', { required: true })} disabled={true} className="form-select" aria-label="This coupon is belong to product">
                    {templateListProduct.map((item: any, key: number) => {
                        return (
                            <option key={key} value={item['id']}>{item['name']}</option>
                        )
                    })}
                </select>
                {errors?.belongProduct?.type === 'required' && <span className='text-error-form'>This field is required!</span>}
            </div>
        )
    }


    return (
        <div className="row">
            <div className="col-md-10 grid-margin stretch-card">
                <LoadingData loading={loadingData}></LoadingData>
                <div className="card">
                    <div className="card-body">

                        <form className="forms-seller-product" onSubmit={handleSubmit(handleEditCoupon)}>
                            <div className="form-group">
                                <label>Code</label>
                                <input {...register('codeCoupon', { required: true })} type="text" readOnly={true} className="form-control" placeholder="Enter code of coupon" />
                                {errors?.codeCoupon?.type === 'required' && <span className='text-error-form'>This field is required!</span>}
                            </div>

                            {renderSelectBelongProduct()}

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label>Allowed Uses</label>
                                        <input step={1} type="number" {...register('allowedUser', { required: true, valueAsNumber: true })} min={0} className="form-control" placeholder="The number of uses of the coupon" />
                                        {errors?.allowedUser?.type === 'required' && <span className='text-error-form'>This field is required!</span>}
                                        {errors?.allowedUser?.type === 'valueAsNumber' && <span className='text-error-form'>This field input number!</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Amount STX</label>
                                <input step='any' type="number" {...register('amountValueCoupon', { required: true, valueAsNumber: true })} className="form-control" placeholder="Amount AE you want to discount" />
                                {errors?.amountValueCoupon?.type === 'required' && <span className='text-error-form'>This field is required!</span>}
                                {errors?.amountValueCoupon?.type === 'valueAsNumber' && <span className='text-error-form'>This field input number!</span>}
                            </div>

                            <div className='text-center'>
                                <button style={{ display: 'flex' }} type='submit' className="btn btn-success me-2 mt-4" disabled={!isValid}>
                                    <i className='mdi mdi-grease-pencil mr-2'></i>
                                    Update coupon
                                </button>
                            </div>

                        </form>
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