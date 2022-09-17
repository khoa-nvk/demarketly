
import { useAeternity } from "../../providers/AeternityProvider"
import { useEffect, useState } from "react";

export default function Statistics() {

  const dataUserSession = useAeternity()

  const [numberTotalProduct, setNumberTotalProduct] = useState(0)
  const [numberTotalProductSale, setNumberTotalProductSale] = useState(0)
  const [numberTotalProductSaleValue, setNumberTotalProductSaleValue] = useState(0)

  useEffect(() => {
    if (dataUserSession.contractInstance) {
      getNumberTotalProduct()
      getNumberTotalProductSale()
      getNumberTotalProductSaleValue()
    }
  }, [dataUserSession.contractInstance])

  const getNumberTotalProduct = async () => {
    let tx_totalNumberProduct = await dataUserSession.contractInstance.methods.get_total_products()
    console.log('tx_totalNumberProduct', Number(tx_totalNumberProduct.decodedResult))
    setNumberTotalProduct(Number(tx_totalNumberProduct.decodedResult))
  }

  const getNumberTotalProductSale = async () => {
    let tx_totalNumberProductSale = await dataUserSession.contractInstance.methods.get_total_product_sale()
    console.log('tx_totalNumberProductSale', Number(tx_totalNumberProductSale.decodedResult))
    setNumberTotalProductSale(Number(tx_totalNumberProductSale.decodedResult))
  }

  const getNumberTotalProductSaleValue = async () => {
    let tx_totalNumberProductSaleValue = await dataUserSession.contractInstance.methods.get_total_sale()
    console.log('tx_totalNumberProductSaleValue', Number(tx_totalNumberProductSaleValue.decodedResult))
    setNumberTotalProductSaleValue(Number(tx_totalNumberProductSaleValue.decodedResult) / (10**18))
  }



  return (
    <div style={{ backgroundColor: '#060125;' }}>
      <section className="seller-wrap pt-100 pb-75">
        <img src="/img/shape/section-shape-1.png" alt="Image" className="section-shape" />

        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-4 col-lg-6 col-md-6" data-aos="fade-up" data-aos-duration={1200} data-aos-delay={200}>
              <div className="seller-card">
                <div className="seller-img">
                  <img src="/img/statistic/gift.png" alt="Image" />
                </div>
                <div className="seller-info text-center">
                  <div className="t-1">Total Product</div>
                  <div className="t-2">{numberTotalProduct}</div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-6 col-md-6" data-aos="fade-up" data-aos-duration={1200} data-aos-delay={300}>
              <div className="seller-card">
                <div className="seller-img">
                  <img src="img/statistic/shopping-bag.png" alt="Image" />

                </div>
                <div className="seller-info text-center" >
                  <div className="t-1">Total Product Sale</div>
                  <div className="t-2">{numberTotalProductSale}</div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-6 col-md-6" data-aos="fade-up" data-aos-duration={1200} data-aos-delay={400}>
              <div className="seller-card">
                <div className="seller-img">
                  <img src="/img/statistic/budget.png" alt="Image" />

                </div>
                <div className="seller-info text-center">
                  <div className="t-1">Total Value Sale</div>
                  <div className="t-2">{numberTotalProductSaleValue} AE</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
