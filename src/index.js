const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const request = require('request');

function handleMessage (sender_psid, message) {
    let response;

    // Check if the message contains text
    if (received_message.text) {    
  
      // Create the payload for a basic text message
      response = {
        "text": `You sent the message: "${received_message.text}". Now send me an image!`
      }
    }  
    
    // Sends the response message
    callSendAPI(sender_psid, response);
}
function handlePostback(sender_psid, message) {

}
function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": response
    }
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": "EAAlqqZCaGNKkBAEXz1vOV8exkuiZAQ9aiEXbZAaNW89w0Rk80Hmm2iRH9zjOKQmp2LpvWNSD9UmZBCsZArMqyJMc85k1ldY8ZCuXPjOWlBJbqLItyAwO5JOSV6wTDTZBYtFHVMQZAMFIbKzCXMnQilkGRlJ98wiIviZA3p93Yx4GZCe2lT4PcZAIjHd" },
        "method": "POST",
        "json": request_body
      }, (err, res, body) => {
        if (!err) {
          console.log('message sent!')
        } else {
          console.error("Unable to send message:" + err);
        }
      });
}
  
const Router = express.Router();
app.use(bodyParser.json());

Router.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, '../src', 'index.html'));
})
Router.get('/hooks', (req, res, next) => {
    res.status(200).json({ test: "test" });
})
Router.post('/webhook', (req, res) => {

    let body = req.body;
    console.log(body);
    // Checks this is an event from a page subscription
    if (body && body.object && body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function (entry) {

            // Gets the message. entry.messaging is an array, but 
            // will only ever contain one message, so we get index 0
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);
        });
        // Get the sender PSID
        let sender_psid = webhook_event.sender.id;
        console.log('Sender PSID: ' + sender_psid);
        // Check if the event is a message or postback and
        // pass the event to the appropriate handler function
        if (webhook_event.message) {
            handleMessage(sender_psid, webhook_event.message);
        } else if (webhook_event.postback) {
            handlePostback(sender_psid, webhook_event.postback);
        }

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
});
Router.get('/webhook', (req, res) => {
    console.log("12312");
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "<YOUR_VERIFY_TOKEN>"

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});
app.use(Router);

app.listen(3000, () => {
    console.log(" Server start on 3000");
});