// Source: https://developer.paypal.com/studio/checkout/standard/integrate

import React, { useState, useContext } from "react";
import { UserContext } from "../utils/UserContext";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { dbUrl } from "../utils/dbUrl";

// Renders errors or successfull transactions on the screen.
function Message({ content }) {
  return <p>{content}</p>;
}


const PaypalBox = () => {
    const initialOptions = {
        "client-id":
        "AbVAgM7FO8L2uvoXcTf8NrN_NUYlXo9qTQ_KDG_VFXazTJmpHgu7XzYHqA2QbghGrQvGHzMIZaz3qgqx",
        "enable-funding": "venmo",
        "disable-funding": "",
        currency: "USD",
        "data-page-type": "product-details",
        components: "buttons",
        "data-sdk-integration-source": "developer-studio",
    };

    const [currentUser] = useContext(UserContext);
    const [message, setMessage] = useState("");

  return (
    <div className="App">
      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtons
          style={{
            shape: "rect",
            layout: "vertical",
            color: "gold",
            label: "paypal",
          }}
          createOrder={async () => {
            try {
              const response = await fetch(dbUrl + "/paypal/api/orders", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                // use the "body" param to optionally pass additional order information
                // like product ids and quantities
                body: JSON.stringify({
                  cart: [
                    {
                      id: "Permanent_Premium_Subscription",
                      userInfo: {
                        firstName: currentUser.firstName,
                        lastName: currentUser.lastName,
                        userId: currentUser._id
                      }
                    //   quantity: "YOUR_PRODUCT_QUANTITY"
                    },
                  ],
                }),
              });

              const orderData = await response.json();

              if (orderData.id) {
                return orderData.id;
              } else {
                const errorDetail = orderData?.details?.[0];
                const errorMessage = errorDetail
                  ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                  : JSON.stringify(orderData);

                throw new Error(errorMessage);
              }
            } catch (error) {
              console.error(error);
              setMessage(`Could not initiate PayPal Checkout... ${error}`);
            }
          }}
          onApprove={async (
            data,
            actions
          ) => {
            try {
              const response = await fetch(
                `${dbUrl}/paypal/api/orders/${data.orderID}/capture/${currentUser._id}`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );

              const orderData = await response.json();
              // Three cases to handle:
              //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
              //   (2) Other non-recoverable errors -> Show a failure message
              //   (3) Successful transaction -> Show confirmation or thank you message

              const errorDetail = orderData?.details?.[0];

              if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                // recoverable state, per https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
                return actions.restart();
              } else if (errorDetail) {
                // (2) Other non-recoverable errors -> Show a failure message
                throw new Error(
                  `${errorDetail.description} (${orderData.debug_id})`
                );
              } else {
                // (3) Successful transaction -> Show confirmation or thank you message
                // Or go to another URL:  actions.redirect('thank_you.html');
                const transaction =
                  orderData.purchase_units[0].payments.captures[0];
                setMessage(
                  `Transaction ${transaction.status}: ${transaction.id}. See console for all available details`
                );
                // console.log(
                //   "Capture result",
                //   orderData,
                //   JSON.stringify(orderData, null, 2)
                // );
              }
            } catch (error) {
              console.error(error);
              setMessage(
                `Sorry, your transaction could not be processed...${error}`
              );
            }
          }} 
        />
      </PayPalScriptProvider>
      <Message content={message} />
    </div>
  );
}

export default PaypalBox; 