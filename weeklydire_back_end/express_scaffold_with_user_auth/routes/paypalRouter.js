const express = require("express");
const paypalRouter = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const authenticate = require("../authenticate");
const dotenv = require('dotenv').config();
const fetch = require('node-fetch');

const paypalClientId = process.env.PAYPAL_CLIENT_ID;
const paypalSecretKey = process.env.PAYPAL_SECRET_KEY;

const paypalApiUrl = "https://api-m.sandbox.paypal.com"

const paypalOptions = {
    clientId: paypalClientId,
    currency: "USD",
    intent: "capture",
}

paypalRouter.route('/api/config')
    .get((req, res, next) => {
        res.json(paypalOptions);
    })

paypalRouter.route('/premiumCheck')
    .get(authenticate.verifyUser, (req, res, next) => {

        if (req.user.premiumUser) {
            res.statusCode = 200;
            res.end("True")
        }
        res.end('Check console for paypal info')
    })








    // Copied below from paypalserver

/*{generateAccessToken}*/

const generateAccessToken = async () => {
    const authUrl = 'https://api-m.sandbox.paypal.com/v1/oauth2/token';
    const clientIdAndSecret = `${paypalClientId}:${paypalSecretKey}`;
    const base64 = Buffer.from(clientIdAndSecret).toString('base64');

    return fetch(authUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Accept-Language': 'en_US',
            'Authorization': `Basic ${base64}`,
        },
        body: 'grant_type=client_credentials'
    })
    .then(response => response.json())
    .then(data => data.access_token)
    .catch(() => console.log("Couldn't get auth token."))
}

async function handleResponse(response) {
    try {
      const jsonResponse = await response.json();
      return {
        jsonResponse,
        httpStatusCode: response.status,
      };
    } catch (err) {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }
  }
  
  /**
   * Create an order to start the transaction.
   * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
   */
  const createOrder = async (cart) => {
    // use the cart information passed from the front-end to calculate the purchase unit details
    console.log(
      "shopping cart information passed from the frontend createOrder() callback:",
      cart
    );
  
    const accessToken = await generateAccessToken();
    console.log('access token is ' + accessToken);
    const url = paypalApiUrl + `/v2/checkout/orders`;
  
    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: "100"
          }
        }
      ]
    };


    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        // Uncomment one of these to force an error for negative testing (in sandbox mode only).
        // Documentation: https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
        // "PayPal-Mock-Response": '{"mock_application_codes": "MISSING_REQUIRED_PARAMETER"}'
        // "PayPal-Mock-Response": '{"mock_application_codes": "PERMISSION_DENIED"}'
        // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
      },
      method: "POST",
      body: JSON.stringify(payload),
    });
  
    return handleResponse(response);
  };
  
  // createOrder route
  paypalRouter.route('/api/orders')
  .post(async (req, res) => {
    try {
      // use the cart information passed from the front-end to calculate the order amount detals
      const { cart } = req.body;
      const { jsonResponse, httpStatusCode } = await createOrder(cart);
      console.log(jsonResponse)
      res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
      console.error("Failed to create order:", error);
      res.status(500).json({ error: "Failed to create order." });
    }
  });
  
  /**
   * Capture payment for the created order to complete the transaction.
   * @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
   */
  const captureOrder = async (orderID) => {
    const accessToken = await generateAccessToken();
    console.log('Access token:');
    console.log(accessToken);
    const url = `${paypalApiUrl}/v2/checkout/orders/${orderID}/capture`;
  
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        // Uncomment one of these to force an error for negative testing (in sandbox mode only).
        // Documentation:
        // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
        // "PayPal-Mock-Response": '{"mock_application_codes": "INSTRUMENT_DECLINED"}'
        // "PayPal-Mock-Response": '{"mock_application_codes": "TRANSACTION_REFUSED"}'
        // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
      },
    });
  
    return handleResponse(response);
  };
  
  // captureOrder route
  paypalRouter.route('/api/orders/:orderID/capture')
  .post(async (req, res) => {
    try {
      const { orderID } = req.params;
      const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
      res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
      console.error("Failed to create order:", error);
      res.status(500).json({ error: "Failed to capture order." });
    }
  }); 
  
  // serve index.html
  paypalRouter.route('/')
  .get((req, res) => {
    res.sendFile(path.resolve("./checkout.html"));
  });

module.exports = paypalRouter;
