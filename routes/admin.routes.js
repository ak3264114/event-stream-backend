/* eslint-disable node/no-missing-import */
/* eslint-disable node/no-unsupported-features/es-syntax */
process.env['NODE_ENV'] = 'production';

const User = require('../models/user');
const Event = require('../models/event.model');
const AdminUser = require('../models/adminUsers');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');

const { deleteUser, defaultActiveUsersOnly } = require('../controllers/user');

const { ADMIN_AUTH_SESSION_EXPIRY_HOURS } = require('../config/constants');
const EventParticipation = require('../models/eventParticipation');

const getAdminRouter = async () => {
    const AdminJS = (await import('adminjs')).default;
    const AdminJSExpress = (await import('@adminjs/express')).default;
    const AdminJSMongoose = await import('@adminjs/mongoose');
    const { files } = await import('../admin/uploadImage.mjs');
    const { componentLoader } = await import('../admin/component-loader.mjs');
    const { handlerWrapper } = await import('../admin/handlerWrapper.mjs');

    AdminJS.registerAdapter({
        Resource: AdminJSMongoose.Resource,
        Database: AdminJSMongoose.Database
    });

    const admin = new AdminJS({
        rootPath: '/admin',
        resources: [
            {
                resource: Event
            },
            {
                resource: EventParticipation
            },
            {
                resource: User,
                options: {
                    properties: {
                        createdAt: {
                            isVisible: {
                                edit: false,
                                list: false,
                                filter: true,
                                show: true
                            }
                        },
                        updatedAt: {
                            isVisible: {
                                edit: false,
                                list: false,
                                filter: true,
                                show: true
                            }
                        },
                        password: {
                            isVisible: {
                                edit: true,
                                list: false,
                                filter: true,
                                show: false
                            }
                        },
                        isEmailVerified: {
                            isVisible: {
                                edit: false,
                                list: false,
                                filter: false,
                                show: false
                            }
                        }
                    },
                    actions: {
                        delete: {
                            isVisible: true,
                            handler: handlerWrapper(deleteUser)
                        },
                        bulkDelete: { isVisible: false },
                        list: {
                            before: [defaultActiveUsersOnly]
                        },
                        search: {
                            before: [defaultActiveUsersOnly]
                        }
                    }
                }
            },
            {
                resource: AdminUser,
                options: {
                    properties: {
                        password: {
                            isVisible: {
                                filter: false,
                                show: false,
                                edit: true,
                                list: false
                            }
                        },
                        createdAt: {
                            isVisible: {
                                edit: false,
                                list: false,
                                filter: true,
                                show: true
                            }
                        },
                        updatedAt: {
                            isVisible: {
                                edit: false,
                                list: false,
                                filter: true,
                                show: true
                            }
                        }
                    },
                    actions: {
                        edit: { isVisible: false }
                    }
                }
            },

            files
        ],
        componentLoader,
        branding: {
            companyName: 'EventStream',
            softwareBrothers: false,
            logo: '/images/logo.png'
        },
        locale: {
            translations: {
                messages: {
                    loginWelcome: 'Administration Panel - Login'
                },
                labels: {
                    loginWelcome: 'EventStream',
                    EventParticipation: 'EventParticipation',
                    Event: 'Events'
                }
            }
        },
        assets: {
            styles: ['/styles/admin.css']
        }
    });

    const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
        admin,
        {
            authenticate: async (email, password) => {
                return await AdminUser.checkIfUserExists(email, password);
            },
            cookieName: 'event-stream-admin',
            cookiePassword: process.env.SESSION_SECRET
        },
        null,
        {
            store: MongoStore.create({
                client: mongoose.connection.client,
                dbName: 'event-stream-session',
                ttl: ADMIN_AUTH_SESSION_EXPIRY_HOURS
            }),
            resave: true,
            saveUninitialized: true,
            secret: process.env.SESSION_SECRET,
            cookie: {
                httpOnly: true,
                secure: false
            },
            name: 'event-stream'
        }
    );
    return adminRouter;
};

module.exports = getAdminRouter;
