const express = require("express");
const paypalRouter = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const authenticate = require("../authenticate");
const dotenv = require('dotenv').config();
const fetch = require('node-fetch');
const User = require('../models/User');

const paypalClientId = process.env.PAYPAL_CLIENT_ID;
const paypalSecretKey = process.env.PAYPAL_SECRET_KEY;

const paypalApiUrl = "https://api-m.sandbox.paypal.com"

const paypalOptions = {
    clientId: paypalClientId,
    currency: "USD",
    intent: "capture",
}

paypalRouter.route('/api/config')
    .get(authenticate.verifyUser, (req, res, next) => {
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

    // console.log(
    //   "shopping cart information passed from the frontend createOrder() callback:",
    //   cart
    // );
  
    const accessToken = await generateAccessToken();
    const url = paypalApiUrl + `/v2/checkout/orders`;
  
    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: "5"
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
  // Added authenticate.verifyuser to make sure someone is logged in
  .post(
    async (req, res) => {

    try {
      // use the cart information passed from the front-end to calculate the order amount details
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
  paypalRouter.route(`/api/orders/:orderID/capture/:userId`)
  // Added authenticate.verifyUser to make sure a user is logged in and provide user._id?
  .post(async (req, res) => {
    try {
      const { orderID, userId } = req.params;
      const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
      console.log(httpStatusCode)

        switch (httpStatusCode) {
            case 201:
                console.log("ORDER CAPTURED, DO CODE THINGS HERE TO CHANGE ACCOUNT TO PREMIUM");
                console.log(`The user ID is ${userId}`);
                User.findById(req.params.userId)
                .then(user => {
                    User.findByIdAndUpdate(userId,
                        {
                            $set: {
                                premiumUser: true
                            }
                        }
                    )
                    .then(user => {
                        user.save()
                    });
                    res.statusCode = 200;
                    res.end(`User ID ${userId} updated successfully to premium. Welcome!`)
                })
                break
            case 500:
                console.log("There was an internal error. Please try refreshing the page and trying again. If you continue to have issues, please contact us.")
                break
                case 422:
                    console.log("The transaction failed. Either the transaction was refused, or the payment instrument was declined.")
                break
            default:
                console.log(`Default case triggered in paypal/api/orders/${orderID}/capture. Need case/switch statement on paypalRouter for httpStatusCode` + httpStatusCode)
        }

      res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
      console.error("Failed to create order:", error);
      res.status(500).json({ error: "Failed to capture order." });
    }
  }); 
  
//   // serve index.html
//   paypalRouter.route('/')
//   .get((req, res) => {
//     res.sendFile(path.resolve("./checkout.html"));
//   });

module.exports = paypalRouter;
