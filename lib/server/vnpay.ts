import crypto from "node:crypto";
import qs from "qs";

export function sortObject(obj: Record<string, string>) {
  const sorted: Record<string, string> = {};
  const keys = Object.keys(obj)
    .map((key) => encodeURIComponent(key))
    .sort();

  keys.forEach((key) => {
    const rawValue = obj[key];
    sorted[key] = encodeURIComponent(rawValue).replace(/%20/g, "+");
  });

  return sorted;
}

export function verifyVnpayQuery(params: URLSearchParams) {
  const vnpParams: Record<string, string> = {};

  for (const [key, value] of params.entries()) {
    vnpParams[key] = value;
  }

  const secureHash = vnpParams.vnp_SecureHash;

  delete vnpParams.vnp_SecureHash;
  delete vnpParams.vnp_SecureHashType;

  const sorted = sortObject(vnpParams);
  const secretKey = process.env.VNPAY_HASH_SECRET || process.env.VNP_HASH_SECRET;
  if (!secretKey) {
    if (process.env.NODE_ENV !== "production") {
      // Allow local dev flow when VNP config isn't set.
      return true;
    }
    throw new Error("Missing VNPAY_HASH_SECRET/VNP_HASH_SECRET in environment.");
  }

  const signData = qs.stringify(sorted, { encode: false });
  const signed = crypto
    .createHmac("sha512", secretKey)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  return secureHash === signed;
}

type VnpayCreateInput = {
  amount: number;
  orderInfo: string;
  orderNumber: string;
  returnUrl: string;
  ipAddr?: string;
  locale?: string;
  bankCode?: string;
  createDate?: string;
  expireDate?: string;
  orderType?: string;
};

export function createVnpayPaymentUrl(input: VnpayCreateInput) {
  const tmnCode = process.env.VNPAY_TMN_CODE || process.env.VNP_TMN_CODE;
  const secretKey = process.env.VNPAY_HASH_SECRET || process.env.VNP_HASH_SECRET;
  const rawUrl = process.env.VNPAY_URL || process.env.VNP_URL;
  const vnpUrl = rawUrl?.trim();

  if (!tmnCode || !secretKey || !vnpUrl) {
    const fallbackReturn = input.returnUrl;
    if (!fallbackReturn) {
      throw new Error("Missing VNPAY_TMN_CODE/VNPAY_HASH_SECRET/VNPAY_URL in environment.");
    }
    const fallbackParams = new URLSearchParams({
      vnp_TxnRef: input.orderNumber,
      vnp_ResponseCode: "00",
      vnp_TransactionNo: "DEV",
    });
    return `${fallbackReturn}?${fallbackParams.toString()}`;
  }

  const vnpParams: Record<string, string> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: input.locale || "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: input.orderNumber,
    vnp_OrderInfo: input.orderInfo,
    vnp_OrderType: input.orderType || "other",
    vnp_Amount: String(Math.round(input.amount) * 100),
    vnp_ReturnUrl: input.returnUrl,
    vnp_IpAddr: input.ipAddr || "127.0.0.1",
    vnp_CreateDate:
      input.createDate ||
      new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, ""),
  };

  if (input.expireDate) {
    vnpParams.vnp_ExpireDate = input.expireDate;
  }
  if (input.bankCode) {
    vnpParams.vnp_BankCode = input.bankCode;
  }

  const sorted = sortObject(vnpParams);
  const signData = qs.stringify(sorted, { encode: false });
  const signed = crypto
    .createHmac("sha512", secretKey)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  return `${vnpUrl}?${qs.stringify(sorted, { encode: false })}&vnp_SecureHash=${signed}`;
}
