import api from "./api";

export const createPaymentOrder = (amount: number) => {
    return api.post("/payments/create-order/", { amount });
};

export const verifyPayment = (paymentData: any) => {
    return api.post("/payments/verify-payment/", paymentData);
};
