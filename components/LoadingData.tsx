import { useEffect, useState } from 'react'
import { Bars } from  'react-loader-spinner'

export default function LoadingData(props:any) {

  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    setLoadingData(props.loading)
  }, [props.loading]);

  return (
    <div className={loadingData == true?'loading-wrapper': 'display-none'} >
      <Bars
        height="40"
        width="40"
        color="#4fa94d"
        ariaLabel="bars-loading"
        wrapperStyle={{width: '100%', justifyContent: 'center'}}
        wrapperClass=""
        visible={loadingData}
      ></Bars>
    </div>
  )
}
