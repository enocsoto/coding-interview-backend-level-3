export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export interface ErrorResponse {
    errors: ValidationError[];
}

export interface SuccessResponse {
    ok: boolean;
} 