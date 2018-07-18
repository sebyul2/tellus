$(document).ready(function() {

  const dataSet = {
    dailyStock: [],
    dayDate: [],
    dailyEndPrice: [],
    stockTable: [],
    stockInfo: {},
    queryTime: null
  
  }
  // daily 주가
  axios.get('/api/stock')
    .then(function(res) {
      let dailyStock = res.data.stockprice.TBL_DailyStock[0].DailyStock
      dailyStock = dailyStock.map(function(item) {
        let dayDate = item['$'].day_Date.split('/')
        dataSet.dayDate.push(dayDate[1] + '/' + dayDate[2])
        dataSet.dailyEndPrice.push(parseInt(item['$'].day_EndPrice.replace(/,/gi, '')))
        return item['$']
      })
      dataSet.dailyStock = dailyStock
      dataSet.dayDate = dataSet.dayDate.reverse()
      dataSet.dailyEndPrice = dataSet.dailyEndPrice.reverse()
      dataSet.queryTime = res.data.stockprice['$'].querytime
      dataSet.stockInfo = res.data.stockprice.TBL_StockInfo[0]['$']
      dataSet.stockTable = [
        [
          res.data.stockprice.TBL_StockInfo[0]['$'].StartJuka,
          res.data.stockprice.TBL_StockInfo[0]['$'].HighJuka,
          res.data.stockprice.TBL_StockInfo[0]['$'].LowJuka,
          res.data.stockprice.TBL_StockInfo[0]['$'].Volume,
          Math.round(parseInt(res.data.stockprice.TBL_StockInfo[0]['$'].Amount.replace(/,/gi, '')) 
          * parseInt(res.data.stockprice.TBL_StockInfo[0]['$'].CurJuka.replace(/,/gi, '')) / 100000000) + '억'
          // 억단위로 나누기
        ]
      ]
      console.log(res.data)
      // console.log(dataSet.dailyEndPrice)
      // console.log(dataSet.dayDate)

      // stock data
      $('#stock-label').html(dataSet.stockInfo.JongName + '&nbsp' + '<span>' + 196450 + '</span>')
      $('#cur-price').text(dataSet.stockInfo.CurJuka)
      switch (dataSet.stockInfo.DungRak) {
        case '1':
        case '2':
          $('#price-icon').attr('class', 'icon-end-price-up')
          $('#cur-price').attr('class', 'text-end-price-up')
          $('#icon-debi').attr('class', 'icon-debi-up')
          $('#text-debi').attr('class', 'text-debi-up')
          $('#text-dr').attr('class', 'text-dr-up')
          break
        case '4':
        case '5':
          $('#price-icon').attr('class', 'icon-end-price-down')
          $('#cur-price').attr('class', 'text-end-price-down')
          $('#icon-debi').attr('class', 'icon-debi-down')
          $('#text-debi').attr('class', 'text-debi-down')
          $('#text-dr').attr('class', 'text-dr-down')
          break
        case '3':
        default:
          $('#price-icon').attr('class', 'icon-end-price-equal')
          $('#cur-price').attr('class', 'text-end-price-equal')
          $('#icon-debi').attr('class', 'icon-debi-equal')
          $('#text-debi').attr('class', 'text-debi-equal')
          $('#text-dr').attr('class', 'text-dr-equal')

      }
      $('#text-debi').text(dataSet.stockInfo.Debi)
      $('#text-dr').text(dataSet.stockInfo.DungRak ? (parseInt(dataSet.stockInfo.Debi) / parseInt(dataSet.stockInfo.PrevJuka.replace(/,/gi, '')) * 100).toFixed(2) : 0)
      $('#query-time').text(dataSet.queryTime + ' 기준')

      // stock 테이블
      $('#stock-table').DataTable({
        data: dataSet.stockTable,
        ordering: false,
        searching: false,
        paging: false,
        bInfo: false,
        columns: [{
            title: "시가"
          },
          {
            title: "고가"
          },
          {
            title: "저가"
          },
          {
            title: "거래량"
          },
          {
            title: "시가총액"
          }
        ]
      })
      // daily 테이블
      $('#daily').DataTable({
        data: dataSet.dailyStock,
        ordering: false,
        searching: false,
        paging: false,
        bInfo: false,
        columns: [{
            data: "day_Date",
            title: "일자",
            width: "5%"
          },
          {
            data: "day_EndPrice",
            title: "종가",
            width: "12%"
          },
          {
            data: "day_getDebi",
            title: "전일대비",
            width: "10%",
            fnCreatedCell: function(nTd, sData, oData, iRow, iCol) {
              switch (oData.day_Dungrak) {
                case '1':
                case '2':
                  $(nTd).html("<span class='debi up'>" + sData + "</span>")
                  break;
                case '4':
                case '5':
                  $(nTd).html("<span class='debi down'>" + sData + "</span>")
                  break;
                case '3':
                  $(nTd).html("<span class='debi equal'>" + sData + "</span >")
                  break;
              }
            }
          },
          {
            data: "day_Volume",
            title: "거래량",
            width: "10%"
          },
          {
            data: "day_getAmount",
            title: "거래대금(백만)",
            width: "15%"
          },
          {
            data: "day_Start",
            title: "시가",
            width: "12%"
          },
          {
            data: "day_High",
            title: "고가",
            width: "12%"
          },
          {
            data: "day_Low",
            title: "저가",
            width: "12%"
          },
        ]
      })

      // 차트 정보
      let ctx = document.getElementById("stockChart");
      let stockChart;
      stockChart = new Chart(ctx, {
        "type": "line",
        "data": {
          "labels": dataSet.dayDate,
          "datasets": [{
            "label": "My First Dataset",
            "data": dataSet.dailyEndPrice,
            "fill": false,
            "borderColor": "#235cf8",
            "lineTension": 0.05
          }]
        },
        "options": {
          legend: {
            display: false
          },
          tooltips: {
            callbacks: {
              label: function(tooltipItem) {
                return tooltipItem.yLabel;
              }
            }
          }
        }
      });

    })
    .catch(function(err) {})
})