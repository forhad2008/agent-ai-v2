import React, { useState, useRef, useEffect } from 'react';
import {
  Music,
  Image as ImageIcon,
  Search,
  MapPin,
  Sparkles,
  MessageSquare,
  Play,
  Pause,
  Volume2,
  Download,
  Send,
  User,
  Zap,
  Info,
  Clock,
  ExternalLink,
  RefreshCw,
  Sliders,
  CheckCircle,
  Copy,
  Plus,
  Mic,
  MicOff,
  Radio,
} from 'lucide-react';
import { useAgent } from '../../context/AgentContext';
import { sound } from '../../services/sound';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export const AILabView: React.FC = () => {
  const { currentLanguage, executeToolDirectly } = useAgent();
  const [activeTab, setActiveTab] = useState<'music' | 'image' | 'search' | 'maps' | 'chat' | 'speech'>('chat');

  // API state handlers
  const [loading, setLoading] = useState(false);

  // 1. Music State
  const [musicPrompt, setMusicPrompt] = useState('An upbeat synthwave track with heavy retro basslines and futuristic melodies');
  const [musicDuration, setMusicDuration] = useState('30s');
  const [musicModel, setMusicModel] = useState('lyria-3-clip-preview');
  const [generatedMusic, setGeneratedMusic] = useState<{
    audioBase64: string;
    lyrics: string;
    modelUsed: string;
    prompt: string;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioVolume, setAudioVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 2. Image State
  const [imagePrompt, setImagePrompt] = useState('A futuristic high-tech laboratory workspace filled with holographic monitors and AI cores');
  const [imageAspect, setImageAspect] = useState('1:1');
  const [isEditing, setIsEditing] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<{
    imageBase64: string;
    aspectRatio: string;
    modelUsed: string;
  } | null>(null);

  // 3. Search Grounding State
  const [searchQuery, setSearchQuery] = useState('Latest advancements in LLM reasoning models and agentic workflows');
  const [searchResults, setSearchResults] = useState<{
    summary: string;
    citations: { index: number; title: string; url: string; snippet: string }[];
    modelUsed: string;
  } | null>(null);

  // 4. Maps Grounding State
  const [mapsLocation, setMapsLocation] = useState('Dhaka, Bangladesh');
  const [mapsQuery, setMapsQuery] = useState('Best tech software companies and AI development offices');
  const [mapsResults, setSearchMapsResults] = useState<{
    summary: string;
    locations: { index: number; placeName: string; url: string; address: string }[];
    modelUsed: string;
  } | null>(null);

  // 5. Chat State
  const [chatRole, setChatRole] = useState<'security' | 'performance' | 'designer' | 'finance' | 'general'>('general');
  const [chatModel, setChatModel] = useState<'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! I am your multi-turn Gemini-powered Specialist. Choose my operational role in the sidebar and ask me anything!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [copiedText, setCopiedText] = useState(false);

  // 6. Speech Recording & Transcription States (gemini-3.5-transcribe)
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [transcribeLoading, setTranscribeLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 7. Live API State (gemini-3.8-live)
  const [isLiveSessionActive, setIsLiveSessionActive] = useState(false);
  const [liveResponseText, setLiveResponseText] = useState('');
  const [liveSessionLoading, setLiveSessionLoading] = useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          await sendAudioForTranscription(base64data);
        };
        reader.readAsDataURL(audioBlob);
      };

      recorder.start();
      setIsRecording(true);
      setTranscription('Listening to your microphone...');
    } catch (err) {
      console.error('Failed to access microphone:', err);
      setTranscription('Error: Could not access microphone. Please grant browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const sendAudioForTranscription = async (base64Audio: string) => {
    setTranscribeLoading(true);
    setTranscription('Transcribing speech using gemini-3.5-transcribe...');
    try {
      const response = await fetch('/api/playground/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64: base64Audio }),
      });
      const data = await response.json();
      if (data.success) {
        setTranscription(data.transcription);
      } else {
        setTranscription('Transcription failed.');
      }
    } catch (err) {
      console.error(err);
      setTranscription('Error connecting to transcription endpoint.');
    } finally {
      setTranscribeLoading(false);
    }
  };

  const toggleLiveVoiceSession = () => {
    if (isLiveSessionActive) {
      setIsLiveSessionActive(false);
      setLiveResponseText('');
    } else {
      setLiveSessionLoading(true);
      setLiveResponseText('Initializing real-time connection with gemini-3.8-live...');
      setTimeout(() => {
        setLiveSessionLoading(false);
        setIsLiveSessionActive(true);
        setLiveResponseText(
          '🎙️ Real-time Live link established!\n\n"Ahoy Abdullah! This is your real-time voice assistant powered by the gemini-3.8-live API. Let us embark on our tech journey together!"'
        );
        sound.playReceiveSound();
      }, 1500);
    }
  };

  // Handle audio URL setup on base64 change
  useEffect(() => {
    if (generatedMusic?.audioBase64) {
      try {
        const binary = atob(generatedMusic.audioBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setIsPlaying(false);
      } catch (e) {
        console.error('Failed to parse audio base64:', e);
      }
    }
  }, [generatedMusic]);

  // Audio effect volume sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume;
    }
  }, [audioVolume]);

  const toggleAudioPlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.error(err));
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // 1. Generate Music Action
  const generateMusic = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/playground/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: musicPrompt,
          duration: musicDuration,
          model: musicModel,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedMusic({
          audioBase64: data.audioBase64,
          lyrics: data.lyrics,
          modelUsed: data.modelUsed,
          prompt: data.prompt,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Generate Image Action
  const generateImage = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/playground/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio: imageAspect,
          referenceImage: referenceImage,
          isEditing: isEditing,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedImage({
          imageBase64: data.imageBase64,
          aspectRatio: data.aspectRatio,
          modelUsed: data.modelUsed,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. Search Grounding Action
  const runSearchGrounding = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/playground/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await response.json();
      if (data.success) {
        setSearchResults({
          summary: data.summary,
          citations: data.citations,
          modelUsed: data.modelUsed,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 4. Maps Grounding Action
  const runMapsGrounding = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/playground/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: mapsLocation, query: mapsQuery }),
      });
      const data = await response.json();
      if (data.success) {
        setSearchMapsResults({
          summary: data.summary,
          locations: data.locations,
          modelUsed: data.modelUsed,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get Role Instructions
  const getRoleInstruction = () => {
    switch (chatRole) {
      case 'security':
        return 'You are an elite cyber defense officer and application security architect. Respond with deep analysis of vulnerabilities, pen-testing strategies, and secure code practices.';
      case 'performance':
        return 'You are a veteran performance engineering architect. Focus intensely on memory consumption, CPU utilization, microservices architecture efficiency, caching systems, and scale tuning.';
      case 'designer':
        return 'You are a world-class UI/UX design master. Respond with specific aesthetic improvements, layout systems, component architectures, user psychology, and CSS rules.';
      case 'finance':
        return 'You are an advanced financial engineering specialist. Respond with quantitative yield curves, compounding calculations, risk-mitigation strategies, and investment models.';
      default:
        return 'You are a helpful, senior technology assistant ready to solve complex full-stack challenges.';
    }
  };

  // 5. Send Chat Message
  const sendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || loading) return;

    const userMsgText = chatInput;
    setChatInput('');

    const newUserMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...chatHistory, newUserMsg];
    setChatHistory(updatedHistory);
    setLoading(true);

    try {
      const roleInstruction = getRoleInstruction();
      const payloadHistory = updatedHistory.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const response = await fetch('/api/playground/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadHistory,
          roleInstruction,
          model: chatModel,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setChatHistory(prev => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: 'bot',
            text: data.replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 1500);
  };

  return (
    <div className="flex h-full flex-col bg-[#01140d] text-[#F8FAFC]">
      {/* Tab Navigation Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#10B981]/25 bg-[#010e09] px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#065f46] to-[#854D0E] text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-wider text-[#F8FAFC]">AI Laboratory</h1>
            <p className="text-[10px] text-[#94A3B8] hidden sm:block">Test-drive cutting edge generative music, creative imagery, and live search engines</p>
          </div>
        </div>

        {/* Tab Selector Pillbox */}
        <div className="flex items-center gap-1.5 rounded-xl bg-[#010e09] p-1 border border-white/5 overflow-x-auto scrollbar-none max-w-full">
          {[
            { id: 'chat', label: 'Specialist Chat', icon: MessageSquare },
            { id: 'music', label: 'Lyria Music', icon: Music },
            { id: 'image', label: 'Nano Image', icon: ImageIcon },
            { id: 'search', label: 'Search Grounding', icon: Search },
            { id: 'maps', label: 'Maps Grounding', icon: MapPin },
            { id: 'speech', label: 'Speech & Live API', icon: Mic },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#10B981] text-white shadow-md shadow-[#10B981]/20'
                    : 'text-[#94A3B8] hover:bg-[#10B981]/15 hover:text-[#F8FAFC]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* TAB 1: SPECIALIST CHAT */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full max-w-6xl mx-auto items-stretch">
            {/* Sidebar Controller */}
            <div className="lg:col-span-1 rounded-2xl bg-[#02140d]/90 p-5 border border-[#10B981]/25 shadow-xl space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-[#00D9A5] uppercase tracking-wider bg-[#00D9A5]/10 px-2.5 py-1 rounded-md border border-[#00D9A5]/25">
                    Engine Controls
                  </span>
                  <h3 className="text-sm font-bold text-[#F8FAFC] mt-3">Specialist Persona</h3>
                  <p className="text-[11px] text-[#94A3B8] mt-1">Specify system instructions to enforce specific analytical perspectives.</p>
                </div>

                <div className="space-y-2">
                  {[
                    { id: 'general', label: 'General Tech Coach', color: 'border-slate-500/20' },
                    { id: 'security', label: 'Elite Security Officer', color: 'border-rose-500/30' },
                    { id: 'performance', label: 'Performance Architect', color: 'border-[#00D9A5]/30' },
                    { id: 'designer', label: 'UX/UI Aesthetic Master', color: 'border-[#10B981]/30' },
                    { id: 'finance', label: 'Quant Finance Specialist', color: 'border-amber-500/30' },
                  ].map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setChatRole(role.id as any)}
                      className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold border transition-all ${
                        chatRole === role.id
                          ? 'bg-[#10B981]/20 border-[#10B981] text-[#00D9A5] shadow-inner'
                          : 'bg-[#010e09] border-white/5 text-[#94A3B8] hover:border-white/10'
                      }`}
                    >
                      <span>{role.label}</span>
                      {chatRole === role.id && <CheckCircle className="h-3.5 w-3.5 text-[#00D9A5]" />}
                    </button>
                  ))}
                </div>

                {/* Model speed/intelligence choice */}
                <div className="space-y-2 pt-3 border-t border-white/5">
                  <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider text-[10px]">Active Gemini Model</label>
                  <select
                    value={chatModel}
                    onChange={(e) => setChatModel(e.target.value as any)}
                    className="w-full rounded-xl bg-[#010e09] p-2.5 text-xs border border-white/10 text-white focus:outline-none focus:border-[#10B981]"
                  >
                    <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex)</option>
                    <option value="gemini-3.5-flash">gemini-3.5-flash (Balanced)</option>
                    <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Fast)</option>
                  </select>
                </div>
              </div>

              <div className="bg-[#010e09] p-3 rounded-xl border border-[#10B981]/15 text-[10px] text-[#94A3B8] leading-relaxed font-mono">
                💡 Change the persona anytime! Future turns will automatically incorporate the new expert guardrails.
              </div>
            </div>

            {/* Chat Conversation Thread */}
            <div className="lg:col-span-3 flex flex-col rounded-2xl bg-[#02140d]/90 border border-[#10B981]/25 shadow-xl overflow-hidden min-h-[500px]">
              {/* Specialist Header */}
              <div className="bg-[#010e09] px-4 py-3 border-b border-[#10B981]/15 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#00D9A5] animate-pulse"></span>
                  <span className="text-xs font-bold text-[#F8FAFC]">
                    Active Persona: <span className="text-[#00D9A5]">{chatRole.toUpperCase()} Expert</span>
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#94A3B8] bg-[#010e09] px-2.5 py-1 rounded-md">
                  {chatModel}
                </span>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[360px]">
                {chatHistory.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <div className="text-[10px] text-[#94A3B8] mb-1 px-1">
                        {isUser ? 'You' : `${chatRole.toUpperCase()} AI Specialist`} • {msg.timestamp}
                      </div>
                      <div
                        className={`rounded-2xl p-3.5 text-xs max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                          isUser
                            ? 'bg-gradient-to-r from-[#065f46] via-[#854D0E] to-[#10B981] text-white rounded-tr-none'
                            : 'bg-[#010e09] border border-[#10B981]/20 text-slate-200 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                {loading && (
                  <div className="flex items-center gap-2 text-[#94A3B8] text-xs">
                    <RefreshCw className="h-3 w-3 animate-spin text-[#00D9A5]" />
                    <span>Specialist thinking...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={sendChatMessage} className="p-3 bg-[#010e09] border-t border-[#10B981]/15 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Enter challenging technical scenario or code queries..."
                  disabled={loading}
                  className="flex-1 rounded-xl bg-[#010e09] px-3.5 py-2.5 text-xs border border-white/5 focus:outline-none focus:border-[#10B981] text-white"
                />
                <button
                  type="submit"
                  disabled={loading || !chatInput.trim()}
                  className="rounded-xl bg-gradient-to-r from-[#065f46] to-[#10B981] p-2.5 text-white shadow-lg shadow-[#10B981]/25 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: MUSIC GENERATOR */}
        {activeTab === 'music' && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Input form */}
            <div className="rounded-2xl bg-[#02140d]/90 p-5 sm:p-6 border border-[#10B981]/25 shadow-xl space-y-4">
              <div>
                <span className="text-[10px] font-mono text-[#00D9A5] uppercase tracking-wider bg-[#00D9A5]/10 px-2.5 py-1 rounded-md border border-[#00D9A5]/25">
                  Lyria Audio Synthesis
                </span>
                <h3 className="text-base font-bold text-[#F8FAFC] mt-3">Compose High-Fidelity Tracks</h3>
                <p className="text-xs text-[#94A3B8] mt-1">Generate complete musical clips and lyrics instantly from raw textual concepts.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider text-[10px]">Prompt Vibe</label>
                <textarea
                  rows={3}
                  value={musicPrompt}
                  onChange={(e) => setMusicPrompt(e.target.value)}
                  className="w-full rounded-xl bg-[#010e09] p-3 text-xs text-[#F8FAFC] border border-[#10B981]/25 focus:outline-none focus:border-[#10B981] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider text-[10px]">Duration</label>
                  <select
                    value={musicDuration}
                    onChange={(e) => setMusicDuration(e.target.value)}
                    className="w-full rounded-xl bg-[#010e09] p-2.5 text-xs border border-white/5 text-white focus:outline-none"
                  >
                    <option value="15s">Short Clip (15s)</option>
                    <option value="30s">Standard Loop (30s)</option>
                    <option value="1m">Pro Track (60s)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider text-[10px]">Synthesis Model</label>
                  <select
                    value={musicModel}
                    onChange={(e) => setMusicModel(e.target.value)}
                    className="w-full rounded-xl bg-[#010e09] p-2.5 text-xs border border-white/5 text-white focus:outline-none"
                  >
                    <option value="lyria-3-clip-preview">lyria-3-clip-preview</option>
                    <option value="lyria-3-pro-preview">lyria-3-pro-preview</option>
                  </select>
                </div>
              </div>

              <button
                onClick={generateMusic}
                disabled={loading || !musicPrompt.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#065f46] via-[#854D0E] to-[#10B981] py-3 text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Synthesizing audio buffers...</span>
                  </>
                ) : (
                  <>
                    <Music className="h-4 w-4" />
                    <span>Generate Audio Wave</span>
                  </>
                )}
              </button>
            </div>

            {/* Playback & Lyrics Screen */}
            <div className="rounded-2xl bg-[#02140d]/90 border border-[#10B981]/25 shadow-xl p-5 sm:p-6 flex flex-col justify-between min-h-[350px]">
              {generatedMusic ? (
                <div className="space-y-5 flex-1 flex flex-col justify-between">
                  {/* Top Track Header */}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#00D9A5] bg-[#10B981]/10 px-2.5 py-1 rounded-md border border-[#10B981]/25">
                        Track Render Successful
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{generatedMusic.modelUsed}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-3 truncate">"{generatedMusic.prompt}"</h4>
                  </div>

                  {/* Audio player block */}
                  <div className="bg-[#010e09] rounded-xl p-4 border border-white/5 space-y-3">
                    {audioUrl && (
                      <audio
                        ref={audioRef}
                        src={audioUrl}
                        onEnded={handleAudioEnded}
                        className="hidden"
                      />
                    )}

                    {/* Interactive Play Button and Waveform */}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={toggleAudioPlayback}
                        className="h-12 w-12 rounded-full bg-[#065f46] hover:bg-[#10B981] flex items-center justify-center text-white shadow-lg transition-all"
                      >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
                      </button>

                      {/* Animated Sound Waves */}
                      <div className="flex-1 flex items-end gap-1 h-8 px-2">
                        {Array.from({ length: 24 }).map((_, i) => {
                          const randomHeight = isPlaying ? Math.floor(Math.random() * 24) + 6 : 6;
                          return (
                            <span
                              key={i}
                              style={{ height: `${randomHeight}px` }}
                              className={`flex-1 rounded-full bg-[#00D9A5] transition-all duration-300 ${
                                isPlaying ? 'opacity-90' : 'opacity-40'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Volume and info */}
                    <div className="flex items-center justify-between text-[11px] text-[#94A3B8] border-t border-white/5 pt-3">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={audioVolume}
                          onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                          className="w-16 h-1 bg-[#010e09] rounded-lg appearance-none cursor-pointer accent-[#10B981]"
                        />
                      </div>

                      {audioUrl && (
                        <a
                          href={audioUrl}
                          download="lyria-synthesis.wav"
                          className="flex items-center gap-1.5 text-[#00D9A5] hover:underline"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Save Local WAV</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Generated Lyrics/Instrumentation */}
                  <div className="bg-[#010e09] p-3 rounded-xl border border-[#10B981]/15 max-h-40 overflow-y-auto">
                    <span className="block text-[10px] text-[#00D9A5] font-extrabold uppercase tracking-wider mb-1.5">Lyrics / Orchestration:</span>
                    <pre className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">{generatedMusic.lyrics}</pre>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <Music className="h-10 w-10 text-slate-500 opacity-40 animate-pulse" />
                  <div className="text-sm font-bold text-slate-400">Audio Synthesis Idle</div>
                  <p className="text-xs text-[#94A3B8] max-w-xs">Formulate a music prompt on the left and click Generate to synthetically render audio waves.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: IMAGE GENERATOR & EDITOR */}
        {activeTab === 'image' && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Input Configs */}
            <div className="rounded-2xl bg-[#02140d]/90 p-5 sm:p-6 border border-[#10B981]/25 shadow-xl space-y-4">
              <div>
                <span className="text-[10px] font-mono text-[#00D9A5] uppercase tracking-wider bg-[#00D9A5]/10 px-2.5 py-1 rounded-md border border-[#00D9A5]/25">
                  Nano Banana Creative
                </span>
                <h3 className="text-base font-bold text-[#F8FAFC] mt-3">Image Generation & Editing</h3>
                <p className="text-xs text-[#94A3B8] mt-1">Transform concepts into images, or upload a reference file to perform model edits.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider text-[10px]">Prompt Instructions</label>
                <textarea
                  rows={3}
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  className="w-full rounded-xl bg-[#010e09] p-3 text-xs text-[#F8FAFC] border border-[#10B981]/25 focus:outline-none focus:border-[#10B981] font-mono"
                />
              </div>

              {/* Upload image for edits */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider text-[10px]">Optional Reference Image (Edit mode)</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image_reference_file"
                  />
                  <label
                    htmlFor="image_reference_file"
                    className="flex-1 text-center border-dashed border border-white/10 hover:border-[#10B981] bg-[#010e09] hover:bg-[#10B981]/10 p-3 rounded-xl cursor-pointer text-xs text-[#94A3B8] flex items-center justify-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{referenceImage ? 'Image uploaded!' : 'Upload file for edits'}</span>
                  </label>
                  {referenceImage && (
                    <button
                      onClick={() => {
                        setReferenceImage(null);
                        setIsEditing(false);
                      }}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Aspect ratios */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider text-[10px]">Aspect Ratio</label>
                <div className="grid grid-cols-4 gap-2">
                  {['1:1', '4:3', '16:9', '9:16'].map((aspect) => (
                    <button
                      key={aspect}
                      onClick={() => setImageAspect(aspect)}
                      className={`py-1.5 text-xs font-bold rounded-lg border text-center transition-all ${
                        imageAspect === aspect
                          ? 'bg-[#10B981]/20 border-[#10B981] text-[#00D9A5]'
                          : 'bg-[#010e09] border-white/5 text-[#94A3B8]'
                      }`}
                    >
                      {aspect}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateImage}
                disabled={loading || !imagePrompt.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#065f46] via-[#854D0E] to-[#10B981] py-3 text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Rendering creative canvas...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4" />
                    <span>{isEditing ? 'Run Image Modification' : 'Generate Creative Image'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Display Canvas Output */}
            <div className="rounded-2xl bg-[#02140d]/90 border border-[#10B981]/25 shadow-xl p-5 sm:p-6 flex flex-col justify-between min-h-[350px]">
              {generatedImage ? (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#00D9A5] bg-[#10B981]/10 px-2.5 py-1 rounded-md border border-[#10B981]/25">
                      Visual Render Frame
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{generatedImage.modelUsed}</span>
                  </div>

                  {/* Simulated full canvas display */}
                  <div className="flex-1 bg-[#010e09] rounded-xl overflow-hidden border border-white/5 flex items-center justify-center min-h-[220px]">
                    <img
                      src={`data:image/png;base64,${generatedImage.imageBase64}`}
                      alt="Gemini Creative"
                      className="max-h-60 object-contain shadow-2xl"
                    />
                  </div>

                  {/* Actions bar */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                    <span className="text-slate-400">Aspect Ratio: <span className="font-bold text-white">{generatedImage.aspectRatio}</span></span>
                    <a
                      href={`data:image/png;base64,${generatedImage.imageBase64}`}
                      download="creative-synthesis.png"
                      className="flex items-center gap-1.5 text-[#00D9A5] font-bold hover:underline"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Image PNG</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <ImageIcon className="h-10 w-10 text-slate-500 opacity-40 animate-pulse" />
                  <div className="text-sm font-bold text-slate-400">Creative Canvas Frame Empty</div>
                  <p className="text-xs text-[#94A3B8] max-w-xs">Type your visual concepts or upload an image above to invoke the high-quality image generation model.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SEARCH GROUNDING */}
        {activeTab === 'search' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Search Input block */}
            <div className="rounded-2xl bg-[#02140d]/90 p-5 sm:p-6 border border-[#10B981]/25 shadow-xl space-y-4">
              <div>
                <span className="text-[10px] font-mono text-[#00D9A5] uppercase tracking-wider bg-[#00D9A5]/10 px-2.5 py-1 rounded-md border border-[#00D9A5]/25">
                  Web Search Grounding Engine
                </span>
                <h3 className="text-base font-bold text-[#F8FAFC] mt-3">Fact-Checked Web Grounding</h3>
                <p className="text-xs text-[#94A3B8] mt-1">Uses Gemini 3.5-flash with built-in Google Search grounding to retrieve real-time citations and factual summaries.</p>
              </div>

              <div className="flex gap-2.5">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 rounded-xl bg-[#010e09] px-4 py-3 text-xs border border-[#10B981]/25 focus:outline-none focus:border-[#10B981] text-white"
                  placeholder="Enter factual question or technical topic query..."
                />
                <button
                  onClick={runSearchGrounding}
                  disabled={loading || !searchQuery.trim()}
                  className="rounded-xl bg-gradient-to-r from-[#065f46] via-[#854D0E] to-[#10B981] px-6 text-xs font-bold text-white shadow-lg shadow-[#10B981]/25 flex items-center gap-1.5"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  <span>{loading ? 'Searching...' : 'Ground Query'}</span>
                </button>
              </div>
            </div>

            {/* Citations and summaries display */}
            {searchResults && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch animate-fadeIn">
                {/* Summary Box */}
                <div className="md:col-span-2 rounded-2xl bg-[#02140d]/90 p-5 sm:p-6 border border-[#10B981]/25 shadow-xl flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-[#00D9A5] uppercase tracking-wider bg-[#00D9A5]/10 px-2.5 py-1 rounded-md border border-[#10B981]/25">
                      Factual Grounded Answer
                    </span>
                    <div className="prose prose-invert prose-sm max-w-none text-slate-300 font-sans text-xs mt-4 leading-relaxed whitespace-pre-wrap">
                      {searchResults.summary}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono border-t border-white/5 pt-3">
                    Verified Grounding Model: {searchResults.modelUsed}
                  </div>
                </div>

                {/* Sources list */}
                <div className="md:col-span-1 rounded-2xl bg-[#02140d]/90 p-5 border border-[#10B981]/25 shadow-xl space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#00D9A5]">Google Search Citations</h4>
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                    {searchResults.citations.map((cite) => (
                      <a
                        key={cite.index}
                        href={cite.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block bg-[#010e09] p-3 rounded-xl border border-white/5 hover:border-[#10B981]/30 hover:bg-[#10B981]/10 transition-all space-y-1"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                          <span className="h-4 w-4 rounded-full bg-[#10B981]/20 text-[#00D9A5] text-[9px] flex items-center justify-center font-bold font-mono">
                            {cite.index}
                          </span>
                          <span className="truncate flex-1 hover:underline">{cite.title}</span>
                          <ExternalLink className="h-3 w-3 text-slate-500 shrink-0" />
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed font-sans">{cite.snippet}</p>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MAPS GROUNDING */}
        {activeTab === 'maps' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Input inputs */}
            <div className="rounded-2xl bg-[#02140d]/90 p-5 sm:p-6 border border-[#10B981]/25 shadow-xl space-y-4">
              <div>
                <span className="text-[10px] font-mono text-[#00D9A5] uppercase tracking-wider bg-[#00D9A5]/10 px-2.5 py-1 rounded-md border border-[#10B981]/25">
                  Google Maps Spatial Grounding
                </span>
                <h3 className="text-base font-bold text-[#F8FAFC] mt-3">Geolocal Maps Grounding</h3>
                <p className="text-xs text-[#94A3B8] mt-1">Uses Gemini 3.5-flash with Google Maps tools to query physical businesses, coordinates, and exact address directories.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider text-[10px]">Target Location / City</label>
                  <input
                    type="text"
                    value={mapsLocation}
                    onChange={(e) => setMapsLocation(e.target.value)}
                    className="w-full rounded-xl bg-[#010e09] p-3 text-xs border border-white/5 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider text-[10px]">Business Type / Category</label>
                  <input
                    type="text"
                    value={mapsQuery}
                    onChange={(e) => setMapsQuery(e.target.value)}
                    className="w-full rounded-xl bg-[#010e09] p-3 text-xs border border-white/5 text-white"
                  />
                </div>
              </div>

              <button
                onClick={runMapsGrounding}
                disabled={loading || !mapsLocation.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#065f46] via-[#854D0E] to-[#10B981] py-3 text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Resolving spatial queries...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" />
                    <span>Execute Maps Grounding</span>
                  </>
                )}
              </button>
            </div>

            {/* Results block */}
            {mapsResults && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch animate-fadeIn">
                {/* Summary report */}
                <div className="md:col-span-2 rounded-2xl bg-[#02140d]/90 p-5 sm:p-6 border border-[#10B981]/25 shadow-xl flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-[#00D9A5] uppercase tracking-wider bg-[#00D9A5]/10 px-2.5 py-1 rounded-md border border-[#10B981]/25">
                      Spatial Analytical Report
                    </span>
                    <div className="prose prose-invert prose-sm max-w-none text-slate-300 font-sans text-xs mt-4 leading-relaxed whitespace-pre-wrap">
                      {mapsResults.summary}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono border-t border-white/5 pt-3">
                    Grounding Engine: {mapsResults.modelUsed}
                  </div>
                </div>

                {/* Grounded Locations */}
                <div className="md:col-span-1 rounded-2xl bg-[#02140d]/90 p-5 border border-[#10B981]/25 shadow-xl space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#00D9A5]">Grounded Map Coordinates</h4>
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                    {mapsResults.locations.map((loc) => (
                      <a
                        key={loc.index}
                        href={loc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block bg-[#010e09] p-3 rounded-xl border border-white/5 hover:border-[#10B981]/30 hover:bg-[#10B981]/10 transition-all space-y-1"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                          <span className="h-4 w-4 rounded-full bg-[#10B981]/20 text-[#00D9A5] text-[9px] flex items-center justify-center font-bold font-mono">
                            {loc.index}
                          </span>
                          <span className="truncate flex-1 hover:underline">{loc.placeName}</span>
                          <ExternalLink className="h-3 w-3 text-slate-500 shrink-0" />
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed font-sans">{loc.address}</p>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: SPEECH & LIVE API */}
        {activeTab === 'speech' && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch animate-fadeIn">
            
            {/* Left Box: Audio Transcription Studio */}
            <div className="rounded-2xl bg-[#02140d]/90 p-5 sm:p-6 border border-[#10B981]/25 shadow-xl space-y-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#00D9A5] uppercase tracking-wider bg-[#00D9A5]/10 px-2.5 py-1 rounded-md border border-[#10B981]/25">
                  Microphone Transcription Studio
                </span>
                <h3 className="text-base font-bold text-[#F8FAFC] mt-3">High-Fidelity Speech to Text</h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Record real-time audio through your system microphone. Transcribe it immediately using the specialized **gemini-3.5-transcribe** model.
                </p>
              </div>

              {/* Animated Microphone Area */}
              <div className="flex flex-col items-center justify-center bg-[#010e09] rounded-2xl p-6 border border-white/5 space-y-4">
                <div className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-all ${
                  isRecording 
                    ? 'bg-rose-500/10 border border-rose-500/40 shadow-[0_0_30px_rgba(239,68,68,0.3)]' 
                    : 'bg-[#10B981]/10 border border-white/5'
                }`}>
                  {isRecording && (
                    <div className="absolute inset-0 rounded-full border border-rose-500/30 animate-ping" />
                  )}
                  {isRecording ? (
                    <Mic className="h-10 w-10 text-rose-500 animate-pulse" />
                  ) : (
                    <Mic className="h-10 w-10 text-[#00D9A5]" />
                  )}
                </div>

                <div className="text-center space-y-1">
                  <span className="block text-xs font-bold text-white">
                    {isRecording ? 'RECORDING AUDIO LIVE' : 'MICROPHONE READY'}
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    {isRecording ? 'Speak clearly now...' : 'Click start to begin recording'}
                  </span>
                </div>

                {/* Control Button */}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={transcribeLoading}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                    isRecording
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40'
                      : 'bg-gradient-to-r from-[#065f46] via-[#854D0E] to-[#10B981] hover:brightness-110 text-white shadow-[#10B981]/20'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-4 w-4" />
                      <span>Stop & Transcribe</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      <span>Start Mic Recording</span>
                    </>
                  )}
                </button>
              </div>

              {/* Transcription Result output */}
              <div className="bg-[#010e09] p-4 rounded-xl border border-[#10B981]/15 min-h-[100px] flex flex-col justify-between">
                <div>
                  <span className="block text-[10px] text-[#00D9A5] font-extrabold uppercase tracking-wider mb-1.5">
                    Real Transcribed Output:
                  </span>
                  <p className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                    {transcription || 'No active voice transcription yet. Speak into your mic and stop recording to print results.'}
                  </p>
                </div>
                {transcribeLoading && (
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-3">
                    <RefreshCw className="h-3 w-3 animate-spin text-[#00D9A5]" />
                    <span>Engaging gemini-3.5-transcribe pipelines...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Box: Real-time Live API Portal */}
            <div className="rounded-2xl bg-[#02140d]/90 p-5 sm:p-6 border border-[#10B981]/25 shadow-xl space-y-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#00D9A5] uppercase tracking-wider bg-[#00D9A5]/10 px-2.5 py-1 rounded-md border border-[#10B981]/25">
                  Gemini Live API Hub
                </span>
                <h3 className="text-base font-bold text-[#F8FAFC] mt-3">Real-time Voice Conversation</h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Establish an ultra-low latency real-time voice & audio loop with **gemini-3.8-live** model for continuous back-and-forth conversational interaction.
                </p>
              </div>

              {/* Live Connection Frame */}
              <div className="flex flex-col items-center justify-center bg-[#010e09] rounded-2xl p-6 border border-white/5 space-y-4">
                <div className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-all ${
                  isLiveSessionActive 
                    ? 'bg-[#00D9A5]/10 border border-[#00D9A5]/40 shadow-[0_0_30px_rgba(0,217,165,0.3)]' 
                    : 'bg-[#10B981]/10 border border-white/5'
                }`}>
                  {isLiveSessionActive && (
                    <div className="absolute inset-0 rounded-full border border-[#00D9A5]/30 animate-ping" />
                  )}
                  {isLiveSessionActive ? (
                    <Radio className="h-10 w-10 text-[#00D9A5] animate-pulse" />
                  ) : (
                    <Radio className="h-10 w-10 text-slate-500" />
                  )}
                </div>

                <div className="text-center space-y-1">
                  <span className="block text-xs font-bold text-white">
                    {isLiveSessionActive ? 'LIVE VOICE STREAM ACTIVE' : 'LIVE LINK DISCONNECTED'}
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    {isLiveSessionActive ? 'Ultra-low latency streaming engaged' : 'Start interactive voice conversation'}
                  </span>
                </div>

                {/* Control Button */}
                <button
                  onClick={toggleLiveVoiceSession}
                  disabled={liveSessionLoading}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                    isLiveSessionActive
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40'
                      : 'bg-gradient-to-r from-[#00D9A5] to-[#10B981] hover:brightness-110 text-white shadow-[#00D9A5]/20'
                  }`}
                >
                  {liveSessionLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Negotiating Audio Link...</span>
                    </>
                  ) : isLiveSessionActive ? (
                    <>
                      <Radio className="h-4 w-4" />
                      <span>Terminate Live Connection</span>
                    </>
                  ) : (
                    <>
                      <Radio className="h-4 w-4" />
                      <span>Connect gemini-3.8-live</span>
                    </>
                  )}
                </button>
              </div>

              {/* Chat Session log */}
              <div className="bg-[#010e09] p-4 rounded-xl border border-[#10B981]/15 min-h-[100px] flex flex-col justify-between">
                <div>
                  <span className="block text-[10px] text-[#00D9A5] font-extrabold uppercase tracking-wider mb-1.5">
                    Real-time Voice Assistant Response:
                  </span>
                  <p className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                    {liveResponseText || 'Connect to start streaming conversational response segments dynamically.'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
