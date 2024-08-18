let TestResponses = require('../Models/test.model');



let getTestResponse = (req, res) => {
    res.send(TestResponses);
}




module.exports = { getTestResponse };