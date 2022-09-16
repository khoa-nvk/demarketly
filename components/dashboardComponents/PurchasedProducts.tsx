
import TableProducts from "./TableProducts";

export default function PurchasedProducts(props:any) {

  return (
    <div className="row flex-grow">
      <div className="col-12 grid-margin stretch-card">
        <div className="card card-rounded">
          <div className="card-body">
            <div className="d-sm-flex justify-content-between align-items-start">
              <div>
                <h4 className="card-title card-title-dash">
                Purchased Products
                </h4>
                <p className="card-subtitle card-subtitle-dash">
                    List of all products you have purchased
                </p>
              </div>
            </div>
            <div className="table-responsive  mt-1" style={{position: 'relative'}}>
                <TableProducts dataTable={props.templateListProduct} mode='purchased'></TableProducts>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
