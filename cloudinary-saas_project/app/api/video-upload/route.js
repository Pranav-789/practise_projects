import {v2 as cloudinary} from 'cloudinary'
import { NextResponse } from 'next/server'
import {auth} from '@clerk/nextjs/server'
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request) {
    const {userId} = auth();

    
    try {
        if(!userId){
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
    
        if(
            !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ){
            return NextResponse.json({error: "Cloudinary credemtials not found"}, {status: 500})
        }
        const formData = await request.formData();
        const file = formData.get('file');
        const title = formData.get("title");
        const description = formData.get("description");
        const originalSize = formData.get("originalSize");

        if(!file){
            return NextResponse.json({error:"file not found"}, {status: 400});
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise((resolve, reject)=>{
            const upload_stream = cloudinary.uploader.upload_stream(
                {   
                    resource_type: 'video',
                    folder: "video-uploads",
                    transformation:{
                        quality: "auto",
                        fetch_format: "mp4"
                    }
                },
                (error, result) =>{
                    if(error) reject(error);
                    else resolve(result);
                }
            )
            upload_stream.end(buffer)
        })
        const video = await prisma.video.create({
          data: {
            title,
            description,
            publicId: result.public_id,
            orignalSize: originalSize,
            comressedSize: String(result.bytes),
            duration: result.duration || 0,
          },
        });
        return NextResponse.json(
            video
        )
    } catch (error) {
        console.log("Upload video failed", error);
        return NextResponse.json({error: "Upload video failed"}, {status:500})
    }
    finally{
        await prisma.$disconnect();
    }
}