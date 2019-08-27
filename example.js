var Bitpanda = require('./bitpanda.js');
var publicBitpanda = new Bitpanda();


publicBitpanda.time(console.log)
// publicBitpanda.fees(console.log)
// publicBitpanda.currencies(console.log)
// publicBitpanda.instruments(console.log)
// publicBitpanda.oderBook('BTC_EUR', { level: '1' }, console.log)
// publicBitpanda.candlesticks('BTC_EUR', { unit: 'HOURS', period: '1', from: '2019-08-07T00:00:00.080Z', to: '2019-08-08T00:00:00.090Z' }, console.log)

var key = 'your-API-KEY';
var timeout = 10000;
var host = 'api.exchange.bitpanda.com';
var privateBitpanda = new Bitpanda(key, timeout, host);

//ALL COMMENTED OUT FOR SAVETY RESONS

// privateBitpanda.getBalances(console.log)
// privateBitpanda.getAccountFees(console.log)
// privateBitpanda.getOrders('BTC_EUR', {}, console.log) // Only open BTC_EUR Orders
// privateBitpanda.getOrders(null, {}, console.log) // ALL open Orders
// privateBitpanda.getOrders('BTC_EUR', { from: '2019-08-20T00:00:00.080Z', to: '2019-08-25T00:00:00.090Z', with_cancelled_and_rejected: 'true', with_just_filled_inactive: 'true', max_page_size: '100' }, console.log) // All Options example
// privateBitpanda.getOrderByID('a23c649b-83cb-4cdf-ad85-e0ce81d5b08e', console.log) // Returns one OrderBy his OrderId
// privateBitpanda.getTradesByOrderID('5b7fec58-f0c4-4440-a256-8f289ffb6799', console.log) //Returns trades of the OrderId
// privateBitpanda.getTrades({}, console.log) //Last 100 Trades
// privateBitpanda.getTrades({ from: '2019-08-10T00:00:00.080Z', to: '2019-08-25T00:00:00.090Z' }, console.log) //Trades in Time period
// privateBitpanda.getTradeByID('0ee4a592-f9bb-4e29-bc63-fac14d475c06', console.log) //retuns the Traid Info for the TradeId
// privateBitpanda.getTraidingVolume(console.log)//Get current Traiding Volume
// privateBitpanda.postOrder({ instrument_code: 'BTC_EUR', side: 'BUY', type: 'LIMIT', amount: '11', price: '1.00' }, console.log) //creates a new Order acording to the request Body
// privateBitpanda.deleteOrders('ETH_EUR', console.log) //closes all ordes in ETH_EUR Market
// privateBitpanda.deleteOrders(null, console.log) //Closes all 
// privateBitpanda.deleteOrderByID('d03d37b5-c0b8-4656-bb8b-192ca928e290', console.log) //closes the Order with the specified ID
