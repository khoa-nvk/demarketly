import Link from "next/link";
import { useEffect, useState } from "react";
import ReactStars from "react-star-rating-component";

export default function TableReviewByBuyer(props:any) {

  console.log('datatable buyer', props.dataTable)
  
  const truncateString = (text:string, numberChars:number) => {
    if(text) {
      let p_1 =  text.slice(0,numberChars)
      return p_1 + '...'
    } 
    return ''
  }
  

  const renderRowTable = () => {
    if(props.dataTable.length >0) {
       return props.dataTable.map((item:any,index:number) => {
        return (
          <tr key={index} className="row-table-product-buyer">
            <td style={{width: '30%'}}>
              <div className="d-flex ">
                <img className="img-prod" src={item['img']} alt="" />
                <div>
                  <h6>{truncateString(item['name'],30)}</h6>
                  <p>Id:{truncateString(item['id'],30)}</p>
                </div>
              </div>
            </td>
            <td style={{width: '30%', whiteSpace: 'break-spaces'}}>
              <h6>{item['content']}</h6>
            </td>
            <td style={{width: '20%'}}> 
              <ReactStars name={'rate' + index} editing={false} starCount={5} value={item.star} starColor={'#ffd700'}></ReactStars>
            </td>
            <td style={{width: '20%'}}>
                <Link href={'/detail-product/' + item['id']}>
                  <button className="button-view-detail-table flex btn btn-otline-dark align-items-center">
                    <i className="mdi mdi-eye" />
                    View
                  </button>
                </Link>
            </td>
          </tr>
        )
      })    
    } else {
      return <></>
    }
  }
 
  const renderNoData = () => {
    if( props.dataTable.length ==0) {
      return (
        <div className="text-danger">You don't review any product. Let review to help people!</div>
      )
    } else {
      return <></>
    }
  }

  return (
    <div>
      <table className="table select-table table-hover">
          <thead>
            <tr>
              <th>Product</th>
              <th>Review content</th>
              <th>Review star</th>
              <th>View Product Details</th>
            </tr>
          </thead>
          <tbody>
            {renderRowTable()}
          </tbody>
      </table>
      {renderNoData()}
    </div>
  )
}
