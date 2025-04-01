class ApiError extends Error {
    constructor(
        staticCode,
        message = "something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.staticCode = staticCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if(stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

}
export { ApiError };