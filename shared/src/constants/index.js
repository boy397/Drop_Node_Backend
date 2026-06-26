"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressType = exports.NotificationType = exports.PaymentMethod = exports.PaymentStatus = exports.OrderStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["CUSTOMER"] = "customer";
    UserRole["VENDOR"] = "vendor";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "pending";
    OrderStatus["PROCESSING"] = "processing";
    OrderStatus["SHIPPED"] = "shipped";
    OrderStatus["DELIVERED"] = "delivered";
    OrderStatus["CANCELLED"] = "cancelled";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PAID"] = "paid";
    PaymentStatus["FAILED"] = "failed";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["STRIPE"] = "stripe";
    PaymentMethod["PAYPAL"] = "paypal";
    PaymentMethod["COD"] = "cod";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["ORDER"] = "order";
    NotificationType["PAYMENT"] = "payment";
    NotificationType["PROMO"] = "promo";
    NotificationType["SYSTEM"] = "system";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var AddressType;
(function (AddressType) {
    AddressType["SHIPPING"] = "shipping";
    AddressType["BILLING"] = "billing";
})(AddressType || (exports.AddressType = AddressType = {}));
