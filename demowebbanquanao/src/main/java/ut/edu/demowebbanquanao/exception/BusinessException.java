package ut.edu.demowebbanquanao.exception;

import lombok.Getter;

/**
 * Base exception cho business logic errors
 * Tất cả custom exceptions nên extend từ class này
 */
@Getter
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;
    private final Object[] args; // Arguments cho message interpolation

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessageKey());
        this.errorCode = errorCode;
        this.args = null;
    }

    public BusinessException(ErrorCode errorCode, Object... args) {
        super(errorCode.getMessageKey());
        this.errorCode = errorCode;
        this.args = args;
    }

    public BusinessException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessageKey(), cause);
        this.errorCode = errorCode;
        this.args = null;
    }

    public BusinessException(ErrorCode errorCode, Throwable cause, Object... args) {
        super(errorCode.getMessageKey(), cause);
        this.errorCode = errorCode;
        this.args = args;
    }
}
