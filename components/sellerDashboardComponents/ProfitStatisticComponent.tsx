import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function ProfitStatisticComponent(props: any) {

  const canvasEl = useRef(null);

  const [instanceChart, setInstanceChart] = useState(null)

  useEffect(() => {

    if (props.data) {
      if(instanceChart) {
        instanceChart.destroy()
      }
      if (props.data.length > 0) {
        let listLabel: any[] = []
        let listValue: any[] = []

        props.data.forEach((item: any) => {
          listLabel.push(item.product_name)
          listValue.push(item.profit_price/(10**18))
        })

        initDataChart(listLabel, listValue)
      }
    }

  }, [props.data]);

  const initDataChart = (labelsData: any[], valueData: any[]) => {
    const ctx = canvasEl.current.getContext("2d");

    const labels = labelsData

    const data = {
      labels: labels,
      datasets: [{
        data: valueData,
        backgroundColor: [
          'rgb(124, 130, 86)',
          'rgb(124, 205, 93)',
          'rgb(124, 205, 150)',
          'rgb(124, 205, 160)',
          'rgb(170, 205, 86)',
          'rgb(124, 140, 86)',
          'rgb(150, 205, 86)',
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
          'rgb(255, 12, 86)',
          'rgb(124, 205, 86)',
          'rgb(150, 205, 86)',
        ],
        hoverOffset: 4
      }]
    };

    const config = {
      type: 'doughnut',
      data: data,
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
            padding: 2,
            labels: {
              pointStyle: 'circle',
              usePointStyle: true,
            }
          },
          title: {
            display: false
          }
        }

      },

    };
    const myLineChart = new Chart(ctx, config);

    setInstanceChart(myLineChart)


    return function cleanup() {
      myLineChart.destroy();
    };
  }

  return (
    <div className="row">
      <div className="col-lg-12 d-flex flex-column">
        <div className="row flex-grow">
          <div className="col-12 col-lg-4 col-lg-12 grid-margin stretch-card">
            <div className="card card-rounded">
              <div className="card-body">
                <div className="d-sm-flex justify-content-between align-items-start">
                  <div>
                    <h3 className="card-title card-title-dash">Profit infomation </h3>
                    <p className="card-subtitle card-subtitle-dash">
                      Detail profit of each product
                    </p>
                  </div>
                  <div id="performance-line-legend" />
                </div>
                <div className="chartjs-wrapper mt-3">
                  <canvas id="chartProfit" ref={canvasEl} height="100" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
