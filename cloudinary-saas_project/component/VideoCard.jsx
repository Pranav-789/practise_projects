'use client'
import React, {useState, useEffect, useCallback} from 'react'

import {getCldVideoUrl, getCldImageUrl} from 'next-cloudinary';
import {Download, Clock, FileDown, FileUp} from 'lucide-react'

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'
import { filesize } from 'filesize';

dayjs.extend(relativeTime);

const VideoCard = ({video, onDownload}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [previewError, setPreviewError] = useState(false);

    const getThumbUrl = useCallback((publicId)=>{
        return getCldImageUrl({
            src: publicId,
            width: 400,
            height: 225,
            crop: 'fill',
            gravity: 'auto',
            format: 'jpg',
            quality: 'auto',
            assetType: 'video'
        })
    }, [])

    const getFullVideoUrl = useCallback((publicId) => {
      return getCldVideoUrl({
        src: publicId,
        width: 1920,
        height: 1080,
      });
    }, []);

    const getPreviewVideoUrl = useCallback((publicId) => {
      return getCldVideoUrl({
        src: publicId,
        width: 400,
        height: 225,
        rawTransformations: ['e_previes: duration_15:max_seg_9:min_seg_dur1']
      });
    }, []);

    const formatSize = useCallback((size)=>{
        return filesize(size);
    }, [])
    const handlePreviewError = () => setPreviewError(true);

    const compressionPercentage = useCallback((original, compressed) => {
      if (!original || !compressed) return 0;
      const diff = Number(original) - Number(compressed);
      return ((diff / Number(original)) * 100).toFixed(2);
    }, []);


  return (
    <div
      className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <figure className="aspect-video relative">
        {isHovered ? (
          previewError ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <p className="text-red-500">Preview not available</p>
            </div>
          ) : (
            <video
              src={getPreviewVideoUrl(video.publicId)}
              autoPlay
              muted
              loop
              className="w-full h-full object-cover"
              onError={handlePreviewError}
            />
          )
        ) : (
          <img
            src={getThumbUrl(video.publicId)}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute bottom-2 right-2 bg-base-100 bg-opacity-70 px-2 py-1 rounded-lg text-sm flex items-center">
          <Clock size={16} className="mr-1" />
          {formatDuration(video.duration)}
        </div>
      </figure>
      <div className="card-body p-4">
        <h2 className="card-title text-lg font-bold">{video.title}</h2>
        <p className="text-sm text-base-content opacity-70 mb-4">
          {video.description}
        </p>
        <p className="text-sm text-base-content opacity-70 mb-4">
          Uploaded {dayjs(video.createdAt).fromNow()}
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <FileUp size={18} className="mr-2 text-primary" />
            <div>
              <div className="font-semibold">Original</div>
              <div>{formatSize(Number(video.orignalSize))}</div>
            </div>
          </div>
          <div className="flex items-center">
            <FileDown size={18} className="mr-2 text-secondary" />
            <div>
              <div className="font-semibold">Compressed</div>
              <div>{formatSize(Number(video.comressedSize))}</div>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm font-semibold">
            Compression:{" "}
            <span className="text-accent">
              {compressionPercentage(video.orignalSize, video.comressedSize)}%
            </span>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() =>
              onDownload(getFullVideoUrl(video.publicId), video.title)
            }
          >
            <Download size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoCard
