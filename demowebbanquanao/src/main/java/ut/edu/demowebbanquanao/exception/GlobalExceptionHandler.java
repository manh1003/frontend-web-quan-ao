package ut.edu.demowebbanquanao.exception;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Centralized exception handler với logging và i18n support
 */
@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final MessageSource messageSource;

    /**
     * Xử lý BusinessException và các subclass (ResourceNotFoundException, AuthenticationException, v.v.)
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException ex) {
        ErrorCode errorCode = ex.getErrorCode();
        String message = getMessage(errorCode.getMessageKey(), ex.getArgs());

        // Logging với context
        log.warn("Business exception occurred: code={}, message={}",
                errorCode.getCode(), message, ex);

        return ResponseEntity
                .status(errorCode.getHttpStatus())
                .body(ApiResponse.error(errorCode, message));
    }

    /**
     * Xử lý validation errors từ @Valid
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        log.warn("Validation failed: {}", errors);

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, "Dữ liệu không hợp lệ", errors,
                        ErrorCode.COMMON_INVALID_INPUT.getCode(), null));
    }

    /**
     * Xử lý Spring Security AccessDeniedException
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());

        String message = getMessage(ErrorCode.COMMON_FORBIDDEN.getMessageKey());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(ErrorCode.COMMON_FORBIDDEN, message));
    }

    /**
     * Xử lý BadCredentialsException từ Spring Security
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentialsException(BadCredentialsException ex) {
        log.warn("Bad credentials: {}", ex.getMessage());

        String message = getMessage(ErrorCode.AUTH_INVALID_CREDENTIALS.getMessageKey());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(ErrorCode.AUTH_INVALID_CREDENTIALS, message));
    }

    /**
     * Xử lý type mismatch (e.g., string cho Long parameter)
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        log.warn("Type mismatch: parameter={}, value={}, requiredType={}",
                ex.getName(), ex.getValue(), ex.getRequiredType());

        String message = String.format("Tham số '%s' không đúng định dạng", ex.getName());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(message, ErrorCode.COMMON_INVALID_INPUT.getCode()));
    }

    /**
     * Xử lý các exception chưa được handle cụ thể
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        // Log full stack trace cho internal errors
        log.error("Unexpected error occurred", ex);

        String message = getMessage(ErrorCode.COMMON_INTERNAL_ERROR.getMessageKey());

        // Trong development mode, có thể thêm exception message
        if (isDevelopmentMode()) {
            message += ": " + ex.getMessage();
        }

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(ErrorCode.COMMON_INTERNAL_ERROR, message));
    }

    /**
     * Helper method để get message từ MessageSource với locale support
     */
    private String getMessage(String key, Object... args) {
        try {
            Locale locale = LocaleContextHolder.getLocale();
            return messageSource.getMessage(key, args, locale);
        } catch (Exception e) {
            log.warn("Failed to resolve message for key: {}", key);
            return key;
        }
    }

    /**
     * Check development mode (có thể expose thêm thông tin debug)
     */
    private boolean isDevelopmentMode() {
        // TODO: Read from application.properties hoặc Spring Profile
        return true; // Default true cho development
    }
}

