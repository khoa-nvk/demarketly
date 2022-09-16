export default function ReviewStatisticComponent(props: any) {

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
            <td>
              <div className="d-flex ">
                <img className="img-prod" src={item['product']['img']} alt="" />
                <div>
                  <h6>{truncateString(item['product']['name'],30)}</h6>
                  <p>Id: {item['product']['id']}</p>
                </div>
              </div>
            </td>
            <td>
              <h6>{truncateString(item['review']['reviewer'],20)}</h6>
            </td>
            <td>
              <h6>{item['review']['content']}</h6>
            </td>
            <td>
            <h6>{(Number(item['review']['star']))} stars</h6>
            </td>
          </tr>
        )
      })    
    } else {
      return (
        <tr className="no-data">
            You have no transaction at all.
        </tr>
      )
    }
  }

  return (

    <div className="row flex-grow">
    <div className="col-12 grid-margin stretch-card">
      <div className="card card-rounded">
        <div className="card-body">
          <div className="d-sm-flex justify-content-between align-items-start">
            <div>
              <h4 className="card-title card-title-dash">
                All reviews of product
              </h4>
              <p className="card-subtitle card-subtitle-dash">
                List all reviews of all products
              </p>
            </div>
          </div>
          <div className="table-responsive  mt-1">
            <table className="table select-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Address review</th>
                  <th>Content</th>
                  <th>Star</th>
                  {/* <th>Status</th> */}
                </tr>
              </thead>
              <tbody>
                {renderRowTable()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
</div>
  )
}
