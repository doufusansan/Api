var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'awei.fun api'
  });
});
// router.get('/socket', function (req, res, next) {
//   res.render('socket');
// });



// router.get('/icard', function(req, res, next) {
//   request('http://icard.gz-zlan.com/icard.html#/', function (error, response, body) {
//     // console.log('error:', error); // Print the error if one occurred
//     // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//     // console.log('body:', body); // Print the HTML for the Google homepage.
//     res.render('index',{body:body})
//   });
// });




module.exports = router;