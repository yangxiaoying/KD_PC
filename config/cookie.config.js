module.exports = {
    secret: {
        sessionSecret: 'KD-session-secret',
        // 密码加密key
        encryptSecret: 'KD-psw-secret'
    },
    cookieMaxAge: 1000 * 60 * 60 * 24 * 30,   // 30天
    cookieAutoLoginInPswName: 'kdpcAutoLoginIn',
    cookieAutoLoginInUsername: 'kdpcUsername'
};