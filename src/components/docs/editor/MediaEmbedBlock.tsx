import React, { useState, useRef } from 'react';
import { DocBlock, MediaBlockProperties } from '../../../types/docs.ts';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Video,
  Music,
  ExternalLink,
  Edit2,
  Trash2,
  Film,
} from 'lucide-react';

interface MediaEmbedBlockProps {
  block: DocBlock;
  onUpdate: (
    content: string,
    blockType: 'media',
    properties: Record<string, unknown>,
    isStructural: boolean
  ) => void;
  onDelete: () => void;
}

/**
 * 现代音视频与多媒体卡片 (MediaEmbedBlock)
 * - 智能识别视频直链 (mp4/webm) 与音频直链 (mp3/wav/ogg)
 * - 音频渲染暗黑微光波形播放条，视频渲染等比硬件加速视窗
 * - 支持更换链接、极简快捷操作
 */
export const MediaEmbedBlock: React.FC<MediaEmbedBlockProps> = ({
  block,
  onUpdate,
  onDelete,
}) => {
  const props = (block.properties || {}) as MediaBlockProperties;
  const currentUrl = props.url || block.content || '';

  const [inputUrl, setInputUrl] = useState(currentUrl);
  const [isEditingUrl, setIsEditingUrl] = useState(!currentUrl);

  // 音频播放专属状态
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // 识别多媒体类型
  const isAudio =
    props.mediaType === 'audio' ||
    /\.(mp3|wav|ogg|flac|aac|m4a)($|\?)/i.test(currentUrl);

  const handleSaveUrl = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = inputUrl.trim();
    if (!trimmed) return;

    let detectedType: 'video' | 'audio' | 'embed' = 'video';
    if (/\.(mp3|wav|ogg|flac|aac|m4a)($|\?)/i.test(trimmed)) {
      detectedType = 'audio';
    }

    onUpdate(
      trimmed,
      'media',
      {
        ...props,
        url: trimmed,
        mediaType: detectedType,
      },
      true
    );
    setIsEditingUrl(false);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // 1. 空状态或编辑链接卡片
  if (isEditingUrl || !currentUrl) {
    return (
      <div className="w-full my-3 p-4 rounded-2xl bg-[#12161f]/80 border border-white/10 shadow-lg select-none">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Film size={15} className="text-sky-400" />
            <span>嵌入音视频多媒体卡片</span>
          </div>
          {currentUrl && (
            <button
              type="button"
              onClick={() => setIsEditingUrl(false)}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              取消
            </button>
          )}
        </div>

        <form onSubmit={handleSaveUrl} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="输入或粘贴媒体 URL (如 https://example.com/demo.mp4 或 .mp3)..."
              autoFocus
              className="flex-1 px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 font-mono transition-all"
            />
            <button
              type="submit"
              disabled={!inputUrl.trim()}
              className="px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-medium border border-sky-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              嵌入媒体
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span>支持类型:</span>
              <span className="px-1.5 py-0.5 rounded bg-white/5 font-mono text-[10px] text-slate-400">
                MP4 / WebM
              </span>
              <span className="px-1.5 py-0.5 rounded bg-white/5 font-mono text-[10px] text-slate-400">
                MP3 / WAV
              </span>
            </div>
            <button
              type="button"
              onClick={onDelete}
              className="hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 size={11} />
              <span>移除块</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // 2. 音频卡片模式 (紧凑声波微光播放条)
  if (isAudio) {
    return (
      <div className="group/audio relative w-full my-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#12161f] to-[#181e2b] border border-white/10 shadow-lg flex items-center gap-3 select-none">
        <audio
          ref={audioRef}
          src={currentUrl}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setDuration(audioRef.current.duration);
            }
          }}
          onEnded={() => setIsPlaying(false)}
        />

        {/* 播放/暂停大圆钮 */}
        <button
          type="button"
          onClick={togglePlayAudio}
          className="w-10 h-10 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-sky-500/20 hover:scale-105 transition-all cursor-pointer"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>

        {/* 标题与播放进度条 */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 truncate text-slate-200 font-medium">
              <Music size={13} className="text-sky-400 shrink-0" />
              <span className="truncate">{props.title || currentUrl.split('/').pop() || '音频媒体'}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* 进度滑条 */}
          <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer">
            <div
              className="absolute left-0 top-0 bottom-0 bg-sky-400 rounded-full transition-all"
              style={{
                width: `${duration ? (currentTime / duration) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* 静音控制 */}
        <button
          type="button"
          onClick={() => {
            if (!audioRef.current) return;
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
          }}
          className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/5 transition-colors"
          title={isMuted ? '取消静音' : '静音'}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>

        {/* 悬停微型操作栏 */}
        <div className="opacity-0 group-hover/audio:opacity-100 flex items-center gap-1 transition-opacity">
          <button
            type="button"
            onClick={() => setIsEditingUrl(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="更换链接"
          >
            <Edit2 size={13} />
          </button>
          <a
            href={currentUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="新窗口打开直链"
          >
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    );
  }

  // 3. 视频卡片模式
  return (
    <div className="group/video relative w-full my-3 rounded-2xl bg-black/60 border border-white/10 shadow-2xl overflow-hidden select-none">
      {/* 顶栏微光标题条 */}
      <div className="h-8 px-3 bg-[#12161f]/90 border-b border-white/5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 truncate">
          <Video size={13} className="text-sky-400" />
          <span className="truncate text-[11px] font-mono text-slate-300">
            {props.title || currentUrl.split('/').pop() || '视频播放器'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsEditingUrl(true)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors"
            title="更换视频地址"
          >
            <Edit2 size={12} />
          </button>
          <a
            href={currentUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors"
            title="浏览器原窗口打开"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* 原生 HTML5 视频播放器 */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center">
        <video
          src={currentUrl}
          controls
          className="w-full h-full object-contain"
          preload="metadata"
        >
          您的环境不支持直接播放该视频直链，请点击右上角外链打开。
        </video>
      </div>
    </div>
  );
};
