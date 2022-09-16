import { useEffect, useState } from "react";
import Link from 'next/link'

export default function TableCoupons(props: any) {

  console.log('datatable', props.dataTable)


  const renderColValueTable = (valueAmount: number) => {
    return (
      <h6>
        {Number(valueAmount) / (10 ** 18)} <span className="text-success">AE</span>
      </h6>
    )
  }


  const renderRowTable = () => {
    if (props.dataTable.length > 0) {
      return props.dataTable.map((item: any, index: number) => {
        return (
          <tr key={index} className="row-table-coupons">
            <td>
              <h6>
                {item['code']}
              </h6>
            </td>
            <td>
              {renderColValueTable(item['discount_amount'])}
            </td>
            <td>
              <h6>{item['allowed_uses']}</h6>
            </td>
            <td>
              <Link href={'/seller/catalog/coupon/' + item['product_id'] + '/' + item['code']}>
                <button style={{ display: 'flex' }} className="button-view-detail-table btn-sm flex btn btn-warning btn-otline-dark align-items-center">
                  <i className="mdi mdi-grease-pencil mr-1" />
                  Edit
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
    if (props.dataTable.length == 0) {
      return (
        <div className="text-danger">You don't have any coupons yet. Let's create!</div>
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
            <th>Code</th>
            <th>Discount Amount</th>
            <th>Times Used</th>
            <th>Edit</th>
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
