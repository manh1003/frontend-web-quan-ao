package ut.edu.demowebbanquanao.exception;

/**
 * Exception cho authentication errors
 */
public class AuthenticationException extends BusinessException {

    public AuthenticationException(ErrorCode errorCode) {
        super(errorCode);
    }

    public AuthenticationException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }

    public AuthenticationException(ErrorCode errorCode, Object... args) {
        super(errorCode, args);
    }

    // Backward compatibility - deprecated
    @Deprecated
    public AuthenticationException(String message) {
        super(ErrorCode.AUTH_INVALID_CREDENTIALS);
    }

    @Deprecated
    public AuthenticationException(String message, Throwable cause) {
        super(ErrorCode.AUTH_INVALID_CREDENTIALS, cause);
    }
}