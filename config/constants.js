module.exports = {
    AUTH_TOKEN_EXPIRY_HOURS: 20,
    ADMIN_AUTH_SESSION_EXPIRY_HOURS: 24 * 60 * 60,
    EMAIL_TOKEN_EXPIRY_HOURS: 1,

    ERROR_TYPES: {
        VALIDATION: 'Validation',
        CUSTOM: 'Custom',
        HTTP: 'HTTP',
        UNEXPECTED: 'Unexpected'
    },
    USER_STATUS: {
        BLOCKED: 'BLOCKED',
        PENDING: 'PENDING',
        ACTIVE: 'ACTIVE',
        DELETED: 'DELETED'
    },

    EVENT_STATUS: {
        ACTIVE: 'active',
        DELETED: 'deleted',
        PENDING: 'pending'
    },
    EVENT_DURATION: {
        MINUTES: 'minutes'
    },
    EVENT_TIME_STATUS: {
        ONGOING: 'ongoing',
        PAST: 'past',
        FUTURE: 'future'
    },
    EXAM_QUESTION: {
        MCQ: 'mcq',
        MSQ: 'msq',
        NUMERICAL: 'Numerical',
        TEXT: 'Text'
    },
    EXAM_SECTIONS: {
        SECTION_A: 'section-a',
        SECTION_B: 'section-b',
        SECTION_C: 'section-c',
        SECTION_D: 'section-d'
    },

    EVENTS_PAGINATION_LIMIT: 25,
    USERS_PAGINATION_LIMIT: 20
};
