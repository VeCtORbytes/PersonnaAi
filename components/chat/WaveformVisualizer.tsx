"use client";

import { useEffect, useRef } from "react";

interface Props {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  color: string;
}

export function WaveformVisualizer({ analyser, isPlaying, color }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!analyser || !isPlaying) {
      cancelAnimationFrame(animationRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Only use first 40% of frequency bins — voice sits in low-mid range
      const usedBins = Math.floor(bufferLength * 0.4);
      const barWidth = canvas.width / usedBins - 1.5;

      for (let i = 0; i < usedBins; i++) {
        const value = dataArray[i] / 255;
        const barHeight = Math.max(2, value * canvas.height);
        const x = i * (barWidth + 1.5);
        const y = (canvas.height - barHeight) / 2; // centered vertically

        ctx.fillStyle = color;
        ctx.globalAlpha = 0.3 + value * 0.7; // opacity follows amplitude
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, isPlaying, color]);

  return (
    <canvas
      ref={canvasRef}
      width={80}
      height={24}
      className="rounded opacity-90"
    />
  );
}