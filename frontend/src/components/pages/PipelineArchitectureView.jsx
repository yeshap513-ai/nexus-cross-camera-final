import React from 'react';
import { 
  GitMerge, 
  Cpu, 
  Database, 
  Activity, 
  Radio, 
  Zap, 
  CheckCircle2, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  BellRing,
  Sparkles
} from 'lucide-react';
import { TacticalCard } from '../common/TacticalCard';

export const PipelineArchitectureView = () => {
  const pipelineStages = [
    {
      stage: '01. Ingestion Layer',
      title: 'Heterogeneous VMS Demuxer',
      desc: 'Connects to Genetec, Milestone, HikCentral, Dahua via RTSP/ONVIF streams. De-jitters frames and extracts 30 FPS raw feeds.',
      tech: 'FFmpeg Hardware Accel / GStreamer',
      latency: '2.8 ms',
      status: 'HEALTHY',
    },
    {
      stage: '02. Deep Detection',
      title: 'YOLOv8-X Vehicle & Plate Detector',
      desc: 'Performs multi-scale bounding box localization for vehicle type, make, color, and license plate sub-crops.',
      tech: 'TensorRT / CUDA FP16',
      latency: '4.2 ms',
      status: 'HEALTHY',
    },
    {
      stage: '03. Optical OCR',
      title: 'PaddleOCR-v4 & LPRNet Engine',
      desc: 'Character segmentation, HSRP plate text recognition, state code parsing, and confidence scoring.',
      tech: 'Custom CTC Decoder + RegEx Validator',
      latency: '3.1 ms',
      status: 'HEALTHY',
    },
    {
      stage: '04. Feature Extraction',
      title: 'Re-ID Deep Feature Extractor',
      desc: 'Generates 512-dimension visual embeddings of vehicle appearance to track vehicles even with occluded plates.',
      tech: 'ResNet50-IBN / ArcFace Embedding',
      latency: '2.1 ms',
      status: 'HEALTHY',
    },
    {
      stage: '05. Spatio-Temporal Graph',
      title: 'Cross-Camera Correlation Engine',
      desc: 'Builds time-space graph models connecting camera nodes with geographical constraints, speed limits, and route forecasting.',
      tech: 'Milvus Vector DB + Neo4j Graph',
      latency: '1.4 ms',
      status: 'HEALTHY',
    },
    {
      stage: '06. Law Enforcement Broker',
      title: 'BOLO Alert & Dispatch Gateway',
      desc: 'Real-time watchlist cross-referencing, audio alerts, and automated QRT interdiction dispatch.',
      tech: 'Kafka Event Stream + WebSocket Pusher',
      latency: '0.8 ms',
      status: 'HEALTHY',
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-cyan-500/25 backdrop-blur-xl">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <GitMerge className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
              DISTRIBUTED AI INFERENCE PIPELINE
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-sans mt-0.5">
              Cross-Camera Intelligence & Spatio-Temporal Pipeline
            </h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          High-throughput end-to-end edge and cloud architecture enabling automated ANPR extraction, cross-camera Re-ID correlation, and real-time BOLO threat matching.
        </p>
      </div>

      {/* Latency & Throughput Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-[10px] uppercase">TOTAL INFERENCE PIPELINE LATENCY</span>
            <span className="text-2xl font-bold text-cyan-300 block mt-0.5">14.4 ms</span>
          </div>
          <Zap className="w-6 h-6 text-cyan-400" />
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-[10px] uppercase">AGGREGATE GPU INGESTION RATE</span>
            <span className="text-2xl font-bold text-emerald-400 block mt-0.5">720 FPS</span>
          </div>
          <Cpu className="w-6 h-6 text-emerald-400" />
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-[10px] uppercase">CROSS-CAMERA CORRELATION ACCURACY</span>
            <span className="text-2xl font-bold text-white block mt-0.5">99.2%</span>
          </div>
          <CheckCircle2 className="w-6 h-6 text-indigo-400" />
        </div>
      </div>

      {/* Visual Pipeline Stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pipelineStages.map((stage, idx) => (
          <TacticalCard
            key={idx}
            corners={true}
            title={stage.stage}
            subtitle={stage.title}
            icon={Cpu}
            className="flex flex-col justify-between"
          >
            <p className="text-xs text-slate-300 leading-relaxed font-sans mb-4">
              {stage.desc}
            </p>

            <div className="pt-3 border-t border-slate-800/80 font-mono text-[11px] space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>ENGINE / STACK:</span>
                <span className="text-slate-200 font-semibold">{stage.tech}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>STAGE LATENCY:</span>
                <span className="text-cyan-400 font-bold">{stage.latency}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 pt-1">
                <span>STATUS:</span>
                <span className="px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  {stage.status}
                </span>
              </div>
            </div>
          </TacticalCard>
        ))}
      </div>
    </div>
  );
};
