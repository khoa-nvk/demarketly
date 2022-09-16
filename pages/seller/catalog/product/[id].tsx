import type { ReactElement } from 'react'
import LayoutDashboard from '../../../../components/LayoutDashboard'
import type { NextPageWithLayout } from '../../../_app'
import { useForm } from 'react-hook-form';
import { useEffect, useState } from "react";
import { useRouter } from 'next/router'

import truncateMiddle from "../../../../lib/truncate";

import { useAeternity } from "../../../../providers/AeternityProvider";
import Swal from 'sweetalert2'
import LoadingData from '../../../../components/LoadingData';


const Page: NextPageWithLayout = () => {

    const router = useRouter()
    const { id } = router.query
    console.log(id)

    const { register, handleSubmit, setValue, getValues, formState: { isValid, errors } } = useForm({ mode: 'onChange' });
    // const { addTransactionToast } = useTransactionToasts()

    const regexWebsite = new RegExp(/http[s]?:\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/gm)

    const [dataProductDetail, setDataProductDetail] = useState(null);
    const [imageProductTemp, setImageProductTemp] = useState('');
    const [listFileUpload, setListFileUpload] = useState([]);
    const [loadingData, setLoadingData] = useState(true)

    const dataUserSession = useAeternity()

    useEffect(() => {
        if (id) {

        }
    }, [router.query])

    useEffect(() => {
        if (dataUserSession.contractInstance) {
            if (id) {
                getProductByID(id)
                getUrlGaiaFromMongoDB(id)
            }
        }
    }, [dataUserSession.contractInstance])


    const handleEditProduct = (dataForm: any) => {
        console.log("dataForm", dataForm)
        editProduct(dataForm)
    }

    const getUrlGaiaFromMongoDB = async (productID: any) => {

        const data = {
            "product_id": productID
        }

        const response = await fetch('https://paydii-api.herokuapp.com/findOne', {
            method: 'POST',
            headers: new Headers({
                'Accept': 'application/ejson',
                'Access-Control-Request-Headers': '*',
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(data)
        });

        if (response.status == 200) {
            const dataUrlObj = await response.json();
            console.log('listproductDownloadURL', dataUrlObj)
            if (dataUrlObj['document']) {
                if (dataUrlObj['document']['download_links']) {
                    let linkDownLoad = dataUrlObj['document']['download_links'][0]
                    setValue('contentDelivery', linkDownLoad, { shouldValidate: true })

                }
            }
        }

        setLoadingData(false)

    }

    const updateUrlGaiaToMongoDB = async (productID: string, url: string) => {

        const data = {
            "product_id": productID,
            "download_links": [url]
        }


        const response = await fetch('https://paydii-api.herokuapp.com/updateOne', {
            method: 'POST',
            headers: new Headers({
                'Accept': 'application/ejson',
                'Access-Control-Request-Headers': '*',
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(data)
        });

        console.log(response)
    }


    const editProduct = async (dataProduct: any) => {

        try {
            setLoadingData(true)
            let tx_create_product = await dataUserSession.contractInstance.methods.update_product(
                id,
                dataProduct['productName'],
                Number(dataProduct['priceOfProduct'] * (10 ** 18)),
                dataProduct['productDescription'],
                dataProduct['productImage'],
                dataProduct['activeProduct']
            )
            if (tx_create_product) {
                updateUrlGaiaToMongoDB(id, dataProduct['contentDelivery'])
                // uploadUrlGaiaToMongoDB(id, dataProduct['contentDelivery'])

                setLoadingData(false)
                Swal.fire({
                    icon: 'success',
                    title: 'Updating this product on blockchain, please wait for a moment!',
                    text: 'Estimated completion time: a few seconds or maybe sooner',
                    showConfirmButton: true
                }).then((result) => {
                    router.push('/seller/catalog/products')
                })
            }
        } catch (error) {
            setLoadingData(false)
            console.log(error)
            Swal.fire({
                icon: 'error',
                title: 'Have error when create product!',
                text: '',
                showConfirmButton: true
            }).then((result) => {
                router.push('/seller/catalog/products')
            })
        }
    }

    const getProductByID = async (id: any) => {

        let tx_getProduct = await dataUserSession.contractInstance.methods.get_product(id)

        console.log('productinfo', tx_getProduct.decodedResult)

        setValue('productName', tx_getProduct.decodedResult.name, { shouldValidate: true })
        setValue('productDescription', tx_getProduct.decodedResult.description, { shouldValidate: true })
        setValue('productImage', tx_getProduct.decodedResult.img, { shouldValidate: true })
        setImageProductTemp(tx_getProduct.decodedResult.img)
        setValue('priceOfProduct', (Number(tx_getProduct.decodedResult.price)) / 10 ** 18, { shouldValidate: true })
        setValue('activeProduct', tx_getProduct.decodedResult.is_active, { shouldValidate: true })

        
    }

    const toObject = (data: object) => {
        return JSON.parse(JSON.stringify(data, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value // return everything else unchanged
        ));
    }

    const handleChange = (event: any) => {
        setImageProductTemp(event.target.value)
    }

    return (
        <div>

            <div className="row">

                <div className="col-md-10 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <LoadingData loading={loadingData}></LoadingData>

                            <form className="forms-seller-product" onSubmit={handleSubmit(handleEditProduct)}>
                                <div className="form-group">
                                    <label>Product name (*)</label>
                                    <input {...register('productName', { value: '', required: true })} type="text" className="form-control" placeholder="Enter name of product" />
                                    {errors?.productName?.type === 'required' && <span className='text-error-form'>This field is required!</span>}
                                </div>

                                <div className="form-group">
                                    <label>Product description (*)</label>
                                    <textarea {...register('productDescription', { required: true })} rows={10} className="form-control" placeholder="Enter description of product" />
                                    {errors?.productDescription?.type === 'required' && <span className='text-error-form'>This field is required!</span>}
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Price of product in AE (*)</label>
                                            <input step='any' type="number" {...register('priceOfProduct', { required: true, valueAsNumber: true })} min={0} className="form-control" placeholder="Set price of product (AE)" />
                                            {errors?.priceOfProduct?.type === 'required' && <span className='text-error-form'>This field is required!</span>}
                                            {errors?.priceOfProduct?.type === 'valueAsNumber' && <span className='text-error-form'>This field input number!</span>}
                                        </div>

                                        <div className="form-group">
                                            <label >Product image URL (*)</label>
                                            <textarea {...register('productImage', { required: true, pattern: regexWebsite, onChange: (e) => { handleChange(e) } })} rows={3} className="form-control" placeholder="Enter image of product, input exactly link of image." />
                                            {errors?.productImage?.type === 'required' && <span className='text-error-form'>This field is required!</span>}
                                            {errors?.productImage?.type === 'pattern' && <span className='text-error-form'>Format link of image incorret!</span>}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div>
                                            <img src={imageProductTemp} className="image-seller-view-product"></img>
                                        </div>
                                    </div>
                                </div>

                                <div className="row mt-4">
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label>Content Delivery URL(Your customer can access these files)(*)</label>
                                            <textarea {...register('contentDelivery', { required: true, pattern: regexWebsite })} rows={3} className="form-control" placeholder="Your customer can access these files" />
                                            {errors?.productImage?.type === 'required' && <span className='text-error-form'>This field is required!</span>}
                                            {errors?.productImage?.type === 'pattern' && <span className='text-error-form'>Format link of image incorret!</span>}
                                        </div>
                                    </div>
                                </div>




                                <div className="form-check form-check-flat form-check-primary">
                                    <label className="form-check-label">
                                        <input {...register('activeProduct')} type="checkbox" className="form-check-input" />
                                        Active (you want to sell it product otherwise it will be hidden)
                                        <i className="input-helper" /></label>
                                </div>

                                <div className='text-center'>
                                    <button type='submit' className="btn btn-success me-2 mt-4" disabled={!isValid}>
                                        <i className='mdi mdi-grease-pencil'></i>
                                        Update product
                                    </button>
                                </div>

                            </form>
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