const {getMarkets} = require('./dubiex_api.js')

getMarkets(50)
.then(markets => console.log(markets))
.catch(error => console.error(error))
