package ut.edu.demowebbanquanao.exception;

/**
 * Exception khi không tìm thấy resource
 * Extend từ BusinessException để support error codes
 */
public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }

    public ResourceNotFoundException(ErrorCode errorCode, Object... args) {
        super(errorCode, args);
    }

    // Backward compatibility - deprecated
    @Deprecated
    public ResourceNotFoundException(String message) {
        super(ErrorCode.COMMON_RESOURCE_NOT_FOUND);
    }
}
