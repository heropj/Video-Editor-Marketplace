import dotenv from 'dotenv'
dotenv.config()

document.getElementById("pay-btn").addEventListener("click", async function () {
    const response = await fetch("/create-order", { method: "POST" });
    const order = await response.json(); // Get order ID from backend

    var options = {
        key: "process.env.RP_ID_KEY", // Replace with Razorpay Key ID
        amount: order.amount, // Amount from backend (in paise)
        currency: "INR",
        name: "Your Business Name",
        description: "Payment for XYZ",
        order_id: order.id, // Order ID from backend
        handler: function (response) {
            alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
        },
        prefill: {
            name: "John Doe",
            email: "johndoe@example.com",
            contact: "9876543210"
        },
        theme: { color: "#3399cc" }
    };

    var rzp1 = new Razorpay(options);
    rzp1.open();
});
