import { google } from 'googleapis';
import fs from 'fs';

export class YoutubeService {
    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.YOUTUBE_CLIENT_ID,
            process.env.YOUTUBE_CLIENT_SECRET,
            process.env.YOUTUBE_REDIRECT_URI,
        );

        this.youtube = google.youtube({
            version: 'v3',
            auth: this.oauth2Client,
        });
    }

    async uploadVideo(filePath, title, description, onProgress) {
        try {
            // Set up OAuth2 client with the access token
            this.oauth2Client.setCredentials({
                access_token: process.env.YOUTUBE_ACCESS_TOKEN,
            });

            const fileSize = fs.statSync(filePath).size;

            const res = await this.youtube.videos.insert(
                {
                    part: 'snippet,status',
                    requestBody: {
                        snippet: {
                            title,
                            description,
                            categoryId: '27', // Education category
                        },
                        status: {
                            privacyStatus: 'unlisted',
                        },
                    },
                    media: {
                        body: fs.createReadStream(filePath),
                    },
                },
                {
                    onUploadProgress: (evt) => {
                        const progress = (evt.bytesRead / fileSize) * 100;
                        if (onProgress) {
                            onProgress(progress);
                        }
                    },
                },
            );

            return {
                id: res.data.id,
                title: res.data.snippet.title,
                description: res.data.snippet.description,
                url: `https://www.youtube.com/watch?v=${res.data.id}`,
            };
        } catch (error) {
            throw error;
        }
    }

    async getVideoInfo(videoId) {
        try {
            // Set up OAuth2 client with the access token
            this.oauth2Client.setCredentials({
                access_token: process.env.YOUTUBE_ACCESS_TOKEN,
            });

            const res = await this.youtube.videos.list({
                part: 'snippet,contentDetails,statistics',
                id: videoId,
            });

            if (res.data.items.length === 0) {
                throw new Error('Video not found');
            }

            const video = res.data.items[0];
            return {
                id: video.id,
                title: video.snippet.title,
                description: video.snippet.description,
                duration: video.contentDetails.duration,
                viewCount: video.statistics.viewCount,
                url: `https://www.youtube.com/watch?v=${video.id}`,
            };
        } catch (error) {
            throw error;
        }
    }

    async updateVideoInfo(videoId, title, description) {
        try {
            // Set up OAuth2 client with the access token
            this.oauth2Client.setCredentials({
                access_token: process.env.YOUTUBE_ACCESS_TOKEN,
            });

            const res = await this.youtube.videos.update({
                part: 'snippet',
                requestBody: {
                    id: videoId,
                    snippet: {
                        title,
                        description,
                        categoryId: '27', // Education category
                    },
                },
            });

            return {
                id: res.data.id,
                title: res.data.snippet.title,
                description: res.data.snippet.description,
            };
        } catch (error) {
            throw error;
        }
    }
}

export default new YoutubeService();
