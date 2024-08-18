let express = require('express');
let testRouter = require('./Routes/test.route');

app = express();


app.use('/test', testRouter);



const PORT = 3000;



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}......`);
})