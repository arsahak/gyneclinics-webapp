"use client";

import { Loader2, Mic, MicOff, PhoneOff, Timer, Video as VideoIcon, VideoOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LocalTrack, RemoteParticipant, RemoteTrack, Room } from "twilio-video";
import { joinTestCallAction } from "@/app/actions/videoAction";
import { Button } from "@/component/ui/button";
import { Card } from "@/component/ui/card";
import { cn } from "@/lib/utils";

// A doctor and a patient meet in one shared Twilio Video room. Twilio ends
// each person's call after `maxMinutes` (set on the backend).

type Phase = "idle" | "joining" | "connected" | "ended";

/** Identity is "role|name|id" (set by the backend). */
function who(identity: string) {
  const [role, name] = identity.split("|");
  return { role, name: name || "Guest" };
}

const mmss = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.max(0, seconds) % 60).padStart(2, "0")}`;

/** Readable text for Twilio and browser errors. */
function errorMessage(error: unknown) {
  const { name, code, message } = (error ?? {}) as { name?: string; code?: number; message?: string };
  if (name === "NotAllowedError") return "Allow camera and microphone access in your browser, then try again.";
  if (name === "NotFoundError") return "No camera or microphone found on this device.";
  if (name === "NotSupportedError" || name === "TypeError") return "This browser can't make video calls. Try Chrome, Edge or Safari.";
  if (name === "NotReadableError") return "Your camera or microphone is in use by another app.";
  if (code === 53105) return "Two people are already in the test call. Please try again later.";
  return message || "Couldn't join the call. Please try again.";
}

const VIDEO = { width: 1280, height: 720, frameRate: 24 };

/**
 * The camera and mic this device can give. Whatever is missing or busy is left
 * out, so the call still works (at worst you can only watch and listen).
 * A refused permission is thrown, so we can ask for it.
 */
async function deviceTracks(): Promise<{ tracks: LocalTrack[]; problem: string | null }> {
  const { createLocalTracks } = await import("twilio-video");
  let problem: string | null = null;
  for (const options of [{ audio: true, video: VIDEO }, { audio: true, video: false }, { audio: false, video: VIDEO }]) {
    try {
      return { tracks: await createLocalTracks(options), problem: null };
    } catch (error) {
      const name = (error as { name?: string })?.name;
      if (name === "NotAllowedError") throw error;
      problem = name === "NotReadableError" ? "in use by another app" : "not found";
    }
  }
  return { tracks: [], problem };
}

export function TestVideoCall({ role }: { role: "doctor" | "patient" }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [endNote, setEndNote] = useState<string | null>(null);
  const [remote, setRemote] = useState<RemoteParticipant | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  // Which devices joined the call (a device can be missing).
  const [hasMic, setHasMic] = useState(true);
  const [hasCam, setHasCam] = useState(true);
  const [deviceNote, setDeviceNote] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const roomRef = useRef<Room | null>(null);
  const localRef = useRef<HTMLDivElement>(null);
  const remoteRef = useRef<HTMLDivElement>(null);
  const otherSide = role === "doctor" ? "patient" : "doctor";

  const stopLocal = (room: Room) =>
    room.localParticipant.tracks.forEach((pub) => {
      const track = pub.track as LocalTrack;
      if ("stop" in track) track.stop();
      if ("detach" in track) track.detach().forEach((el) => el.remove());
    });

  const leave = useCallback((note?: string) => {
    const room = roomRef.current;
    roomRef.current = null;
    if (room) {
      stopLocal(room);
      room.disconnect();
    }
    setRemote(null);
    setEndNote(note ?? "You left the call.");
    setPhase("ended");
  }, []);

  // Leave the room if the page closes mid-call.
  useEffect(
    () => () => {
      roomRef.current?.disconnect();
    },
    [],
  );

  // Countdown; Twilio itself ends the call when time is up.
  useEffect(() => {
    if (phase !== "connected") return;
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const attachRemote = (track: RemoteTrack) => {
    if (track.kind === "data" || !remoteRef.current) return;
    const el = track.attach();
    el.className = track.kind === "video" ? "size-full object-cover" : "hidden";
    remoteRef.current.appendChild(el);
  };

  const showParticipant = (participant: RemoteParticipant) => {
    setRemote(participant);
    participant.tracks.forEach((pub) => pub.track && attachRemote(pub.track));
    participant.on("trackSubscribed", attachRemote);
    participant.on("trackUnsubscribed", (track: RemoteTrack) => {
      if (track.kind !== "data") track.detach().forEach((el) => el.remove());
    });
  };

  const join = async () => {
    // Clear video left from an earlier call.
    remoteRef.current?.replaceChildren();
    localRef.current?.replaceChildren();
    setError(null);
    setEndNote(null);
    // Browsers only allow the camera on https:// (or localhost).
    if (!window.isSecureContext || !navigator.mediaDevices) {
      setError("Video calls need a secure connection. Open this site with https:// and try again.");
      return;
    }
    setPhase("joining");
    let tracks: LocalTrack[] = [];
    try {
      const { ticket, error: ticketError } = await joinTestCallAction();
      if (!ticket) throw new Error(ticketError ?? "Couldn't join the call.");

      const devices = await deviceTracks();
      tracks = devices.tracks;
      const mic = tracks.some((t) => t.kind === "audio");
      const cam = tracks.some((t) => t.kind === "video");
      setHasMic(mic);
      setHasCam(cam);
      setMicOn(mic);
      setCamOn(cam);
      setDeviceNote(
        mic && cam
          ? null
          : !mic && !cam
            ? `Camera and microphone ${devices.problem ?? "not found"}. You can see and hear the ${otherSide}, but they can't see or hear you.`
            : !cam
              ? `Camera ${devices.problem ?? "not found"}. The ${otherSide} can hear you but not see you.`
              : `Microphone ${devices.problem ?? "not found"}. The ${otherSide} can see you but not hear you.`,
      );

      const { connect } = await import("twilio-video");
      const room = await connect(ticket.token, { name: ticket.roomName, tracks });
      roomRef.current = room;
      setSecondsLeft(ticket.maxMinutes * 60);
      setPhase("connected");

      // Own camera, small in the corner.
      room.localParticipant.videoTracks.forEach((pub) => {
        const el = pub.track.attach();
        el.className = "size-full object-cover -scale-x-100";
        localRef.current?.replaceChildren(el);
      });

      room.participants.forEach(showParticipant);
      room.on("participantConnected", showParticipant);
      room.on("participantDisconnected", (participant: RemoteParticipant) => {
        participant.tracks.forEach((pub) => {
          if (pub.track && pub.track.kind !== "data") pub.track.detach().forEach((el) => el.remove());
        });
        setRemote(null);
      });
      room.on("disconnected", (_room: Room, err?: { code?: number }) => {
        if (roomRef.current !== room) return; // we left on purpose
        roomRef.current = null;
        stopLocal(room);
        setRemote(null);
        setEndNote(err?.code === 53216 ? "The 30 minutes are up. The call has ended." : "The call was disconnected.");
        setPhase("ended");
      });
    } catch (err) {
      tracks.forEach((track) => "stop" in track && track.stop());
      setError(errorMessage(err));
      setPhase("idle");
    }
  };

  const toggleMic = () => {
    roomRef.current?.localParticipant.audioTracks.forEach((pub) => (micOn ? pub.track.disable() : pub.track.enable()));
    setMicOn(!micOn);
  };
  const toggleCam = () => {
    roomRef.current?.localParticipant.videoTracks.forEach((pub) => (camOn ? pub.track.disable() : pub.track.enable()));
    setCamOn(!camOn);
  };

  const other = remote ? who(remote.identity) : null;
  const connected = phase === "connected";

  return (
    <>
      {!connected && (
        <Card className="mx-auto max-w-xl p-6 text-center sm:p-10">
          <span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-primary-soft text-primary">
            <VideoIcon className="size-8" />
          </span>
          <h2 className="mt-5 font-serif text-2xl font-semibold text-foreground">
            {phase === "ended" ? "Call ended" : "Test video call"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {phase === "ended"
              ? endNote
              : `Join, then ask the ${otherSide} to open their Test call page and join too. You can talk for up to 30 minutes.`}
          </p>
          {error && (
            <p role="alert" className="mt-4 rounded-2xl bg-danger-soft p-3 text-sm text-danger">
              {error}
            </p>
          )}
          <Button size="lg" className="mt-6" onClick={join} disabled={phase === "joining"}>
            {phase === "joining" ? (
              <>
                <Loader2 className="animate-spin" /> Joining…
              </>
            ) : (
              <>
                <VideoIcon /> {phase === "ended" ? "Join again" : "Join test call"}
              </>
            )}
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">Your browser will ask to use your camera and microphone.</p>
        </Card>
      )}

      {/* Kept on the page (hidden until connected) so video can attach as soon as the call starts. */}
      <div className={cn("space-y-4", !connected && "hidden")}>
        <div className="relative aspect-video overflow-hidden rounded-3xl bg-[#0b1a24] shadow-[var(--shadow-lift)]">
          {/* The other person */}
          <div ref={remoteRef} className="absolute inset-0" />
          {!remote && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-white/80">
              <Loader2 className="size-8 animate-spin" />
              <p className="font-medium">Waiting for the {otherSide} to join…</p>
              <p className="text-sm text-white/60">Ask them to open Test call and press Join.</p>
            </div>
          )}
          {other && (
            <span className="absolute top-4 left-4 rounded-full bg-black/50 px-3 py-1 text-sm font-medium text-white backdrop-blur">
              {other.name} · {other.role === "doctor" ? "Doctor" : "Patient"}
            </span>
          )}
          <span
            className={cn(
              "absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold tabular-nums backdrop-blur",
              secondsLeft <= 300 ? "bg-danger text-white" : "bg-black/50 text-white",
            )}
          >
            <Timer className="size-4" /> {mmss(secondsLeft)}
          </span>

          {/* Me */}
          <div className="absolute right-4 bottom-4 aspect-video w-36 overflow-hidden rounded-2xl border-2 border-white/70 bg-black shadow-lg sm:w-56">
            <div ref={localRef} className={cn("size-full", !camOn && "invisible")} />
            {!camOn && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-white/70">
                {hasCam ? "Camera off" : "No camera"}
              </div>
            )}
            <span className="absolute bottom-1.5 left-2 text-[11px] font-medium text-white/90 drop-shadow">You</span>
          </div>
        </div>

        {deviceNote && (
          <p role="status" className="rounded-2xl bg-warning-soft p-3 text-center text-sm text-warning">
            {deviceNote}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant={micOn ? "outline" : "danger"} size="lg" onClick={toggleMic} aria-pressed={!micOn} disabled={!hasMic}>
            {micOn ? <Mic /> : <MicOff />} {micOn ? "Mute" : "Unmute"}
          </Button>
          <Button variant={camOn ? "outline" : "danger"} size="lg" onClick={toggleCam} aria-pressed={!camOn} disabled={!hasCam}>
            {camOn ? <VideoIcon /> : <VideoOff />} {camOn ? "Camera off" : "Camera on"}
          </Button>
          <Button variant="destructive" size="lg" onClick={() => leave()}>
            <PhoneOff /> Leave
          </Button>
        </div>
      </div>
    </>
  );
}
