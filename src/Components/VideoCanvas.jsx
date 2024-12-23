const VideoCanvas = ({ videoRef, canvasRef }) => {
  return (
    <div className="relative w-full h-full md:aspect-video aspect-[4/3]">
      <video
        style={{ transform: 'scaleX(-1)' }}
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-contain"
        autoPlay
        playsInline
        muted
        // Add these attributes for better mobile support
        webkit-playsinline="true"
        x5-playsinline="true"
        x5-video-player-type="h5"
        x5-video-player-fullscreen="true"
      />
      <canvas
        style={{ transform: 'scaleX(-1)' }}
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-contain"
      />
    </div>
  );
};

export default VideoCanvas;