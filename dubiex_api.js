const request = require('request');

module.exports = {
  getMarkets: getMarkets,
  getOrders: getOrders
}

function getMarkets(limit){
  var limit = limit || 50;
  return new Promise(function(resolve, reject) {
    request.get({
      url: 'https://api.dubiex.com/api/markets?limit=' + limit,
      json: true
    }, (error, response, body) => {
      if (error) {
        reject(error)
        return;
      }
      resolve(body.result)
    })
  });
}

function getOrders(pairA, pairB){
  return new Promise(function(resolve, reject) {
    var pairA = pairA || '0x7641b2Ca9DDD58adDf6e3381c1F994Aac5f1A32f'
    var pairB = pairB || '0x0000000000000000000000000000000000000000'
    var limit = 5
    var nonZero = true
    var page = 1;
    _requestOrders(pairA, pairB, limit, nonZero, page)
    .then(body => {
      if (body.pageCount > 1) {
        var pageRequests = []
        for (var pageIdx = 2; pageIdx <= body.pageCount; pageIdx++) {
          pageRequests.push(_requestOrders(pairA, pairB, limit, nonZero, pageIdx))
        }
        Promise.all(pageRequests)
        .then(bodies => resolve(body.result.concat(bodies.reduce((orderAccum, b) => orderAccum.concat(b.result), []))))
      }
    })
  });
}


function _requestOrders(pairA, pairB, limit, nonZero, page){
  return new Promise(function(resolve, reject) {
    var url = 'https://api.dubiex.com/api/orders/status/query/all/' + pairA + '/' + pairB + '?limit=' + limit + '&page=' + page + '&nonzero=' + nonZero + '/';
    request.get({
      url: url,
      json: true
    }, (error, response, body) => {
      if (error) {
        reject(error)
      }
      if (response.statusCode !== 200) {
        reject(new Error("status code: " + response.statusCode))
      }
      resolve(body)
    })
  });
}
