/**
 * 프론트엔드 연동용 에러 응답 형식 통일
 * - 인터셉터가 error.response.data를 reject 하므로, body에 error/message 포함
 * - error: 사용자용 메시지, message: 일부 훅이 참조
 */
function sendError(res, statusCode, message) {
    const msg = typeof message === "string" ? message : "오류가 발생했습니다.";
    return res.status(statusCode).json({
        error: msg,
        message: msg,
    });
}

module.exports = { sendError };
