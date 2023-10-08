import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({ signatureVersion: 'v4' })

// TODO: Implement the fileStogare logic
export class AttachmentUtils {
    private readonly bucketName: string
    private readonly urlExpiration: string

    constructor() {
        this.bucketName = process.env.ATTACHMENT_S3_BUCKET
        this.urlExpiration = process.env.SIGNED_URL_EXPIRATION
    }

    getSignedUrl(id: string): string {
        return s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: id,
            Expires: parseInt(this.urlExpiration)
        })
    }

    getAttachmentUrl(id: string): string {
        return `https://${this.bucketName}.s3.amazonaws.com/${id}`
    }
}