import { useEffect, useState } from "react";
import TableProducts from "./TableProducts";
import TableReviewByBuyer from "./TableReviewBuyer";

export default function ReviewsProducts(props:any) {
  return (
    <div className="row flex-grow">
      <div className="col-12 grid-margin stretch-card">
        <div className="card card-rounded">
          <div className="card-body">
            <div className="d-sm-flex justify-content-between align-items-start">
              <div>
                <h4 className="card-title card-title-dash">
                  Your Products Review
                </h4>
                <p className="card-subtitle card-subtitle-dash">
                  List of all your review you have added on other products
                </p>
              </div>
            </div>
            <div className="table-responsive  mt-1">
                <TableReviewByBuyer dataTable={props.templateListReview} ></TableReviewByBuyer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
