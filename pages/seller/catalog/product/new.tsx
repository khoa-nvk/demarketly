import type { ReactElement } from 'react'
import LayoutDashboard from '../../../../components/LayoutDashboard'
import type { NextPageWithLayout } from '../../../_app'
import { useForm } from 'react-hook-form';
import { useEffect, useState } from "react";

import truncateMiddle from "../../../../lib/truncate";
import { v4 as uuidv4 } from 'uuid'
import DataProductTemp from '../../../../data_temp/data_product'
import { useAeternity } from "../../../../providers/AeternityProvider";
import Swal from 'sweetalert2'
import { useRouter } from 'next/router';
import LoadingData from '../../../../components/LoadingData';




const Page: NextPageWithLayout = () => {
    console.log('new-product')


    const { register, handleSubmit, setValue, getValues, formState: { isValid, errors } } = useForm({ mode: 'onChange' });
    const regexWebsite = new RegExp(/http[s]?:\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/gm)
    const [imageProductTemp, setImageProductTemp] = useState('');
    const [listFileUpload, setListFileUpload] = useState([]);
    const [loadingData, setLoadingData] = useState(false)

    const dataUserSession = useAeternity()
    const router = useRouter()

    useEffect(() => {

    }, [])


    const handleCreateProduct = (dataForm: any) => {
        console.log("dataForm", dataForm)
        createProduct(dataForm)
    }

    const initRandomId = () => {
        let myuuid = uuidv4();
        return 'Product' + myuuid
    }


    const createProduct = async (dataProduct: any) => {
        setLoadingData(true)
        try {
            let id = initRandomId()
            let tx_create_product = await dataUserSession.contractInstance.methods.create_product(
                id,
                dataProduct['productName'],
                Number(dataProduct['priceOfProduct'] * (10 ** 18)),
                dataProduct['productDescription'],
                dataProduct['productImage'],
                dataProduct['activeProduct']
            )
            if (tx_create_product) {
                uploadUrlGaiaToMongoDB(id, dataProduct['contentDelivery'])
                setLoadingData(false)
                Swal.fire({
                    icon: 'success',
                    title: 'Creating products on blockchain, please wait a moment!',
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
                // router.push('/seller/catalog/products')
            })
        }
    }

    const handleChange = (event: any) => {
        setImageProductTemp(event.target.value)
    }

    const setTempDataForProduct = () => {
        let lengthData = DataProductTemp.length
        let randomProductIndex = Math.floor((Math.random() * lengthData));
        let dataProductTemp = DataProductTemp[randomProductIndex]

        setValue('productName', dataProductTemp['name'], { shouldValidate: true })
        setValue('productDescription', dataProductTemp['description'], { shouldValidate: true })
        setValue('priceOfProduct', dataProductTemp['price'], { shouldValidate: true })
        setValue('productImage', dataProductTemp['img'], { shouldValidate: true })
        setValue('activeProduct', true, { shouldValidate: true })
        setImageProductTemp(dataProductTemp['img'])

    }

    const toObject = (data: object) => {
        return JSON.parse(JSON.stringify(data, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value // return everything else unchanged
        ));
    }

    const uploadUrlGaiaToMongoDB = async (productID: string, deliveryContent: string) => {

        const data = {
            "product_id": productID,
            "download_links": [deliveryContent]
        }

        const response = await fetch('https://paydii-api.herokuapp.com/insertOne', {
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

    return (
        <div className="row">
            <div className="col-md-10 grid-margin stretch-card">
                <div className="card">
                    <div className="card-body">
                        <LoadingData loading={loadingData}></LoadingData>
                        <form className="forms-seller-product" onSubmit={handleSubmit(handleCreateProduct)}>
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





                            <div className="form-check form-check-flat form-check-primary">
                                <label className="form-check-label">
                                    <input {...register('activeProduct')} type="checkbox" className="form-check-input" />
                                    Active (you want to sell it product otherwise it will be hidden)
                                    <i className="input-helper" /></label>
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

                            <div className='text-center'>
                                <button type='submit' className="btn btn-success me-2 mt-4" disabled={!isValid}>
                                    <i className='mdi mdi-grease-pencil'></i>
                                    Create product
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>

            <div className="col-md-2">
                <button type="button" className="btn btn-info btn-fw" onClick={() => setTempDataForProduct()} >Use sample data</button>
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
