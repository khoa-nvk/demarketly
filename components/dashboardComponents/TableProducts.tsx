import { useEffect, useState } from "react";
import Link from 'next/link'

export default function TableProducts(props:any) {

  console.log('datatable buyer', props.dataTable)
  
  const truncateString = (text:string, numberChars:number) => {
    if(text.length <= numberChars) {
      return text
    }
    
    if(text) {
      let p_1 =  text.slice(0,numberChars)
      return p_1 + '...'
    } 
    return ''
  }
  const renderStatusProduct = (isActive:boolean) => {
    if(isActive) {
      return(
        <div>
         <label className="badge badge-success p-2">Active</label>
        </div>
      )
    } else {
      return(
        <div>
          <label className="badge badge-danger p-2">Inactive</label>
        </div>
      )
    }
    return (<></>)
  }

  const renderViewDetail = (id:any) => {
    if(props.mode == 'standard') {
      return (
        <td>
          <Link href={'/seller/catalog/product/' + id}>
            <button className="button-view-detail-table btn-sm flex btn btn-info btn-otline-dark align-items-center">
              <i className="mdi mdi-tooltip-edit" />
                Update
            </button>
          </Link>
        </td>
      )
    }

    if(props.mode == 'purchased') {
      return (
        <td>
          <Link href={'/dashboard/purchased/' + id}>
            <button className="button-view-detail-table btn-sm flex btn btn-info btn-otline-dark align-items-center">
              <i className="mdi mdi-eye" />
                View detail
            </button>
          </Link>
        </td>
      )
    }
    
  }

  const renderRowTable = () => {
    if(props.dataTable.length >0) {
       return props.dataTable.map((item:any,index:number) => {
        return (
          <tr key={index} className="row-table-product-buyer">
            <td>
              <div className="d-flex ">
                <img className="img-prod" src={item['img']} alt="" />
                <div>
                  <h6>{truncateString(item['name'], 50)}</h6>
                  <p>Id: {item['id']}</p>
                </div>
              </div>
            </td>
            <td>
              <h6>{truncateString(item['description'], 30)}</h6>
            </td>
            <td>
              {renderStatusProduct(item['is_active'])}
            </td>
            {renderViewDetail(item['id'])}
            <td>
              <Link href={item['urlBuy']}>
                <button className="button-view-detail-table btn-sm flex btn btn-warning btn-otline-dark align-items-center">
                  <i className="mdi mdi-eye" />
                    View on site
                </button>
              </Link>
            </td>
          </tr>
        )
      })    
    } else {

      if(props.mode == 'standard') {
        return (
          <tr className="no-data">
              You have no products at all. Let's create new to experience more
          </tr>
        )
      }

      if(props.mode == 'purchased') {
        return (
          <tr className="no-data">
              You have not purchased any products yet. Buy the product to see the data here
          </tr>
        )
      }

    }
  }
 

  return (
    <table className="table select-table table-hover">
        <thead>
          <tr>
            <th>Product</th>
            <th>Description</th>
            <th>Product Status</th>
            <th>Update Product</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          {renderRowTable()}
        </tbody>
      </table>
  )
}
