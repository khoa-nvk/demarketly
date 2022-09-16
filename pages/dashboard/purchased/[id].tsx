import type { ReactElement } from 'react'
import LayoutDashboard from '../../../components/LayoutDashboard'
import type { NextPageWithLayout } from '../../_app'
import { useForm } from 'react-hook-form';
import { useEffect, useState } from "react";
import { useRouter } from 'next/router'


import truncateMiddle from "../../../lib/truncate";

import { useAeternity } from "../../../providers/AeternityProvider";
import Swal from 'sweetalert2'
import LoadingData from '../../../components/LoadingData';

const Page: NextPageWithLayout = () => {

    const router = useRouter()
    const { id } = router.query
    console.log(id)

    const { register, handleSubmit, setValue, getValues, formState: {isValid, errors} } = useForm({mode: 'onChange'});
   

    const regexWebsite = new RegExp(/http[s]?:\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/gm)

    const [dataProductDetail, setDataProductDetail] = useState(null);
    const [imageProductTemp, setImageProductTemp] = useState('');
    const [listFileUpload, setListFileUpload] = useState([]);
    const [loadingData, setLoadingData] = useState(true)

    const [dataDownloadLink,setDataDownloadLink] = useState('')
 
    const dataUserSession = useAeternity()
    
    useEffect(() => {
        if(id) {
            // getProductByID(id)
            getUrlGaiaFromMongoDB(id)
        }
    },[router.query])



    const getUrlGaiaFromMongoDB = async (productID:any) => {

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

        if(response.status == 200) {
            const dataUrlObj = await response.json();
            console.log('listproductDownloadURL', dataUrlObj)
            if(dataUrlObj['document']) {
                if(dataUrlObj['document']['download_links']) {
                    let linkDownload = dataUrlObj['document']['download_links'][0]
                    console.log('linkDownload',linkDownload)
                    setDataDownloadLink(linkDownload)
                    setLoadingData(false)
                }
            }
        }
       
    }

    const getProductByID = async (id:any) => {
        const principal: string = contractOwnerAddress
      
        const productID: StringAsciiCV = stringAsciiCV(id);
      
        console.log('id: ' + id)
  
        // call a read-only function
  
        const fnCall:ReadOnlyFunctionSuccessResponse = await contractsApi.callReadOnlyFunction({
          contractAddress: principal,
          contractName: contractName,
          functionName: 'get-product-by-id',
          readOnlyFunctionArgs: {
            sender: principal,
            arguments: [cvToHex(productID)],
          },
        });
  
        if(fnCall.result !== undefined) {
            let dataProduct:any = hexToCV(fnCall.result)
            console.log(dataProduct)

            let dataFormat = dataProduct['value']['data']
    
            setValue('productName', dataFormat['name'].data, { shouldValidate: true })
            setValue('productDescription', dataFormat['description'].data, { shouldValidate: true })
            setValue('productImage', dataFormat['img'].data, { shouldValidate: true })
            setImageProductTemp(dataFormat['img'].data)
            setValue('priceOfProduct', (Number(dataFormat['price'].value))/1000000, { shouldValidate: true })
            
            let data:any = {
                id: id,
                name: dataFormat['name'].data,
                description: dataFormat['description'].data,
                img: dataFormat['img'].data,
                price: Number(dataFormat['price'].value),
                seller: dataFormat['seller'],
            }
    
            if(dataFormat['is-active'].type  === ClarityType.BoolTrue) {
            data['is-active'] = true
            setValue('activeProduct', true)

            }
            if(dataFormat['is-active'].type  === ClarityType.BoolFalse) {
            data['is-active'] = false
            setValue('activeProduct', false)
            }
            console.log("data: ",data)
            setDataProductDetail(toObject(data))
            console.log(dataProductDetail)
        }
    }
    
    const toObject = (data : object) => {
        return JSON.parse(JSON.stringify(data, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value // return everything else unchanged
        ));
    }
  
    const goToUrl = (url:string) => {
        window.open(url,'_blank');
    }
    

    
    return (
        <div className="row">
            <div className="col-md-10 grid-margin stretch-card">
                <div className="card">
                    <div className="card-body text-center">
                        <h2 className='text-success'>
                        Thank you for purchasing this product!
                        </h2>

                        <h5 className='text-info'>
                        Below are the product files, please download and use them. Thank you!
                        </h5>
                        <div className='mt-5' style={{position: 'relative'}}>
                            <LoadingData loading={loadingData}></LoadingData>
                        </div>
                        <div className='download-link-wrapper'>
                            <a href={dataDownloadLink} target="_blank">{dataDownloadLink}</a>
                            
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