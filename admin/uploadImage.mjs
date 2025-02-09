import uploadFeature from '@adminjs/upload';

import Image from '../models/image.js';
import { componentLoader } from './component-loader.mjs';

const AWScredentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-south-1',
    bucket: 'passionate-statisticians',
    expires: 0
};

export const files = {
    resource: Image,
    options: {
        properties: {
            key: {
                isVisible: {
                    filter: false,
                    show: true,
                    edit: false,
                    list: false
                }
            },
            filePath: {
                isVisible: {
                    filter: false,
                    show: true,
                    edit: false,
                    list: false
                }
            },
            createdAt: {
                isVisible: {
                    filter: false,
                    show: true,
                    edit: false,
                    list: false
                }
            },
            updatedAt: {
                isVisible: {
                    filter: false,
                    show: true,
                    edit: false,
                    list: false
                }
            }
        }
    },
    features: [
        uploadFeature({
            properties: {
                filePath: 'filePath',
                key: 'key'
            },
            componentLoader,
            provider: { aws: AWScredentials },
            validation: { mimeTypes: ['image/jpeg', 'image/jpg', 'image/png'] }
        })
    ]
};
