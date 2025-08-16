import {v2 as cloudinary} from 'cloudinary'
import { NextResponse } from 'next/server'
import {auth} from '@clerk/nextjs/server'

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request) {
    const {userId} = await auth();

    if(!userId){
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if(!file){
            return NextResponse.json({error:"file not found"}, {status: 400});
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise((resolve, reject)=>{
            const upload_stream = cloudinary.uploader.upload_stream(
                {folder: "Next-cloudinary-uploads"},
                (error, result) =>{
                    if(error) reject(error);
                    else resolve(result);
                }
            )
            upload_stream.end(buffer)
        })
        return NextResponse.json({publicId: result.public_id}, {status: 200})
    } catch (error) {
        console.log("Upload image failed", error);
        return NextResponse.json({error: "Upload image failed"}, {status:500})
    }
}