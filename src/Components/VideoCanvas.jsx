const VideoCanvas = ({ videoRef, canvasRef }) => {
  return (
    <div className="relative w-full h-full md:aspect-video aspect-[4/3]">
      <video
        style={{ transform: 'scaleX(-1)' }}
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />
      <canvas
        style={{ transform: 'scaleX(-1)' }}
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
};

export default VideoCanvas;
