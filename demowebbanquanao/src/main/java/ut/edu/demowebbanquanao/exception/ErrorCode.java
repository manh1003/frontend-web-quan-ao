package ut.edu.demowebbanquanao.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Centralized error codes cho toàn hệ thống
 * Format: MODULE_OPERATION_REASON
 */
@Getter
public enum ErrorCode {

    // ========== COMMON ERRORS (1000-1999) ==========
    COMMON_INTERNAL_ERROR("ERR_1000", "error.common.internal", HttpStatus.INTERNAL_SERVER_ERROR),
    COMMON_INVALID_INPUT("ERR_1001", "error.common.invalid.input", HttpStatus.BAD_REQUEST),
    COMMON_RESOURCE_NOT_FOUND("ERR_1002", "error.common.resource.not.found", HttpStatus.NOT_FOUND),
    COMMON_UNAUTHORIZED("ERR_1003", "error.common.unauthorized", HttpStatus.UNAUTHORIZED),
    COMMON_FORBIDDEN("ERR_1004", "error.common.forbidden", HttpStatus.FORBIDDEN),
    COMMON_METHOD_NOT_ALLOWED("ERR_1005", "error.common.method.not.allowed", HttpStatus.METHOD_NOT_ALLOWED),
    COMMON_CONFLICT("ERR_1006", "error.common.conflict", HttpStatus.CONFLICT),

    // ========== AUTHENTICATION ERRORS (2000-2999) ==========
    AUTH_INVALID_CREDENTIALS("ERR_2000", "error.auth.invalid.credentials", HttpStatus.UNAUTHORIZED),
    AUTH_TOKEN_EXPIRED("ERR_2001", "error.auth.token.expired", HttpStatus.UNAUTHORIZED),
    AUTH_TOKEN_INVALID("ERR_2002", "error.auth.token.invalid", HttpStatus.UNAUTHORIZED),
    AUTH_REFRESH_TOKEN_EXPIRED("ERR_2003", "error.auth.refresh.token.expired", HttpStatus.UNAUTHORIZED),
    AUTH_USER_DISABLED("ERR_2004", "error.auth.user.disabled", HttpStatus.FORBIDDEN),
    AUTH_USERNAME_EXISTS("ERR_2005", "error.auth.username.exists", HttpStatus.CONFLICT),
    AUTH_EMAIL_EXISTS("ERR_2006", "error.auth.email.exists", HttpStatus.CONFLICT),

    // ========== USER ERRORS (3000-3999) ==========
    USER_NOT_FOUND("ERR_3000", "error.user.not.found", HttpStatus.NOT_FOUND),
    USER_INVALID_PASSWORD("ERR_3001", "error.user.invalid.password", HttpStatus.BAD_REQUEST),
    USER_ROLE_NOT_FOUND("ERR_3002", "error.user.role.not.found", HttpStatus.NOT_FOUND),
    USER_PERMISSION_DENIED("ERR_3003", "error.user.permission.denied", HttpStatus.FORBIDDEN),

    // ========== PRODUCT ERRORS (4000-4999) ==========
    PRODUCT_NOT_FOUND("ERR_4000", "error.product.not.found", HttpStatus.NOT_FOUND),
    PRODUCT_CATEGORY_NOT_FOUND("ERR_4001", "error.product.category.not.found", HttpStatus.NOT_FOUND),
    PRODUCT_BRAND_NOT_FOUND("ERR_4002", "error.product.brand.not.found", HttpStatus.NOT_FOUND),
    PRODUCT_VARIANT_NOT_FOUND("ERR_4003", "error.product.variant.not.found", HttpStatus.NOT_FOUND),
    PRODUCT_OUT_OF_STOCK("ERR_4004", "error.product.out.of.stock", HttpStatus.BAD_REQUEST),
    PRODUCT_INSUFFICIENT_STOCK("ERR_4005", "error.product.insufficient.stock", HttpStatus.BAD_REQUEST),
    PRODUCT_DUPLICATE_SKU("ERR_4006", "error.product.duplicate.sku", HttpStatus.CONFLICT),

    // ========== CUSTOMER ERRORS (5000-5999) ==========
    CUSTOMER_NOT_FOUND("ERR_5000", "error.customer.not.found", HttpStatus.NOT_FOUND),
    CUSTOMER_ADDRESS_NOT_FOUND("ERR_5001", "error.customer.address.not.found", HttpStatus.NOT_FOUND),
    CUSTOMER_DUPLICATE_EMAIL("ERR_5002", "error.customer.duplicate.email", HttpStatus.CONFLICT),
    CUSTOMER_DUPLICATE_PHONE("ERR_5003", "error.customer.duplicate.phone", HttpStatus.CONFLICT),

    // ========== ORDER ERRORS (6000-6999) ==========
    ORDER_NOT_FOUND("ERR_6000", "error.order.not.found", HttpStatus.NOT_FOUND),
    ORDER_CANNOT_CANCEL("ERR_6001", "error.order.cannot.cancel", HttpStatus.BAD_REQUEST),
    ORDER_ALREADY_PROCESSED("ERR_6002", "error.order.already.processed", HttpStatus.BAD_REQUEST),
    ORDER_INVALID_STATUS_TRANSITION("ERR_6003", "error.order.invalid.status.transition", HttpStatus.BAD_REQUEST),
    ORDER_EMPTY_CART("ERR_6004", "error.order.empty.cart", HttpStatus.BAD_REQUEST),

    // ========== INVENTORY ERRORS (7000-7999) ==========
    INVENTORY_NOT_FOUND("ERR_7000", "error.inventory.not.found", HttpStatus.NOT_FOUND),
    INVENTORY_INSUFFICIENT_STOCK("ERR_7001", "error.inventory.insufficient.stock", HttpStatus.BAD_REQUEST),
    INVENTORY_INVALID_QUANTITY("ERR_7002", "error.inventory.invalid.quantity", HttpStatus.BAD_REQUEST),
    PURCHASE_ORDER_NOT_FOUND("ERR_7003", "error.inventory.purchase.order.not.found", HttpStatus.NOT_FOUND),

    // ========== SUPPLIER ERRORS (8000-8999) ==========
    SUPPLIER_NOT_FOUND("ERR_8000", "error.supplier.not.found", HttpStatus.NOT_FOUND),
    SUPPLIER_DUPLICATE_CODE("ERR_8001", "error.supplier.duplicate.code", HttpStatus.CONFLICT),

    // ========== PROMOTION ERRORS (9000-9999) ==========
    COUPON_NOT_FOUND("ERR_9000", "error.coupon.not.found", HttpStatus.NOT_FOUND),
    COUPON_EXPIRED("ERR_9001", "error.coupon.expired", HttpStatus.BAD_REQUEST),
    COUPON_ALREADY_USED("ERR_9002", "error.coupon.already.used", HttpStatus.BAD_REQUEST),
    COUPON_USAGE_LIMIT_EXCEEDED("ERR_9003", "error.coupon.usage.limit.exceeded", HttpStatus.BAD_REQUEST),
    COUPON_MIN_ORDER_NOT_MET("ERR_9004", "error.coupon.min.order.not.met", HttpStatus.BAD_REQUEST),
    PROMOTION_NOT_FOUND("ERR_9005", "error.promotion.not.found", HttpStatus.NOT_FOUND),
    PROMOTION_INACTIVE("ERR_9006", "error.promotion.inactive", HttpStatus.BAD_REQUEST),

    // ========== VALIDATION ERRORS (10000-10999) ==========
    VALIDATION_REQUIRED_FIELD("ERR_10000", "error.validation.required.field", HttpStatus.BAD_REQUEST),
    VALIDATION_INVALID_FORMAT("ERR_10001", "error.validation.invalid.format", HttpStatus.BAD_REQUEST),
    VALIDATION_INVALID_EMAIL("ERR_10002", "error.validation.invalid.email", HttpStatus.BAD_REQUEST),
    VALIDATION_INVALID_PHONE("ERR_10003", "error.validation.invalid.phone", HttpStatus.BAD_REQUEST),
    VALIDATION_INVALID_DATE_RANGE("ERR_10004", "error.validation.invalid.date.range", HttpStatus.BAD_REQUEST),
    VALIDATION_INVALID_PRICE("ERR_10005", "error.validation.invalid.price", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String messageKey;
    private final HttpStatus httpStatus;

    ErrorCode(String code, String messageKey, HttpStatus httpStatus) {
        this.code = code;
        this.messageKey = messageKey;
        this.httpStatus = httpStatus;
    }
}
