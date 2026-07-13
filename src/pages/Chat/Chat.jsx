import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Alert,
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner,
  UncontrolledDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import EmojiPicker from "emoji-picker-react";
import WaveSurfer from "wavesurfer.js";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import { API_BASE_URL } from "../../helpers/apiRoutes.jsx";
import { getAccessToken } from "../../helpers/authStorage.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getSchools } from "../../services/schoolService.jsx";
import { getUser } from "../../services/userService.jsx";
import {
  addChatConversationMembers,
  blockChatConversationUser,
  blockChatUser,
  createChatConversation,
  deleteChatConversation,
  deleteChatConversationMember,
  deleteChatConversationUserMessages,
  deleteChatMessage,
  getChatConversationBlockStatus,
  getChatConversationBlocks,
  getChatConversationMembers,
  getChatConversationPresence,
  getChatConversations,
  getChatMessages,
  getChatSchoolBlocks,
  getChatSchoolSettings,
  getChatSchoolStatistics,
  getChatSchoolUsers,
  markChatConversationRead,
  reactToChatMessage,
  sendChatMessage,
  unblockChatConversationUser,
  unblockChatUser,
  updateChatConversationMember,
  updateChatConversationSettings,
  updateChatSchoolSettings,
  updateChatMessage,
  uploadChatFile,
} from "../../services/chatService.jsx";

const DEFAULT_SETTINGS = {
  isEnabled: true,
  maxFileSizeMb: 50,
  allowedMimeTypes: [],
  dailyMessageLimitPerUser: "",
  monthlyStorageLimitMb: "",
};

const MAX_FILES_PER_MESSAGE = 10;
const MAX_VOICE_RECORDING_SECONDS = 5 * 60;
const VOICE_ALLOWED_MIME_TYPES = ["audio/webm", "audio/ogg", "audio/mpeg", "audio/mp4", "audio/wav"];
const PREFERRED_AUDIO_MIME_TYPES = [
  "audio/mp4",
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/ogg",
];
const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "👏"];
const SINGLE_EMOJI_RE = /^\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*$/u;
const MEMBER_ROLE_LABELS = {
  owner: "مالک",
  admin: "ادمین",
  member: "عضو",
};
const MEMBER_ROLE_ORDER = { owner: 1, admin: 2, member: 3 };
const CONVERSATION_TYPE_META = {
  direct: { key: "direct", label: "خصوصی", icon: "bx-user" },
  group: { key: "group", label: "گروه", icon: "bx-group" },
  channel: { key: "channel", label: "کانال", icon: "bx-rss" },
};

const getId = (item) => item?.id ?? item?._id ?? null;
const toArray = (value) => (Array.isArray(value) ? value : []);
const getConversationTypeMeta = (type = "") =>
  CONVERSATION_TYPE_META[type] || { key: "conversation", label: "گفتگو", icon: "bx-message-rounded" };
const formatChatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  if (startOfDate === startOfToday) {
    return date.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  }
  if (startOfDate === startOfToday - oneDay) return "دیروز";
  return date.toLocaleDateString("fa-IR", { month: "2-digit", day: "2-digit" });
};
const formatLastSeen = (value) => {
  if (!value) return "آفلاین";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "آفلاین";
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const time = date.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });

  if (diffMs < minuteMs) return "آخرین بازدید همین الان";
  if (diffMs < hourMs) return `آخرین بازدید ${Math.floor(diffMs / minuteMs)} دقیقه پیش`;
  if (startOfDate === startOfToday) return `آخرین بازدید امروز، ${time}`;
  if (startOfDate === startOfToday - 24 * hourMs) return `آخرین بازدید دیروز، ${time}`;
  return `آخرین بازدید ${date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })} ${time}`;
};
const getUserPresenceLabel = (presence) => {
  if (!presence) return "آفلاین";
  if (presence.isOnline) return "آنلاین";
  return formatLastSeen(presence.lastSeenAt);
};
const formatBytes = (value) => {
  const bytes = Number(value || 0);
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const normalizeConversation = (item = {}) => ({
  ...item,
  id: getId(item),
  schoolId: item.schoolId ?? item.school_id ?? null,
  displayTitle: item.displayTitle ?? item.display_title ?? "",
  displaySubtitle: item.displaySubtitle ?? item.display_subtitle ?? null,
  avatarInitials: item.avatarInitials ?? item.avatar_initials ?? null,
  isReadOnly: item.isReadOnly ?? item.is_read_only ?? false,
  unreadCount: Number(item.unreadCount ?? item.unread_count ?? 0),
  lastMessageAt: item.lastMessageAt ?? item.last_message_at ?? null,
  lastMessage: item.lastMessage ?? item.last_message ?? item.latestMessage ?? item.latest_message ?? null,
  members: toArray(
    item.members ||
    item.conversationMembers ||
    item.conversation_members ||
    item.memberUserIds ||
    item.member_user_ids ||
    item.memberIds ||
    item.member_ids ||
    item.userIds ||
    item.user_ids
  ),
});

const normalizeMessage = (item = {}) => ({
  ...item,
  id: getId(item),
  conversationId: item.conversationId ?? item.conversation_id ?? null,
  schoolId: item.schoolId ?? item.school_id ?? null,
  senderUserId:
    item.senderUserId ??
    item.sender_user_id ??
    item.sender?.id ??
    item.user?.id ??
    item.userId ??
    item.user_id ??
    item.createdByUserId ??
    item.created_by_user_id ??
    item.createdBy?.id ??
    item.created_by?.id ??
    item.authorId ??
    item.author_id ??
    null,
  sender: item.sender || item.user || null,
  type: item.type || "text",
  status: item.status || (item.deletedAt || item.deleted_at ? "deleted" : item.editedAt || item.edited_at ? "edited" : "active"),
  body: item.body ?? item.text ?? "",
  attachments: toArray(item.attachments),
  reactions: toArray(item.reactions),
  deletedAt: item.deletedAt ?? item.deleted_at ?? null,
  editedAt: item.editedAt ?? item.edited_at ?? null,
  createdAt: item.createdAt ?? item.created_at ?? item.sentAt ?? null,
});

const getUserName = (user = {}) =>
  user.user?.full_name ||
  user.user?.fullName ||
  user.user?.name ||
  user.full_name ||
  user.fullName ||
  user.name ||
  user.user?.username ||
  user.username ||
  user.user?.mobile ||
  user.mobile ||
  user.user?.phone ||
  user.phone ||
  `کاربر ${getChatUserId(user) || getId(user)}`;

const getChatUserId = (item = {}) =>
  item.user_id ?? item.userId ?? item.user?.id ?? item.id ?? null;

const getUserAvatarText = (name = "") => {
  const clean = String(name || "").trim();
  if (!clean) return "؟";
  return clean.slice(0, 2).toUpperCase();
};

const getUserRoleLabels = (item = {}) => {
  const labels = [];
  const roles = Array.isArray(item.user?.roles) ? item.user.roles : Array.isArray(item.roles) ? item.roles : [];
  roles.forEach((role) => {
    const label = role?.label || role?.name;
    if (label) labels.push(label);
  });

  if (item.__source === "adviser" || item.user_id || item.userId) {
    const isSuper = item.is_super === true || item.is_super === 1 || item.is_super === "1" || item.isSuper;
    labels.push(isSuper ? "سر مشاور" : "مشاور");
  }

  return Array.from(new Set(labels.filter(Boolean)));
};

const normalizeChatUserOption = (item = {}, source = "user") => {
  const chatUserId = getChatUserId(item);
  if (!chatUserId) return null;
  return {
    ...item,
    __source: source,
    __chatUserId: chatUserId,
    __displayName: getUserName(item),
    __roleLabels: getUserRoleLabels({ ...item, __source: source }),
  };
};

const normalizeChatUserCandidate = (item = {}) => ({
  ...item,
  __source: "chat",
  __chatUserId: item.id,
  __displayName: item.name || item.username || item.phone || `کاربر ${item.id}`,
  __roleLabels: [item.roleLabel || item.role].filter(Boolean),
});

const mergeChatUserOptions = (groups = []) => {
  const byUserId = new Map();
  groups.flat().forEach((item) => {
    const normalized = normalizeChatUserOption(item, item?.__source || "user");
    if (!normalized) return;
    const key = String(normalized.__chatUserId);
    const prev = byUserId.get(key);
    if (!prev) {
      byUserId.set(key, normalized);
      return;
    }
    byUserId.set(key, {
      ...prev,
      ...normalized,
      __roleLabels: Array.from(new Set([...(prev.__roleLabels || []), ...(normalized.__roleLabels || [])])),
      __displayName: normalized.__displayName || prev.__displayName,
    });
  });
  return Array.from(byUserId.values());
};

const getMessageSenderName = (message = {}) =>
  message.sender?.name ||
  message.sender?.fullName ||
  message.sender?.full_name ||
  message.sender?.username ||
  message.sender?.phone ||
  message.sender?.mobile ||
  message.user?.name ||
  message.user?.full_name ||
  message.user?.fullName ||
  message.user?.username ||
  message.user?.phone ||
  message.createdBy?.name ||
  message.createdBy?.fullName ||
  message.created_by?.name ||
  message.author?.name ||
  "کاربر";

const getConversationMembers = (conversation = {}) =>
  toArray(
    conversation.members ||
    conversation.conversationMembers ||
    conversation.conversation_members ||
    conversation.memberUserIds ||
    conversation.member_user_ids ||
    conversation.memberIds ||
    conversation.member_ids ||
    conversation.userIds ||
    conversation.user_ids ||
    conversation.participants ||
    conversation.users
  );

const getMemberUserId = (member = {}) =>
  typeof member === "number" || typeof member === "string"
    ? member
    : member.user_id ?? member.userId ?? member.user?.id ?? member.id ?? null;

const getMemberDisplayName = (member = {}) =>
  member.user?.full_name ||
  member.user?.fullName ||
  member.user?.name ||
  member.full_name ||
  member.fullName ||
  member.name ||
  member.user?.username ||
  member.username ||
  member.user?.mobile ||
  member.mobile ||
  member.user?.phone ||
  member.phone ||
  "";

const getMemberInitials = (member = {}) =>
  member.user?.initials ||
  member.initials ||
  getUserAvatarText(getMemberDisplayName(member));

const getMemberRole = (member = {}) => member.role || member.memberRole || member.member_role || "member";

const normalizeConversationMember = (member = {}) => {
  if (typeof member === "number" || typeof member === "string") {
    return { userId: Number(member), role: "member", user: null };
  }
  return {
    ...member,
    id: getId(member),
    userId: getMemberUserId(member),
    role: getMemberRole(member),
    user: member.user || null,
    joinedAt: member.joinedAt || member.joined_at || null,
    leftAt: member.leftAt || member.left_at || null,
  };
};

const sortConversationMembers = (members = []) =>
  [...members].sort((a, b) => {
    const roleSort = (MEMBER_ROLE_ORDER[getMemberRole(a)] || 99) - (MEMBER_ROLE_ORDER[getMemberRole(b)] || 99);
    if (roleSort) return roleSort;
    return getMemberDisplayName(a).localeCompare(getMemberDisplayName(b), "fa");
  });

const getBlockUserId = (item = {}) =>
  item.blockedUserId ?? item.blocked_user_id ?? item.blockedUser?.id ?? item.userId ?? item.user_id ?? item.user?.id ?? item.id ?? null;

const getBlockDisplayName = (item = {}) =>
  item.blockedUser?.full_name ||
  item.blockedUser?.fullName ||
  item.blockedUser?.name ||
  item.user?.full_name ||
  item.user?.fullName ||
  item.user?.name ||
  item.full_name ||
  item.fullName ||
  item.name ||
  item.blockedUser?.phone ||
  item.user?.phone ||
  item.phone ||
  "";

const getConversationOtherMember = (conversation = {}, currentUserId) =>
  getConversationMembers(conversation).find((member) => {
    const id = getMemberUserId(member);
    return id && String(id) !== String(currentUserId);
  });

const isAdminConversationRole = (role) => role === "owner" || role === "admin";

const canDeleteConversationMessage = ({ conversation = {}, message = {}, currentUserId, currentRole, hasPermission }) => {
  if (!hasPermission || !message?.id) return false;
  if (String(message.senderUserId) === String(currentUserId)) return true;
  if (conversation.type === "direct") return false;
  return ["group", "channel"].includes(conversation.type) && isAdminConversationRole(currentRole);
};

const getMessagePreview = (message = {}) => {
  if (!message) return "";
  if (message.status === "deleted" || message.deletedAt) return "این پیام حذف شده است";
  if (message.body) return message.body;
  if (toArray(message.attachments).length) return "فایل پیوست";
  if (message.type === "system") return "پیام سیستمی";
  return "";
};

const normalizeUploadedAttachment = (uploaded = {}, file = {}) => ({
  fileId: uploaded.fileId || uploaded.file_id || uploaded.id || undefined,
  name: uploaded.name || file.name || "file",
  mimeType: uploaded.mimeType || uploaded.mime_type || file.type || "application/octet-stream",
  sizeBytes: uploaded.sizeBytes || uploaded.size_bytes || file.size || 0,
  url: uploaded.downloadUrl || uploaded.download_url || uploaded.url || uploaded.arvan_url || "",
});

const resolveAttachmentUrl = (url = "") => {
  const value = String(url || "").trim();
  if (!value) return "";
  if (value.startsWith("blob:") || value.startsWith("data:")) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${API_BASE_URL.replace(/\/$/, "")}${value}`;
  return value;
};

const getRawAttachmentUrlCandidates = (attachment = {}) =>
  Array.from(
    new Set(
      [
        attachment.url,
        attachment.downloadUrl,
        attachment.download_url,
        attachment.fileUrl,
        attachment.file_url,
        attachment.arvanUrl,
        attachment.arvan_url,
      ].filter(Boolean)
    )
  );

const getAttachmentUrlCandidates = (attachment = {}) =>
  getRawAttachmentUrlCandidates(attachment).map(resolveAttachmentUrl).filter(Boolean);

const getAttachmentMimeType = (attachment = {}) =>
  attachment.mimeType ||
  attachment.mime_type ||
  attachment.contentType ||
  attachment.content_type ||
  (String(attachment.type || "").includes("/") ? attachment.type : "") ||
  "";

const inferAudioMimeType = ({ mime = "", name = "", url = "" } = {}) => {
  const cleanMime = String(mime || "").split(";")[0];
  if (cleanMime.startsWith("audio/")) return cleanMime;
  const source = `${name} ${url}`.toLowerCase();
  if (source.includes(".ogg") || source.includes(".oga")) return "audio/ogg";
  if (source.includes(".mp3") || source.includes(".mpeg")) return "audio/mpeg";
  if (source.includes(".m4a") || source.includes(".mp4") || source.includes(".aac")) return "audio/mp4";
  if (source.includes(".wav")) return "audio/wav";
  return "audio/webm";
};

const sanitizeOutgoingAttachment = (attachment = {}) => ({
  fileId: attachment.fileId || attachment.file_id || undefined,
  name: attachment.name || attachment.title || "file",
  mimeType: getAttachmentMimeType(attachment) || "application/octet-stream",
  sizeBytes: Number(attachment.sizeBytes ?? attachment.size_bytes ?? attachment.size ?? 0),
  url: getRawAttachmentUrlCandidates(attachment)[0] || "",
});

const isStickerMessage = (message = {}) => {
  const body = String(message.body || "").trim();
  return !!body && SINGLE_EMOJI_RE.test(body) && !toArray(message.attachments).length;
};

const getDirectConversationMemberId = (conversation = {}, currentUserId) => {
  if (conversation.type !== "direct") return null;
  return getMemberUserId(getConversationOtherMember(conversation, currentUserId));
};

const pickSupportedAudioMimeType = () => {
  if (typeof MediaRecorder === "undefined") return "";
  return PREFERRED_AUDIO_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) || "";
};

const normalizeAudioMimeType = (mime = "") => {
  const baseMime = String(mime || "").split(";")[0];
  return VOICE_ALLOWED_MIME_TYPES.includes(baseMime) ? baseMime : "audio/webm";
};

const formatDuration = (seconds = 0) => {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
};

const VoiceMessagePlayer = ({ attachment = {}, onDownload }) => {
  const containerRef = useRef(null);
  const waveSurferRef = useRef(null);
  const audioRef = useRef(null);
  const objectUrlRef = useRef("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [waveformReady, setWaveformReady] = useState(true);

  const sourceUrls = getAttachmentUrlCandidates(attachment);
  const sourceKey = sourceUrls.join("|");
  const sourceUrl = sourceUrls[0] || "";
  const name = attachment.name || attachment.title || "voice-message";
  const mimeType = getAttachmentMimeType(attachment);

  useEffect(() => {
    let cancelled = false;

    const cleanupObjectUrl = () => {
      if (objectUrlRef.current && objectUrlRef.current !== sourceUrl) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      objectUrlRef.current = "";
    };

    const destroyWave = () => {
      waveSurferRef.current?.destroy();
      waveSurferRef.current = null;
    };

    const destroyAudio = () => {
      if (!audioRef.current) return;
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load?.();
      audioRef.current = null;
    };

    const loadVoice = async () => {
      destroyWave();
      destroyAudio();
      cleanupObjectUrl();
      setLoading(true);
      setError("");
      setPlaying(false);
      setDuration(0);
      setCurrentTime(0);
      setWaveformReady(true);

      if (!sourceUrls.length || !containerRef.current) {
        setLoading(false);
        setError("فایل وویس در دسترس نیست.");
        return;
      }

      try {
        let playableUrl = "";
        let directPlayableUrl = "";
        const token = getAccessToken();
        for (const candidateUrl of sourceUrls) {
          if (!directPlayableUrl) directPlayableUrl = candidateUrl;
          try {
            if (candidateUrl.startsWith("blob:") || candidateUrl.startsWith("data:")) {
              playableUrl = candidateUrl;
              break;
            }
            const res = await fetch(candidateUrl, {
              headers: {
                Accept: "audio/*,*/*",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            });
            if (!res.ok) throw new Error("voice fetch failed");
            const responseMime = res.headers.get("Content-Type") || "";
            if (responseMime.includes("application/json") || responseMime.includes("text/html")) throw new Error("voice response is not audio");
            const blob = await res.blob();
            const playableBlobType = inferAudioMimeType({
              mime: mimeType || responseMime || blob.type,
              name,
              url: candidateUrl,
            });
            const playableBlob =
              playableBlobType && blob.type !== playableBlobType
                ? new Blob([blob], { type: playableBlobType })
                : blob;
            playableUrl = URL.createObjectURL(playableBlob);
            objectUrlRef.current = playableUrl;
            break;
          } catch {
            playableUrl = "";
          }
        }
        if (!playableUrl && directPlayableUrl) playableUrl = directPlayableUrl;
        if (!playableUrl) throw new Error("voice source unavailable");

        if (cancelled || !containerRef.current) {
          if (playableUrl.startsWith("blob:") && playableUrl !== sourceUrl) URL.revokeObjectURL(playableUrl);
          return;
        }

        const audio = new Audio(playableUrl);
        audio.preload = "metadata";
        audioRef.current = audio;
        audio.addEventListener("loadedmetadata", () => {
          setDuration(audio.duration || 0);
          setLoading(false);
        });
        audio.addEventListener("canplay", () => setLoading(false));
        audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime || 0));
        audio.addEventListener("play", () => setPlaying(true));
        audio.addEventListener("pause", () => setPlaying(false));
        audio.addEventListener("ended", () => {
          setPlaying(false);
          setCurrentTime(0);
          audio.currentTime = 0;
        });
        audio.addEventListener("error", () => {
          setLoading(false);
          setWaveformReady(false);
          setError("");
        });
        audio.load();

        try {
          const wave = WaveSurfer.create({
            container: containerRef.current,
            media: audio,
            height: 34,
            barWidth: 3,
            barGap: 2,
            barRadius: 3,
            cursorWidth: 0,
            dragToSeek: true,
            normalize: true,
            waveColor: "#9aa7bd",
            progressColor: "#4f6bed",
          });
          waveSurferRef.current = wave;
          wave.on("ready", () => {
            setDuration(wave.getDuration() || audio.duration || 0);
            setLoading(false);
          });
          wave.on("error", () => {
            setWaveformReady(false);
            setLoading(false);
          });
        } catch {
          setWaveformReady(false);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setLoading(false);
          setError("فایل وویس دریافت نشد.");
        }
      }
    };

    loadVoice();

    return () => {
      cancelled = true;
      destroyWave();
      destroyAudio();
      cleanupObjectUrl();
    };
  }, [sourceKey, mimeType, name, sourceUrl]);

  const togglePlay = () => {
    if (loading || error) return;
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {
        setWaveformReady(false);
        setError("این فایل صوتی قابل پخش نیست.");
      });
    } else {
      audio.pause();
    }
  };

  const progress = duration ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div className="school-chat-voice-message">
      <Button
        color="primary"
        type="button"
        className="school-chat-voice-play"
        disabled={loading || !!error}
        onClick={togglePlay}
      >
        {loading ? <Spinner size="sm" /> : <i className={playing ? "bx bx-pause" : "bx bx-play"} />}
      </Button>
      <div className="school-chat-voice-body">
        <div className={`school-chat-voice-wave ${waveformReady ? "" : "is-fallback"}`}>
          <div ref={containerRef} className={waveformReady ? "" : "d-none"} />
          {!waveformReady && (
            <button
              type="button"
              className="school-chat-voice-fallback-wave"
              style={{ "--voice-progress": `${progress}%` }}
              onClick={togglePlay}
            >
              {Array.from({ length: 28 }).map((_, index) => (
                <span key={`voice-bar-${index}`} />
              ))}
            </button>
          )}
        </div>
        <div className="school-chat-voice-meta">
          <span>{error || name}</span>
          <small>{formatDuration(currentTime || duration)}</small>
        </div>
      </div>
      {onDownload && (
        <Button color="link" type="button" className="school-chat-voice-download" onClick={onDownload}>
          <i className="bx bx-download" />
        </Button>
      )}
    </div>
  );
};

const getLastMessagePreview = (conversation = {}) => {
  const message =
    conversation.lastMessage ||
    conversation.last_message ||
    conversation.latestMessage ||
    conversation.latest_message ||
    null;
  const preview = getMessagePreview(normalizeMessage(message || {}));
  if (preview) return preview;
  const body = conversation.lastMessageBody || conversation.last_message_body;
  if (body) return body;
  const attachments = toArray(message?.attachments || conversation.lastMessageAttachments);
  if (attachments.length) return "فایل پیوست";
  return "";
};

const isGenericDirectTitle = (conversation = {}) => {
  const title = String(conversation.title || "").trim();
  if (!title) return true;
  if (conversation.type !== "direct") return false;
  return ["گفتگوی مستقیم", "مستقیم", "direct", "Direct"].includes(title);
};

const shouldGroupWithPreviousMessage = (previous = {}, message = {}) => {
  if (!previous?.id || !message?.id) return false;
  if (!previous.senderUserId || !message.senderUserId) return false;
  if (String(previous.senderUserId) !== String(message.senderUserId)) return false;
  const previousTime = new Date(previous.createdAt || 0).getTime();
  const currentTime = new Date(message.createdAt || 0).getTime();
  if (!previousTime || !currentTime) return false;
  return currentTime - previousTime < 5 * 60 * 1000;
};

const collectUserSummaries = ({ conversations = [], messages = [] } = {}) => {
  const next = {};
  conversations.forEach((conversation) => {
    getConversationMembers(conversation).forEach((member) => {
      const id = getMemberUserId(member);
      const name = getMemberDisplayName(member);
      if (id && name) next[String(id)] = name;
    });
  });
  messages.forEach((message) => {
    const id = message.sender?.id || message.senderUserId;
    const name = getMessageSenderName(message);
    if (id && name && name !== "کاربر") next[String(id)] = name;
  });
  return next;
};

const Chat = () => {
  document.title = "چت آنلاین | داشبورد آیسوق";

  const auth = useAuth();
  const currentUserId = auth?.user?.id ?? auth?.user?.userId ?? null;
  const canManageChat = auth?.hasAnyPermission?.([
    "chat.manage",
    "chat.settings",
    "chat.admin",
    "chat.blocks",
  ]);
  const canAdminBlocks = canManageChat || auth?.hasAnyPermission?.(["chat.admin.blocks"]);
  const canIndexMembers = canManageChat || auth?.hasAnyPermission?.(["chat.members.index"]);
  const canAddMembers = canManageChat || auth?.hasAnyPermission?.(["chat.members.create"]);
  const canUpdateMembers = canManageChat || auth?.hasAnyPermission?.(["chat.members.update"]);
  const canDeleteMembers = canManageChat || auth?.hasAnyPermission?.(["chat.members.delete"]);
  const canUpdateConversation = canManageChat || auth?.hasAnyPermission?.(["chat.conversations.update"]);
  const canCreateConversation = canManageChat || auth?.hasAnyPermission?.(["chat.conversations.create"]);
  const canIndexChatMessages = canManageChat || auth?.hasAnyPermission?.(["chat.messages.index"]);
  const canCreateChatMessages = canManageChat || auth?.hasAnyPermission?.(["chat.messages.create"]);
  const canDeleteChatMessages = canManageChat || auth?.hasAnyPermission?.(["chat.messages.delete"]);
  const canDeleteConversation = auth?.hasAnyPermission?.(["chat.conversations.delete"]);
  const canManagePersonalBlocks = auth?.hasAnyPermission?.(["chat.personal-blocks.manage"]);

  const socketRef = useRef(null);
  const messageListRef = useRef(null);
  const composerInputRef = useRef(null);
  const stickerPickerRef = useRef(null);
  const stickerButtonRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const voiceStreamRef = useRef(null);
  const voiceTimerRef = useRef(null);
  const voiceStartedAtRef = useRef(0);
  const voiceCancelRef = useRef(false);
  const isNearMessageBottomRef = useRef(true);
  const previousActiveConversationRef = useRef(null);
  const typingTimerRef = useRef(null);
  const typingSentRef = useRef(false);
  const localConversationTitlesRef = useRef({});
  const confirmResolverRef = useRef(null);

  const [schools, setSchools] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [activeSchoolId, setActiveSchoolId] = useState("");

  const [conversationSearch, setConversationSearch] = useState("");
  const [debouncedConversationSearch, setDebouncedConversationSearch] = useState("");
  const [messageSearch, setMessageSearch] = useState("");
  const [debouncedMessageSearch, setDebouncedMessageSearch] = useState("");

  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [conversationTitleOverrides, setConversationTitleOverrides] = useState({});
  const [userNamesById, setUserNamesById] = useState({});
  const [membersByConversationId, setMembersByConversationId] = useState({});
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [submittedMemberSearch, setSubmittedMemberSearch] = useState("");
  const [memberSearchResults, setMemberSearchResults] = useState([]);
  const [memberSearchLoading, setMemberSearchLoading] = useState(false);
  const [memberActionLoading, setMemberActionLoading] = useState("");
  const [blockedUsersBySchoolId, setBlockedUsersBySchoolId] = useState({});
  const [blocksLoading, setBlocksLoading] = useState(false);
  const [personalBlocksByConversationId, setPersonalBlocksByConversationId] = useState({});
  const [personalBlocksLoadingByConversationId, setPersonalBlocksLoadingByConversationId] = useState({});
  const [personalBlockStatusByConversationId, setPersonalBlockStatusByConversationId] = useState({});

  const [messagesByConversationId, setMessagesByConversationId] = useState({});
  const [messagesMetaByConversationId, setMessagesMetaByConversationId] = useState({});
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [settingsDraft, setSettingsDraft] = useState(DEFAULT_SETTINGS);
  const [statistics, setStatistics] = useState(null);
  const [adminVisible, setAdminVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const [connection, setConnection] = useState("disconnected");
  const [typingByConversationId, setTypingByConversationId] = useState({});
  const [presenceByUserId, setPresenceByUserId] = useState({});
  const [loadingPresenceByConversationId, setLoadingPresenceByConversationId] = useState({});
  const [mobilePane, setMobilePane] = useState("list");
  const [composerBody, setComposerBody] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [forbiddenMessage, setForbiddenMessage] = useState("");
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [stickerPickerOpen, setStickerPickerOpen] = useState(false);
  const [stickerPickerPosition, setStickerPickerPosition] = useState({ top: 0, left: 0, width: 320 });
  const [reactionState, setReactionState] = useState({});
  const [lightboxAttachment, setLightboxAttachment] = useState(null);
  const [chatUserCandidates, setChatUserCandidates] = useState([]);
  const [chatUserCandidatesLoading, setChatUserCandidatesLoading] = useState(false);
  const [openingDirectUserId, setOpeningDirectUserId] = useState(null);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [voiceDraft, setVoiceDraft] = useState(null);
  const [voiceUploadProgress, setVoiceUploadProgress] = useState(0);
  const [voiceSending, setVoiceSending] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [submittedUserSearch, setSubmittedUserSearch] = useState("");
  const [userOptions, setUserOptions] = useState([]);
  const [newConversation, setNewConversation] = useState({
    type: "group",
    title: "",
    description: "",
    memberUserIds: [],
  });

  const [editingMessage, setEditingMessage] = useState(null);
  const [editBody, setEditBody] = useState("");
  const [blockForm, setBlockForm] = useState({ blockedUserId: "", reason: "", blockedUntil: "" });
  const [unblockUserId, setUnblockUserId] = useState("");
  const [blockModal, setBlockModal] = useState({ open: false, userId: "", name: "", reason: "", duration: "forever" });
  const [personalBlockModal, setPersonalBlockModal] = useState({ open: false, reason: "", duration: "forever" });
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "تایید",
    cancelText: "انصراف",
    color: "primary",
  });

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeConversationId) || null,
    [activeConversationId, conversations]
  );
  const activeConversationMembers = useMemo(() => {
    const source = membersByConversationId[activeConversationId] || getConversationMembers(activeConversation || {});
    return sortConversationMembers(source.map(normalizeConversationMember).filter((member) => member.userId));
  }, [activeConversation, activeConversationId, membersByConversationId]);
  const activeConversationWithMembers = useMemo(
    () => (activeConversation ? { ...activeConversation, members: activeConversationMembers } : null),
    [activeConversation, activeConversationMembers]
  );
  const activeConversationType = activeConversation?.type || "";
  const isManageableConversation = activeConversationType === "group" || activeConversationType === "channel";
  const canOpenDetailsPanel = isManageableConversation || adminVisible || canManageChat || canAdminBlocks;
  const canShowDetailsPanel = !!activeConversation && detailsVisible && canOpenDetailsPanel;
  const currentConversationMember = useMemo(
    () => activeConversationMembers.find((member) => String(member.userId) === String(currentUserId)) || null,
    [activeConversationMembers, currentUserId]
  );
  const currentConversationRole = getMemberRole(currentConversationMember || {});
  const canManageActiveConversation = isAdminConversationRole(currentConversationRole);
  const composerPermissionDisabled = !canCreateChatMessages;
  const composerChannelMemberDisabled = activeConversationType === "channel" && !canManageActiveConversation;
  const composerReadOnlyDisabled = !!activeConversation?.isReadOnly && !canManageActiveConversation;
  const blockedUsers = blockedUsersBySchoolId[activeSchoolId] || [];
  const activeMemberIds = useMemo(
    () => new Set(activeConversationMembers.map((member) => String(member.userId))),
    [activeConversationMembers]
  );
  const activeMessages = useMemo(
    () => messagesByConversationId[activeConversationId] || [],
    [activeConversationId, messagesByConversationId]
  );
  const activeMessagesMeta = messagesMetaByConversationId[activeConversationId] || {
    page: 1,
    limit: 20,
    total: 0,
    lastPage: 1,
  };
  const userOptionById = useMemo(() => {
    const map = {};
    userOptions.forEach((item) => {
      if (item.__chatUserId) map[String(item.__chatUserId)] = item;
    });
    return map;
  }, [userOptions]);
  const activeDirectMember = useMemo(() => {
    if (!activeConversation || activeConversation.type !== "direct") return null;
    return getConversationOtherMember(activeConversationWithMembers || activeConversation, currentUserId) || null;
  }, [activeConversation, activeConversationWithMembers, currentUserId]);
  const activeDirectBlockStatus = personalBlockStatusByConversationId[activeConversationId] || null;
  const activeDirectMemberUserId = getMemberUserId(activeDirectMember || {});
  const activeDirectPeerUserId = activeDirectBlockStatus?.peerUserId || activeDirectMemberUserId;
  const activeDirectPeerPresence = activeDirectPeerUserId ? presenceByUserId[String(activeDirectPeerUserId)] : null;
  const activePersonalBlocks = personalBlocksByConversationId[activeConversationId] || [];
  const isActiveDirectPeerBlockedByMe = !!activeDirectPeerUserId && activePersonalBlocks.some(
    (block) => String(getBlockUserId(block)) === String(activeDirectPeerUserId)
  );
  const isActiveDirectBlockedByMe = activeConversation?.type === "direct" && !!activeDirectBlockStatus?.blockedByMe;
  const isActiveDirectBlockedMe = activeConversation?.type === "direct" && !!activeDirectBlockStatus?.blockedMe;
  const isActiveDirectBlocked = activeConversation?.type === "direct" && !!activeDirectBlockStatus?.isBlocked;
  const composerPersonalBlockDisabled =
    activeConversation?.type === "direct" && (isActiveDirectBlockedByMe || isActiveDirectPeerBlockedByMe);
  const composerDirectBlockedDisabled =
    activeConversation?.type === "direct" && isActiveDirectBlocked && !composerPersonalBlockDisabled;
  const composerDisabled =
    !settings.isEnabled ||
    composerPermissionDisabled ||
    composerChannelMemberDisabled ||
    composerReadOnlyDisabled ||
    composerPersonalBlockDisabled ||
    composerDirectBlockedDisabled;
  const composerDisabledMessage = !settings.isEnabled
    ? "چت این مجموعه غیرفعال است."
    : composerPermissionDisabled
      ? "شما مجوز ارسال پیام در چت را ندارید."
      : composerChannelMemberDisabled
        ? "فقط ادمین‌های کانال می‌توانند پیام ارسال کنند."
        : composerPersonalBlockDisabled
          ? "این کاربر را بلاک کرده‌اید. برای ارسال پیام ابتدا آنبلاک کنید."
          : composerDirectBlockedDisabled
            ? isActiveDirectBlockedMe
              ? "امکان ارسال پیام وجود ندارد، چون طرف مقابل شما را بلاک کرده است."
              : "امکان ارسال پیام در این گفتگوی مستقیم وجود ندارد."
            : composerReadOnlyDisabled
              ? "فقط ادمین‌ها می‌توانند در این گفتگو پیام ارسال کنند."
              : "";

  const syncConversationMembers = useCallback((conversationId, members = []) => {
    const normalizedMembers = members.map(normalizeConversationMember).filter((member) => member.userId);
    setMembersByConversationId((prev) => ({ ...prev, [conversationId]: normalizedMembers }));
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, members: normalizedMembers } : conversation
      )
    );
    const nextUsers = collectUserSummaries({ conversations: [{ members: normalizedMembers }] });
    if (Object.keys(nextUsers).length) {
      setUserNamesById((prev) => ({ ...prev, ...nextUsers }));
    }
  }, []);

  const fetchConversationMembers = useCallback(
    async (conversationId = activeConversationId) => {
      if (!conversationId || !canIndexMembers) return;
      setMembersLoading(true);
      try {
        const items = await getChatConversationMembers(conversationId, { silent: true });
        syncConversationMembers(conversationId, items || []);
      } catch (e) {
        if (e?.response?.status !== 403) {
          setMembersByConversationId((prev) => ({ ...prev }));
        }
      } finally {
        setMembersLoading(false);
      }
    },
    [activeConversationId, canIndexMembers, syncConversationMembers]
  );

  const fetchBlockedUsers = useCallback(async () => {
    if (!activeSchoolId || !canAdminBlocks) return;
    setBlocksLoading(true);
    try {
      const items = await getChatSchoolBlocks(activeSchoolId, { silent: true });
      setBlockedUsersBySchoolId((prev) => ({ ...prev, [activeSchoolId]: items || [] }));
    } catch {
      setBlockedUsersBySchoolId((prev) => ({ ...prev, [activeSchoolId]: [] }));
    } finally {
      setBlocksLoading(false);
    }
  }, [activeSchoolId, canAdminBlocks]);

  const fetchPersonalBlocks = useCallback(
    async (conversationId = activeConversationId) => {
      if (!conversationId || !canManagePersonalBlocks) return;
      setPersonalBlocksLoadingByConversationId((prev) => ({ ...prev, [conversationId]: true }));
      try {
        const items = await getChatConversationBlocks(conversationId, { silent: true });
        setPersonalBlocksByConversationId((prev) => ({ ...prev, [conversationId]: items || [] }));
      } catch (e) {
        if (e?.response?.status === 403) {
          setPersonalBlocksByConversationId((prev) => ({ ...prev, [conversationId]: [] }));
        }
      } finally {
        setPersonalBlocksLoadingByConversationId((prev) => ({ ...prev, [conversationId]: false }));
      }
    },
    [activeConversationId, canManagePersonalBlocks]
  );

  const fetchPersonalBlockStatus = useCallback(
    async (conversationId = activeConversationId) => {
      if (!conversationId) return null;
      setPersonalBlocksLoadingByConversationId((prev) => ({ ...prev, [conversationId]: true }));
      try {
        const status = await getChatConversationBlockStatus(conversationId, { silent: true });
        const normalizedStatus = {
          conversationId: status?.conversationId ?? conversationId,
          isBlocked: !!status?.isBlocked,
          blockedByMe: !!status?.blockedByMe,
          blockedMe: !!status?.blockedMe,
          peerUserId: status?.peerUserId ?? null,
          blockedUntil: status?.blockedUntil || null,
        };
        setPersonalBlockStatusByConversationId((prev) => ({ ...prev, [conversationId]: normalizedStatus }));
        return normalizedStatus;
      } catch (e) {
        if (e?.response?.status === 403) {
          setPersonalBlockStatusByConversationId((prev) => {
            const next = { ...prev };
            delete next[conversationId];
            return next;
          });
        }
        return null;
      } finally {
        setPersonalBlocksLoadingByConversationId((prev) => ({ ...prev, [conversationId]: false }));
      }
    },
    [activeConversationId]
  );

  const fetchConversationPresence = useCallback(
    async (conversationId = activeConversationId) => {
      if (!conversationId || !canIndexChatMessages) return;
      setLoadingPresenceByConversationId((prev) => ({ ...prev, [conversationId]: true }));
      try {
        const items = await getChatConversationPresence(conversationId, { silent: true });
        setPresenceByUserId((prev) => {
          const next = { ...prev };
          (items || []).forEach((item) => {
            const userId = item.userId ?? item.user_id;
            if (!userId) return;
            next[String(userId)] = {
              userId,
              isOnline: !!(item.isOnline ?? item.is_online),
              lastSeenAt: item.lastSeenAt ?? item.last_seen_at ?? null,
            };
          });
          return next;
        });
      } catch {
        setPresenceByUserId((prev) => ({ ...prev }));
      } finally {
        setLoadingPresenceByConversationId((prev) => ({ ...prev, [conversationId]: false }));
      }
    },
    [activeConversationId, canIndexChatMessages]
  );

  const closeConfirmModal = (confirmed = false) => {
    confirmResolverRef.current?.(confirmed);
    confirmResolverRef.current = null;
    setConfirmModal((prev) => ({ ...prev, open: false }));
  };

  const requestConfirm = ({
    title = "تایید عملیات",
    message = "",
    confirmText = "تایید",
    cancelText = "انصراف",
    color = "primary",
  } = {}) =>
    new Promise((resolve) => {
      confirmResolverRef.current = resolve;
      setConfirmModal({ open: true, title, message, confirmText, cancelText, color });
    });

  const resolveUserNameById = useCallback(
    (userId) => {
      if (!userId) return "";
      return userOptionById[String(userId)]?.__displayName || userNamesById[String(userId)] || "";
    },
    [userNamesById, userOptionById]
  );

  const resolveConversationTitle = useCallback(
    (conversation = {}) => {
      if (conversation.displayTitle) return conversation.displayTitle;

      const members = getConversationMembers(conversation);
      const otherMembers = members.filter((member) => {
        const id = getMemberUserId(member);
        return id && String(id) !== String(currentUserId);
      });

      if (conversation.type === "direct" && otherMembers[0]) {
        const memberId = getMemberUserId(otherMembers[0]);
        const name = getMemberDisplayName(otherMembers[0]) || resolveUserNameById(memberId);
        if (name) return name;
      }

      if (conversation.type === "group" || conversation.type === "channel") {
        if (conversation.title) return conversation.title;
      }

      const localTitle = conversationTitleOverrides[conversation.id] || localConversationTitlesRef.current[conversation.id];
      if (localTitle && !isGenericDirectTitle({ ...conversation, title: localTitle })) return localTitle;
      if (conversation.title && !isGenericDirectTitle(conversation)) return conversation.title;
      return "گفتگو";
    },
    [conversationTitleOverrides, currentUserId, resolveUserNameById]
  );

  const resolveConversationSubtitle = useCallback((conversation = {}) => {
    if (conversation.displaySubtitle) return conversation.displaySubtitle;
    if (conversation.type === "group" || conversation.type === "channel") {
      const membersCount = getConversationMembers(conversation).length;
      if (membersCount) return `${membersCount} عضو`;
      if (conversation.description) return conversation.description;
      return conversation.type === "channel" ? "کانال" : "گروه";
    }
    const otherMember = getConversationOtherMember(conversation, currentUserId);
    const username = otherMember?.user?.username || otherMember?.username;
    const phone = otherMember?.user?.phone || otherMember?.phone || otherMember?.mobile;
    return username || phone || "گفتگوی مستقیم";
  }, [currentUserId]);

  const resolveConversationAvatarText = useCallback((conversation = {}) => {
    if (conversation.avatarInitials) return conversation.avatarInitials;
    if (conversation.type === "direct") {
      const otherMember = getConversationOtherMember(conversation, currentUserId);
      if (otherMember) {
        return getMemberInitials(otherMember) || getUserAvatarText(resolveConversationTitle(conversation));
      }
    }
    return getUserAvatarText(resolveConversationTitle(conversation));
  }, [currentUserId, resolveConversationTitle]);

  const resolveMessageSenderName = useCallback(
    (message = {}) => {
      if (String(message.senderUserId) === String(currentUserId)) return "شما";
      const explicit = getMessageSenderName(message);
      if (explicit && !explicit.startsWith("کاربر ")) return explicit;
      const fromSearch = userOptionById[String(message.senderUserId)]?.__displayName;
      if (fromSearch) return fromSearch;
      const fromLookup = resolveUserNameById(message.senderUserId);
      if (fromLookup) return fromLookup;
      const member = getConversationMembers(activeConversation).find(
        (item) => String(getMemberUserId(item)) === String(message.senderUserId)
      );
      return getMemberDisplayName(member) || fromLookup || explicit;
    },
    [activeConversation, currentUserId, resolveUserNameById, userOptionById]
  );

  const hydrateOutgoingMessage = useCallback(
    (message = {}) => {
      if (!message?.id) return message;
      const senderUserId = message.senderUserId || currentUserId;
      const currentUserName = getUserName(auth?.user || {});
      return {
        ...message,
        senderUserId,
        sender:
          message.sender ||
          (String(senderUserId) === String(currentUserId)
            ? {
                id: currentUserId,
                name: currentUserName,
                fullName: auth?.user?.fullName || auth?.user?.full_name || currentUserName,
                username: auth?.user?.username,
                phone: auth?.user?.phone || auth?.user?.mobile,
                initials: getUserAvatarText(currentUserName),
              }
            : message.sender),
      };
    },
    [auth?.user, currentUserId]
  );

  const getConversationTypingUserIds = useCallback(
    (conversationId) =>
      Object.entries(typingByConversationId[conversationId] || {})
        .filter(([, item]) => item?.isTyping && item.expiresAt > Date.now())
        .map(([userId]) => userId)
        .filter((userId) => String(userId) !== String(currentUserId)),
    [currentUserId, typingByConversationId]
  );

  const getConversationTypingLabel = useCallback(
    (conversation = {}) => {
      const typingUserIds = getConversationTypingUserIds(conversation.id);
      if (!typingUserIds.length) return "";
      if (conversation.type === "direct") return "در حال تایپ...";
      if (typingUserIds.length > 1) return "چند نفر در حال تایپ هستند...";
      const userId = typingUserIds[0];
      const member = getConversationMembers(conversation).find((item) => String(getMemberUserId(item)) === String(userId));
      const name = getMemberDisplayName(member) || resolveUserNameById(userId) || `کاربر ${userId}`;
      return `${name} در حال تایپ...`;
    },
    [getConversationTypingUserIds, resolveUserNameById]
  );

  const playIncomingMessageSound = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const context = new AudioContext();
      const gain = context.createGain();
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.22);
      gain.connect(context.destination);

      [740, 980].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, context.currentTime + index * 0.08);
        oscillator.connect(gain);
        oscillator.start(context.currentTime + index * 0.08);
        oscillator.stop(context.currentTime + 0.22 + index * 0.02);
      });

      setTimeout(() => context.close?.(), 420);
    } catch {
      // مرورگر ممکن است پخش صدا را قبل از تعامل کاربر محدود کند.
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedConversationSearch(conversationSearch), 300);
    return () => clearTimeout(timer);
  }, [conversationSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedMessageSearch(messageSearch), 350);
    return () => clearTimeout(timer);
  }, [messageSearch]);

  useEffect(() => {
    if (!stickerPickerOpen) return undefined;
    const handleOutsideClick = (event) => {
      if (stickerPickerRef.current?.contains(event.target)) return;
      if (stickerButtonRef.current?.contains(event.target)) return;
      if (event.target?.closest?.(".school-chat-sticker-control")) return;
      setStickerPickerOpen(false);
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, [stickerPickerOpen]);

  const updateStickerPickerPosition = useCallback(() => {
    if (typeof window === "undefined") return;
    const rect = stickerButtonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(320, Math.max(280, window.innerWidth - 24));
    const left = Math.max(12, Math.min(window.innerWidth - width - 12, rect.right - width));
    const top = Math.max(12, rect.top - 334);
    setStickerPickerPosition({ top, left, width });
  }, []);

  useEffect(() => {
    if (!stickerPickerOpen) return undefined;
    updateStickerPickerPosition();
    window.addEventListener("resize", updateStickerPickerPosition);
    window.addEventListener("scroll", updateStickerPickerPosition, true);
    return () => {
      window.removeEventListener("resize", updateStickerPickerPosition);
      window.removeEventListener("scroll", updateStickerPickerPosition, true);
    };
  }, [stickerPickerOpen, updateStickerPickerPosition]);

  useEffect(
    () => () => {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
      voiceStreamRef.current?.getTracks?.().forEach((track) => track.stop());
      if (voiceDraft?.previewUrl) URL.revokeObjectURL(voiceDraft.previewUrl);
    },
    [voiceDraft]
  );

  useEffect(() => {
    setSchoolsLoading(true);
    getSchools({ page: 1, limit: 100, sortBy: "id", sortOrder: "DESC" })
      .then((res) => {
        const items = res.items || [];
        setSchools(items);
        if (!activeSchoolId && items[0]?.id) setActiveSchoolId(String(items[0].id));
      })
      .catch(() => setSchools([]))
      .finally(() => setSchoolsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!activeSchoolId) return;
    setConversationsLoading(true);
    setForbiddenMessage("");
    try {
      const res = await getChatConversations({
        page: 1,
        limit: 20,
        search: debouncedConversationSearch,
      });
      const items = (res.items || [])
        .map(normalizeConversation)
        .filter((item) => !item.schoolId || String(item.schoolId) === String(activeSchoolId));
      setConversations(items);
      setMembersByConversationId((prev) => {
        const next = { ...prev };
        items.forEach((conversation) => {
          const members = getConversationMembers(conversation).map(normalizeConversationMember).filter((member) => member.userId);
          if (members.length) next[conversation.id] = members;
        });
        return next;
      });
      const nextUsers = collectUserSummaries({ conversations: items });
      if (Object.keys(nextUsers).length) {
        setUserNamesById((prev) => ({ ...prev, ...nextUsers }));
      }
      setActiveConversationId((prev) => {
        if (prev && items.some((item) => item.id === prev)) return prev;
        return items[0]?.id ?? null;
      });
    } catch (e) {
      if (e?.response?.status === 403) {
        setForbiddenMessage("شما به چت این مجموعه دسترسی ندارید یا حساب شما در این مجموعه مسدود شده است.");
      }
      setConversations([]);
      setActiveConversationId(null);
    } finally {
      setConversationsLoading(false);
    }
  }, [activeSchoolId, debouncedConversationSearch]);

  useEffect(() => {
    setActiveConversationId(null);
    setMessagesByConversationId({});
    setMessagesMetaByConversationId({});
    setTypingByConversationId({});
    setPresenceByUserId({});
    setMobilePane("list");
    setDetailsVisible(false);
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!activeSchoolId) return;
    setSettings(DEFAULT_SETTINGS);
    setSettingsDraft(DEFAULT_SETTINGS);
    setStatistics(null);
    setAdminVisible(false);
    setDetailsVisible(false);

    getChatSchoolSettings(activeSchoolId, { silent: true })
      .then((data) => {
        const next = {
          ...DEFAULT_SETTINGS,
          ...data,
          allowedMimeTypes: toArray(data?.allowedMimeTypes ?? data?.allowed_mime_types),
        };
        setSettings(next);
        setSettingsDraft(next);
      })
      .catch((e) => {
        if (e?.response?.status !== 403) setSettings(DEFAULT_SETTINGS);
      });

    getChatSchoolStatistics(activeSchoolId, { silent: true })
      .then((data) => {
        setStatistics(data || null);
        setAdminVisible(true);
      })
      .catch(() => setStatistics(null));
  }, [activeSchoolId]);

  const fetchMessages = useCallback(
    async ({ conversationId, page = 1, appendOlder = false } = {}) => {
      if (!conversationId) return;
      if (appendOlder) setLoadingOlder(true);
      else setMessagesLoading(true);
      try {
        const res = await getChatMessages({
          conversationId,
          page,
          limit: 20,
          search: debouncedMessageSearch,
        });
        const items = (res.items || []).map(normalizeMessage).sort((a, b) => {
          const ad = new Date(a.createdAt || 0).getTime();
          const bd = new Date(b.createdAt || 0).getTime();
          return ad - bd;
        });
        const nextUsers = collectUserSummaries({ messages: items });
        if (Object.keys(nextUsers).length) {
          setUserNamesById((prev) => ({ ...prev, ...nextUsers }));
        }

        setMessagesByConversationId((prev) => ({
          ...prev,
          [conversationId]: appendOlder
            ? [...items, ...(prev[conversationId] || [])].filter(
                (item, index, arr) => arr.findIndex((x) => x.id === item.id) === index
              )
            : items,
        }));
        setMessagesMetaByConversationId((prev) => ({ ...prev, [conversationId]: res.pagination }));

        const lastMessageId = items[items.length - 1]?.id;
        if (lastMessageId) {
          markChatConversationRead(conversationId, lastMessageId).catch(() => {});
          socketRef.current?.emit("message.read", {
            conversationId,
            receipt: { messageId: lastMessageId },
          });
        }
      } finally {
        setMessagesLoading(false);
        setLoadingOlder(false);
      }
    },
    [debouncedMessageSearch]
  );

  useEffect(() => {
    if (!activeConversationId) return;
    fetchMessages({ conversationId: activeConversationId, page: 1 });
  }, [activeConversationId, debouncedMessageSearch, fetchMessages]);

  useEffect(() => {
    if (!activeConversationId || !isManageableConversation) return;
    fetchConversationMembers(activeConversationId);
  }, [activeConversationId, fetchConversationMembers, isManageableConversation]);

  useEffect(() => {
    if (!activeConversationId || activeConversation?.type !== "direct") return;
    fetchPersonalBlockStatus(activeConversationId);
    fetchPersonalBlocks(activeConversationId);
  }, [activeConversation?.type, activeConversationId, fetchPersonalBlocks, fetchPersonalBlockStatus]);

  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  useEffect(() => {
    const ids = new Set();

    conversations.forEach((conversation) => {
      getConversationMembers(conversation).forEach((member) => {
        const id = getMemberUserId(member);
        if (id) ids.add(String(id));
      });
    });

    activeMessages.forEach((message) => {
      if (message.senderUserId) ids.add(String(message.senderUserId));
    });

    const optionNames = {};
    Object.keys(userOptionById).forEach((id) => {
      const name = userOptionById[id]?.__displayName;
      if (name) {
        optionNames[id] = name;
      }
    });
    if (Object.keys(optionNames).length) {
      setUserNamesById((prev) => {
        const changed = Object.keys(optionNames).some((id) => prev[id] !== optionNames[id]);
        return changed ? { ...prev, ...optionNames } : prev;
      });
    }

    const missingIds = Array.from(ids).filter((id) => {
      if (String(id) === String(currentUserId)) return false;
      return !userNamesById[id] && !userOptionById[id]?.__displayName;
    });

    if (!missingIds.length) return;
    let cancelled = false;

    Promise.allSettled(missingIds.slice(0, 25).map((id) => getUser(id, { silent: true }))).then((results) => {
      if (cancelled) return;
      const nextNames = {};
      results.forEach((result, index) => {
        if (result.status !== "fulfilled") return;
        const id = missingIds[index];
        const name = getUserName(result.value);
        if (name && !name.startsWith("کاربر ")) nextNames[id] = name;
      });
      if (Object.keys(nextNames).length) {
        setUserNamesById((prev) => ({ ...prev, ...nextNames }));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [activeMessages, conversations, currentUserId, userNamesById, userOptionById]);

  useEffect(() => {
    if (!activeConversation || activeConversation.title || activeConversation.type !== "direct") return;
    const otherMessage = activeMessages.find(
      (message) => String(message.senderUserId) !== String(currentUserId)
    );
    if (!otherMessage) return;
    const senderName = getMessageSenderName(otherMessage);
    if (!senderName || senderName.startsWith("کاربر ")) return;
    localConversationTitlesRef.current[activeConversation.id] = senderName;
    setConversationTitleOverrides((prev) =>
      prev[activeConversation.id] === senderName ? prev : { ...prev, [activeConversation.id]: senderName }
    );
  }, [activeConversation, activeMessages, currentUserId]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token || !activeSchoolId) return undefined;

    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const sock = io(`${API_BASE_URL}/chat`, {
      transports: ["websocket"],
      auth: { token },
    });
    socketRef.current = sock;
    setConnection("connecting");

    sock.on("connect", () => {
      setConnection("connected");
      if (activeConversationId) {
        sock.emit("conversation.join", { conversationId: activeConversationId });
        fetchMessages({ conversationId: activeConversationId, page: 1 });
        fetchConversationPresence(activeConversationId);
        setTypingByConversationId((prev) => ({ ...prev, [activeConversationId]: {} }));
      }
    });

    sock.on("disconnect", () => setConnection("disconnected"));
    sock.on("connect_error", () => setConnection("disconnected"));

    sock.on("message.created", (payload) => {
      const message = normalizeMessage(payload?.message || payload);
      if (!message.conversationId) return;

      const nextUsers = collectUserSummaries({ messages: [message] });
      if (Object.keys(nextUsers).length) {
        setUserNamesById((prev) => ({ ...prev, ...nextUsers }));
      }

      setMessagesByConversationId((prev) => {
        const existing = prev[message.conversationId] || [];
        if (existing.some((item) => item.id === message.id)) return prev;
        return { ...prev, [message.conversationId]: [...existing, message] };
      });

      setConversations((prev) =>
        {
          const exists = prev.some((item) => item.id === message.conversationId);
          if (!exists) {
            fetchConversations();
            return prev;
          }
          return prev.map((item) =>
            item.id === message.conversationId
              ? {
                  ...item,
                  lastMessage: message,
                  lastMessageAt: message.createdAt || item.lastMessageAt,
                  unreadCount:
                    item.id === activeConversationId ? 0 : Number(item.unreadCount || 0) + 1,
                }
              : item
          );
        }
      );

      if (String(message.senderUserId) !== String(currentUserId)) {
        playIncomingMessageSound();
      }

      if (message.conversationId === activeConversationId) {
        markChatConversationRead(message.conversationId, message.id).catch(() => {});
      }
    });

    sock.on("presence.updated", (status = {}) => {
      const userId = status.userId ?? status.user_id;
      if (!userId) return;
      setPresenceByUserId((prev) => ({
        ...prev,
        [String(userId)]: {
          userId,
          isOnline: !!(status.isOnline ?? status.is_online),
          lastSeenAt: status.lastSeenAt ?? status.last_seen_at ?? null,
        },
      }));
    });

    sock.on("typing", ({ conversationId, userId, isTyping }) => {
      if (!conversationId || !userId || String(userId) === String(currentUserId)) return;
      setTypingByConversationId((prev) => ({
        ...prev,
        [conversationId]: {
          ...(prev[conversationId] || {}),
          [userId]: {
            isTyping: !!isTyping,
            expiresAt: isTyping ? Date.now() + 3000 : Date.now(),
          },
        },
      }));
    });

    sock.on("message.read", ({ conversationId }) => {
      if (conversationId === activeConversationId) {
        setConversations((prev) =>
          prev.map((item) => (item.id === conversationId ? { ...item, unreadCount: 0 } : item))
        );
      }
    });

    return () => {
      sock.removeAllListeners();
      sock.disconnect();
      if (socketRef.current === sock) socketRef.current = null;
    };
  }, [
    activeSchoolId,
    activeConversationId,
    currentUserId,
    fetchConversationPresence,
    fetchConversations,
    fetchMessages,
    playIncomingMessageSound,
  ]);

  useEffect(() => {
    if (!activeConversationId) return;
    if (socketRef.current?.connected) {
      socketRef.current.emit("conversation.join", { conversationId: activeConversationId });
    }
    fetchConversationPresence(activeConversationId);
    setTypingByConversationId((prev) => ({ ...prev, [activeConversationId]: {} }));
    setConversations((prev) =>
      prev.map((item) => (item.id === activeConversationId ? { ...item, unreadCount: 0 } : item))
    );
  }, [activeConversationId, fetchConversationPresence]);

  useEffect(() => {
    const el = messageListRef.current;
    if (!el || loadingOlder) return;
    const conversationChanged = previousActiveConversationRef.current !== activeConversationId;
    if (conversationChanged || isNearMessageBottomRef.current) {
      el.scrollTop = el.scrollHeight;
      isNearMessageBottomRef.current = true;
    }
    previousActiveConversationRef.current = activeConversationId;
  }, [activeConversationId, activeMessages.length, loadingOlder]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setTypingByConversationId((prev) => {
        let changed = false;
        const next = {};
        Object.entries(prev).forEach(([conversationId, users]) => {
          const activeUsers = {};
          Object.entries(users || {}).forEach(([userId, item]) => {
            if (item?.isTyping && item.expiresAt > now) activeUsers[userId] = item;
            else changed = true;
          });
          next[conversationId] = activeUsers;
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!createModalOpen) return;
    const timer = setTimeout(() => {
      setSubmittedUserSearch((prev) => (prev === userSearch ? prev : userSearch));
    }, 3000);
    return () => clearTimeout(timer);
  }, [createModalOpen, userSearch]);

  useEffect(() => {
    if (!createModalOpen || !activeSchoolId) return;
    const search = submittedUserSearch.trim();
    getChatSchoolUsers({ schoolId: activeSchoolId, search, limit: 50 })
      .then((items) => setUserOptions(items.map(normalizeChatUserCandidate).filter((item) => item.__chatUserId)))
      .catch(() => setUserOptions([]));
  }, [activeSchoolId, createModalOpen, submittedUserSearch]);

  useEffect(() => {
    if (!activeSchoolId || !debouncedConversationSearch.trim()) {
      setChatUserCandidates([]);
      setChatUserCandidatesLoading(false);
      return;
    }

    let cancelled = false;
    const search = debouncedConversationSearch.trim();
    setChatUserCandidatesLoading(true);
    getChatSchoolUsers({ schoolId: activeSchoolId, search, limit: 20 })
      .then((items) => {
        if (cancelled) return;
        const candidates = items
          .map(normalizeChatUserCandidate)
          .filter((item) => item.__chatUserId && String(item.__chatUserId) !== String(currentUserId))
          .slice(0, 12);
        setChatUserCandidates(candidates);
      })
      .catch(() => setChatUserCandidates([]))
      .finally(() => {
        if (!cancelled) setChatUserCandidatesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeSchoolId, currentUserId, debouncedConversationSearch]);

  useEffect(() => {
    if (!activeSchoolId || !isManageableConversation || !canManageActiveConversation) {
      setMemberSearchResults([]);
      setMemberSearchLoading(false);
      return;
    }
    const search = submittedMemberSearch.trim();
    if (!search) {
      setMemberSearchResults([]);
      setMemberSearchLoading(false);
      return;
    }
    let cancelled = false;
    setMemberSearchLoading(true);
    getChatSchoolUsers({ schoolId: activeSchoolId, search, limit: 20 })
      .then((items) => {
        if (cancelled) return;
        setMemberSearchResults(
          items
            .map(normalizeChatUserCandidate)
            .filter((item) => item.__chatUserId && String(item.__chatUserId) !== String(currentUserId))
        );
      })
      .catch(() => setMemberSearchResults([]))
      .finally(() => {
        if (!cancelled) setMemberSearchLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeSchoolId, canManageActiveConversation, currentUserId, isManageableConversation, submittedMemberSearch]);

  useEffect(() => {
    if (!isManageableConversation || !canManageActiveConversation) return;
    const timer = setTimeout(() => {
      setSubmittedMemberSearch((prev) => (prev === memberSearchTerm ? prev : memberSearchTerm));
    }, 3000);
    return () => clearTimeout(timer);
  }, [canManageActiveConversation, isManageableConversation, memberSearchTerm]);

  const handleSchoolChange = (e) => {
    setActiveSchoolId(e.target.value);
    setForbiddenMessage("");
  };

  const handleConversationSelect = (id) => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (typingSentRef.current) emitTyping(false);
    typingSentRef.current = false;
    setActiveConversationId(id);
    setMemberSearchTerm("");
    setSubmittedMemberSearch("");
    setMemberSearchResults([]);
    setDetailsVisible(false);
    setMobilePane("chat");
  };

  const handleMessageScroll = (e) => {
    const el = e.currentTarget;
    isNearMessageBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
    if (e.currentTarget.scrollTop > 40 || loadingOlder || messagesLoading) return;
    if (activeMessagesMeta.page >= activeMessagesMeta.lastPage) return;
    fetchMessages({
      conversationId: activeConversationId,
      page: activeMessagesMeta.page + 1,
      appendOlder: true,
    });
  };

  const validateFiles = (files) => {
    if (composerDisabled) {
      toast.error(composerDisabledMessage || "امکان ارسال پیام وجود ندارد.");
      return;
    }
    const maxBytes = Number(settings.maxFileSizeMb || 50) * 1024 * 1024;
    const allowed = toArray(settings.allowedMimeTypes).filter(Boolean);
    const accepted = [];
    const remainingSlots = Math.max(0, MAX_FILES_PER_MESSAGE - pendingFiles.length);
    if (!remainingSlots) {
      toast.error(`در هر پیام حداکثر ${MAX_FILES_PER_MESSAGE} فایل مجاز است.`);
      return;
    }

    files.slice(0, remainingSlots).forEach((file) => {
      if (maxBytes && file.size > maxBytes) {
        toast.error(`حجم ${file.name} از حد مجاز بیشتر است.`);
        return;
      }
      if (allowed.length && !allowed.includes(file.type)) {
        toast.error(`نوع فایل ${file.name} مجاز نیست.`);
        return;
      }
      accepted.push({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        url: "",
        uploadedAttachment: null,
        progress: 0,
        status: "queued",
        error: "",
        previewUrl: file.type?.startsWith("image/") ? URL.createObjectURL(file) : "",
      });
    });
    if (files.length > remainingSlots) {
      toast.warn(`فقط ${remainingSlots} فایل به صف اضافه شد.`);
    }

    setPendingFiles((prev) => [...prev, ...accepted]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    validateFiles(Array.from(e.dataTransfer.files || []));
  };

  const handleFileInput = (e) => {
    validateFiles(Array.from(e.target.files || []));
    e.target.value = "";
  };

  const validateVoiceFile = (file) => {
    const maxBytes = Number(settings.maxFileSizeMb || 50) * 1024 * 1024;
    const allowed = toArray(settings.allowedMimeTypes).filter(Boolean);
    const mime = file?.type || "audio/webm";
    const baseMime = mime.split(";")[0];
    if (maxBytes && file.size > maxBytes) {
      toast.error("حجم وویس از حد مجاز بیشتر است.");
      return false;
    }
    if (allowed.length && !allowed.includes(mime) && !allowed.includes(baseMime)) {
      toast.error("فرمت وویس در تنظیمات این مجموعه مجاز نیست.");
      return false;
    }
    if (!VOICE_ALLOWED_MIME_TYPES.some((item) => baseMime === item || mime.startsWith(item))) {
      toast.error("فرمت وویس پشتیبانی نمی‌شود.");
      return false;
    }
    return true;
  };

  const clearVoiceRecordingTimer = () => {
    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    voiceTimerRef.current = null;
  };

  const stopVoiceStream = () => {
    voiceStreamRef.current?.getTracks?.().forEach((track) => track.stop());
    voiceStreamRef.current = null;
  };

  const startVoiceRecording = async () => {
    if (!activeConversationId || voiceRecording || voiceDraft) return;
    if (composerDisabled) {
      toast.error(composerDisabledMessage || "امکان ارسال پیام وجود ندارد.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error("مرورگر شما ضبط وویس را پشتیبانی نمی‌کند.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickSupportedAudioMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks = [];
      mediaRecorderRef.current = recorder;
      voiceStreamRef.current = stream;
      voiceStartedAtRef.current = Date.now();
      voiceCancelRef.current = false;
      setVoiceSeconds(0);
      setVoiceRecording(true);

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) chunks.push(event.data);
      };
      recorder.onstop = () => {
        clearVoiceRecordingTimer();
        stopVoiceStream();
        setVoiceRecording(false);
        if (voiceCancelRef.current) {
          voiceCancelRef.current = false;
          setVoiceSeconds(0);
          return;
        }
        const audioMimeType = normalizeAudioMimeType(recorder.mimeType || "audio/webm");
        const blob = new Blob(chunks, { type: audioMimeType });
        const extension = audioMimeType.includes("ogg") ? "ogg" : audioMimeType.includes("mp4") ? "m4a" : "webm";
        const file = new File([blob], `voice-${Date.now()}.${extension}`, { type: audioMimeType });
        if (!validateVoiceFile(file)) return;
        setVoiceDraft({
          file,
          previewUrl: URL.createObjectURL(file),
          duration: Math.max(voiceSeconds, Math.round((Date.now() - voiceStartedAtRef.current) / 1000)),
        });
      };

      recorder.start();
      voiceTimerRef.current = setInterval(() => {
        const seconds = Math.round((Date.now() - voiceStartedAtRef.current) / 1000);
        setVoiceSeconds(seconds);
        if (seconds >= MAX_VOICE_RECORDING_SECONDS) {
          mediaRecorderRef.current?.stop();
        }
      }, 500);
    } catch {
      toast.error("دسترسی به میکروفون داده نشد یا ضبط وویس ممکن نیست.");
      setVoiceRecording(false);
      clearVoiceRecordingTimer();
      stopVoiceStream();
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
  };

  const cancelVoiceRecording = () => {
    voiceCancelRef.current = true;
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    clearVoiceRecordingTimer();
    stopVoiceStream();
    setVoiceRecording(false);
    setVoiceSeconds(0);
  };

  const removeVoiceDraft = () => {
    if (voiceDraft?.previewUrl) URL.revokeObjectURL(voiceDraft.previewUrl);
    setVoiceDraft(null);
    setVoiceUploadProgress(0);
  };

  const removePendingFile = (id) => {
    setPendingFiles((prev) => {
      const removed = prev.find((item) => item.id === id);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const updatePendingFile = (id, patch) => {
    setPendingFiles((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const uploadPendingFile = async (item) => {
    if (item.uploadedAttachment?.url) return item.uploadedAttachment;
    updatePendingFile(item.id, { status: "uploading", progress: 1, error: "" });
    try {
      const uploaded = await uploadChatFile({
        schoolId: Number(activeSchoolId),
        conversationId: activeConversationId,
        file: item.file,
        onUploadProgress: (event) => {
          const total = event.total || item.file?.size || 0;
          const progress = total ? Math.max(1, Math.min(99, Math.round((event.loaded / total) * 100))) : 50;
          updatePendingFile(item.id, { progress });
        },
      });
      const attachment = normalizeUploadedAttachment(uploaded, item.file);
      if (!attachment.url) throw new Error("Upload response did not include url");
      updatePendingFile(item.id, { uploadedAttachment: attachment, status: "uploaded", progress: 100, error: "" });
      return attachment;
    } catch (err) {
      updatePendingFile(item.id, { status: "error", error: "آپلود ناموفق بود. دوباره تلاش کنید." });
      throw err;
    }
  };

  const emitTyping = (isTyping) => {
    if (!activeConversationId || !socketRef.current?.connected) return;
    socketRef.current.emit("typing", { conversationId: activeConversationId, isTyping });
    typingSentRef.current = !!isTyping;
  };

  const handleComposerChange = (e) => {
    const value = e.target.value;
    setComposerBody(value);
    if (value.trim() && !typingSentRef.current) emitTyping(true);
    if (!value.trim() && typingSentRef.current) emitTyping(false);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      if (typingSentRef.current) emitTyping(false);
    }, 2500);
  };

  const buildMessagePayload = (attachments = []) => ({
    body: composerBody.trim() || undefined,
    attachments: attachments.length ? attachments.map(sanitizeOutgoingAttachment) : undefined,
  });

  const appendMessageToState = (message) => {
    setMessagesByConversationId((prev) => ({
      ...prev,
      [message.conversationId || activeConversationId]: [...(prev[message.conversationId || activeConversationId] || []), message],
    }));
    setConversations((prev) =>
      prev.map((item) =>
        item.id === (message.conversationId || activeConversationId)
          ? { ...item, lastMessage: message, lastMessageAt: message.createdAt || item.lastMessageAt }
          : item
      )
    );
  };

  const sendChatPayload = async (payload) => {
    const created = await sendChatMessage(activeConversationId, payload);
    const message = hydrateOutgoingMessage(normalizeMessage(created?.message || created));
    appendMessageToState(message);
    return message;
  };

  const handleSendForbiddenError = async (err) => {
    const backendMessage = String(err?.response?.data?.message || "");
    if (backendMessage.toLowerCase().includes("blocked")) {
      const status = await fetchPersonalBlockStatus(activeConversationId);
      if (status?.blockedByMe) {
        await fetchPersonalBlocks(activeConversationId);
        setForbiddenMessage("این کاربر را بلاک کرده‌اید. برای ارسال پیام ابتدا آنبلاک کنید.");
        return;
      }
      if (status?.blockedMe) {
        setForbiddenMessage("امکان ارسال پیام وجود ندارد، چون طرف مقابل شما را بلاک کرده است.");
        return;
      }
      setForbiddenMessage("امکان ارسال پیام در این گفتگوی مستقیم وجود ندارد.");
      return;
    }
    setForbiddenMessage(
      backendMessage.includes("read") || backendMessage.includes("only")
        ? "این گفتگو فقط خواندنی است و شما امکان ارسال پیام ندارید."
        : "شما امکان ارسال پیام در این مجموعه را ندارید."
    );
  };

  const sendVoiceMessage = async () => {
    if (!voiceDraft?.file || !activeConversationId || voiceSending) return;
    if (composerDisabled) {
      toast.error(composerDisabledMessage || "امکان ارسال پیام وجود ندارد.");
      return;
    }
    if (!validateVoiceFile(voiceDraft.file)) return;
    setVoiceSending(true);
    setVoiceUploadProgress(1);
    try {
      const uploaded = await uploadChatFile({
        schoolId: Number(activeSchoolId),
        conversationId: activeConversationId,
        file: voiceDraft.file,
        onUploadProgress: (event) => {
          const total = event.total || voiceDraft.file.size || 0;
          setVoiceUploadProgress(total ? Math.max(1, Math.min(99, Math.round((event.loaded / total) * 100))) : 50);
        },
      });
      const attachment = normalizeUploadedAttachment(uploaded, voiceDraft.file);
      const created = await sendChatMessage(activeConversationId, {
        attachments: [
          sanitizeOutgoingAttachment({
            fileId: attachment.fileId,
            name: voiceDraft.file.name,
            mimeType: voiceDraft.file.type || "audio/webm",
            sizeBytes: voiceDraft.file.size,
            url: uploaded.downloadUrl || uploaded.download_url || attachment.url,
          }),
        ],
      });
      appendMessageToState(hydrateOutgoingMessage(normalizeMessage(created?.message || created)));
      removeVoiceDraft();
    } catch (err) {
      if (err?.response?.status === 403) {
        await handleSendForbiddenError(err);
      }
    } finally {
      setVoiceSending(false);
      setVoiceUploadProgress(0);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!activeConversationId || sending) return;
    if (!composerBody.trim() && !pendingFiles.length) return;
    if (composerDisabled) {
      setForbiddenMessage(composerDisabledMessage);
      return;
    }

    setSending(true);
    setForbiddenMessage("");
    try {
      const attachments = [];
      for (const item of pendingFiles) {
        attachments.push(await uploadPendingFile(item));
      }
      const payload = buildMessagePayload(attachments);
      await sendChatPayload(payload);
      setComposerBody("");
      pendingFiles.forEach((item) => item.previewUrl && URL.revokeObjectURL(item.previewUrl));
      setPendingFiles([]);
      emitTyping(false);
    } catch (err) {
      if (err?.response?.status === 403) {
        await handleSendForbiddenError(err);
      } else if (pendingFiles.length) {
        toast.error("ارسال فایل ناموفق بود. دوباره تلاش کنید.");
      }
    } finally {
      setSending(false);
    }
  };

  const handleCreateConversation = async (e) => {
    e.preventDefault();
    if (!activeSchoolId) return;
    const memberUserIds = newConversation.memberUserIds.map(Number).filter(Boolean);
    if (newConversation.type === "direct" && memberUserIds.length !== 1) {
      toast.error("برای گفتگوی مستقیم دقیقاً یک کاربر انتخاب کنید.");
      return;
    }
    if (newConversation.type !== "direct" && memberUserIds.length < 1) {
      toast.error("برای گروه یا کانال حداقل یک عضو انتخاب کنید.");
      return;
    }
    if (newConversation.type !== "direct" && !newConversation.title.trim()) {
      toast.error("برای گروه یا کانال عنوان را وارد کنید.");
      return;
    }

    const payload = {
      schoolId: Number(activeSchoolId),
      type: newConversation.type,
      memberUserIds,
    };
    if (newConversation.type !== "direct") {
      payload.title = newConversation.title || undefined;
      payload.description = newConversation.description || undefined;
    }

    const created = await createChatConversation(payload);
    const conversation = normalizeConversation(created?.conversation || created);
    const nextUsers = collectUserSummaries({ conversations: [conversation] });
    if (Object.keys(nextUsers).length) {
      setUserNamesById((prev) => ({ ...prev, ...nextUsers }));
    }
    setConversations((prev) => [conversation, ...prev.filter((item) => item.id !== conversation.id)]);
    setActiveConversationId(conversation.id);
    setCreateModalOpen(false);
    setNewConversation({ type: "group", title: "", description: "", memberUserIds: [] });
    setMobilePane("chat");
  };

  const openDirectChat = async (user) => {
    const userId = Number(user.__chatUserId || user.id);
    if (!userId || openingDirectUserId) return;
    const existing = conversations.find(
      (conversation) => String(getDirectConversationMemberId(conversation, currentUserId)) === String(userId)
    );
    if (existing) {
      handleConversationSelect(existing.id);
      return;
    }

    setOpeningDirectUserId(userId);
    try {
      const created = await createChatConversation({
        schoolId: Number(activeSchoolId),
        type: "direct",
        memberUserIds: [userId],
      });
      const conversation = normalizeConversation(created?.conversation || created);
      setConversations((prev) => [conversation, ...prev.filter((item) => item.id !== conversation.id)]);
      setUserNamesById((prev) => ({ ...prev, [String(userId)]: user.__displayName || user.name || prev[String(userId)] }));
      setActiveConversationId(conversation.id);
      setMobilePane("chat");
    } finally {
      setOpeningDirectUserId(null);
    }
  };

  const openDirectChatFromMessage = (message = {}, senderName = "") => {
    const userId = Number(message.senderUserId || message.sender?.id || message.user?.id);
    if (!userId || String(userId) === String(currentUserId)) return;
    openDirectChat({
      __chatUserId: userId,
      __displayName: senderName || getMessageSenderName(message) || `کاربر ${userId}`,
      name: senderName || getMessageSenderName(message) || `کاربر ${userId}`,
    });
  };

  const handleEmojiInsert = (emojiData, fallbackEvent) => {
    const emoji = emojiData?.emoji || fallbackEvent?.emoji || "";
    if (!emoji) return;
    const input = composerInputRef.current;
    const start = input?.selectionStart ?? composerBody.length;
    const end = input?.selectionEnd ?? composerBody.length;
    const nextValue = `${composerBody.slice(0, start)}${emoji}${composerBody.slice(end)}`;
    setComposerBody(nextValue);
    setTimeout(() => {
      composerInputRef.current?.focus();
      const nextCursor = start + emoji.length;
      composerInputRef.current?.setSelectionRange?.(nextCursor, nextCursor);
    }, 0);
  };

  const toggleStickerPicker = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (composerDisabled) return;
    if (!stickerPickerOpen) {
      updateStickerPickerPosition();
    }
    setStickerPickerOpen((prev) => !prev);
  };

  const handleReact = async (messageId, emoji) => {
    const key = String(messageId);
    const previous = reactionState[key] || [];
    const currentUserKey = String(currentUserId || "me");
    const existing = previous.find((item) => item.emoji === emoji);
    const next = existing
      ? previous.map((item) =>
          item.emoji === emoji
            ? {
                ...item,
                count: item.reactedByMe ? Math.max(0, item.count - 1) : item.count + 1,
                reactedByMe: !item.reactedByMe,
                userIds: item.reactedByMe
                  ? item.userIds.filter((id) => String(id) !== currentUserKey)
                  : Array.from(new Set([...item.userIds, currentUserKey])),
              }
            : item
        ).filter((item) => item.count > 0)
      : [...previous, { emoji, userIds: [currentUserKey], count: 1, reactedByMe: true }];

    setReactionState((prev) => ({ ...prev, [key]: next }));
    try {
      await reactToChatMessage(messageId, emoji);
    } catch (err) {
      setReactionState((prev) => ({ ...prev, [key]: previous }));
    }
  };

  const refreshConversationMembers = async () => {
    await fetchConversationMembers(activeConversationId);
  };

  const handleMemberSearchSubmit = (e) => {
    e.preventDefault();
    setSubmittedMemberSearch(memberSearchTerm);
  };

  const handleAddConversationMember = async (user) => {
    const userId = Number(user.__chatUserId || user.id);
    if (!activeConversationId || !userId || !canManageActiveConversation || !canAddMembers) return;
    setMemberActionLoading(`add-${userId}`);
    try {
      await addChatConversationMembers(activeConversationId, [userId]);
      setUserNamesById((prev) => ({ ...prev, [String(userId)]: user.__displayName || prev[String(userId)] }));
      await refreshConversationMembers();
      toast.success("عضو به گفتگو اضافه شد.");
    } catch (e) {
      if (e?.response?.status === 403) toast.error("شما امکان افزودن عضو در این گفتگو را ندارید.");
    } finally {
      setMemberActionLoading("");
    }
  };

  const handleUpdateConversationMemberRole = async (member, role) => {
    const userId = getMemberUserId(member);
    if (!activeConversationId || !userId || !role || !canManageActiveConversation || !canUpdateMembers) return;
    setMemberActionLoading(`role-${userId}`);
    try {
      await updateChatConversationMember(activeConversationId, userId, { role });
      await refreshConversationMembers();
      toast.success("نقش عضو به‌روزرسانی شد.");
    } catch (e) {
      if (e?.response?.status === 403) toast.error("شما امکان تغییر نقش این عضو را ندارید.");
    } finally {
      setMemberActionLoading("");
    }
  };

  const handleRemoveConversationMember = async (member) => {
    const userId = getMemberUserId(member);
    if (!activeConversationId || !userId || !canManageActiveConversation || !canDeleteMembers) return;
    const memberName = getMemberDisplayName(member) || resolveUserNameById(userId) || `کاربر ${userId}`;
    const confirmed = await requestConfirm({
      title: "حذف عضو",
      message: `آیا از حذف ${memberName} از گفتگو مطمئن هستید؟`,
      confirmText: "حذف عضو",
      color: "danger",
    });
    if (!confirmed) return;
    setMemberActionLoading(`remove-${userId}`);
    try {
      await deleteChatConversationMember(activeConversationId, userId);
      await refreshConversationMembers();
      toast.success("عضو از گفتگو حذف شد.");
    } catch (e) {
      if (e?.response?.status === 403) toast.error("شما امکان حذف این عضو را ندارید.");
    } finally {
      setMemberActionLoading("");
    }
  };

  const handleToggleConversationReadOnly = async (e) => {
    if (!activeConversationId || !canManageActiveConversation || !canUpdateConversation) return;
    const isReadOnly = e.target.checked;
    setMemberActionLoading("read-only");
    try {
      const saved = await updateChatConversationSettings(activeConversationId, { isReadOnly });
      const nextIsReadOnly = saved?.isReadOnly ?? saved?.is_read_only ?? isReadOnly;
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === activeConversationId ? { ...conversation, isReadOnly: nextIsReadOnly } : conversation
        )
      );
      toast.success(nextIsReadOnly ? "گفتگو فقط خواندنی شد." : "امکان ارسال پیام برای اعضا فعال شد.");
    } catch (e) {
      if (e?.response?.status === 403) toast.error("شما امکان تغییر تنظیمات این گفتگو را ندارید.");
    } finally {
      setMemberActionLoading("");
    }
  };

  const handleUnblockListedUser = async (item) => {
    const userId = getBlockUserId(item);
    if (!activeSchoolId || !userId) return;
    const confirmed = await requestConfirm({
      title: "رفع بلاک",
      message: "آیا از رفع بلاک این کاربر مطمئن هستید؟",
      confirmText: "رفع بلاک",
      color: "success",
    });
    if (!confirmed) return;
    setMemberActionLoading(`unblock-${userId}`);
    try {
      await unblockChatUser(activeSchoolId, userId);
      await fetchBlockedUsers();
      const stats = await getChatSchoolStatistics(activeSchoolId, { silent: true }).catch(() => null);
      setStatistics(stats);
      toast.success("بلاک کاربر برداشته شد.");
    } finally {
      setMemberActionLoading("");
    }
  };

  const getBlockUntil = (duration) => {
    const now = new Date();
    if (duration === "hour") return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    if (duration === "today") {
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return end.toISOString();
    }
    if (duration === "week") return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    return undefined;
  };

  const removeConversationFromState = (conversationId) => {
    setConversations((prev) => prev.filter((item) => item.id !== conversationId));
    setMessagesByConversationId((prev) => {
      const next = { ...prev };
      delete next[conversationId];
      return next;
    });
    setMessagesMetaByConversationId((prev) => {
      const next = { ...prev };
      delete next[conversationId];
      return next;
    });
    setMembersByConversationId((prev) => {
      const next = { ...prev };
      delete next[conversationId];
      return next;
    });
    setPersonalBlocksByConversationId((prev) => {
      const next = { ...prev };
      delete next[conversationId];
      return next;
    });
    setPersonalBlockStatusByConversationId((prev) => {
      const next = { ...prev };
      delete next[conversationId];
      return next;
    });
    setActiveConversationId((prev) => (prev === conversationId ? null : prev));
  };

  const handleDeleteConversation = async (conversationId = activeConversationId) => {
    if (!conversationId || !canDeleteConversation) return;
    const confirmed = await requestConfirm({
      title: "حذف گفتگو",
      message: "این گفتگو فقط برای شما حذف می‌شود و برای طرف مقابل یا اعضای دیگر باقی می‌ماند.",
      confirmText: "حذف گفتگو",
      color: "danger",
    });
    if (!confirmed) return;
    setMemberActionLoading(`delete-conversation-${conversationId}`);
    try {
      await deleteChatConversation(conversationId);
      removeConversationFromState(conversationId);
      setMobilePane("list");
      toast.success("گفتگو حذف شد");
    } finally {
      setMemberActionLoading("");
    }
  };

  const openBlockModal = (userId, name = "") => {
    if (!userId) return;
    setBlockModal({ open: true, userId, name, reason: "", duration: "forever" });
  };

  const openPersonalBlockModal = () => {
    if (!activeConversationId || !activeDirectPeerUserId) return;
    setPersonalBlockModal({ open: true, reason: "", duration: "forever" });
  };

  const handlePersonalBlockSubmit = async (e) => {
    e.preventDefault();
    if (!activeConversationId || !activeDirectPeerUserId || !canManagePersonalBlocks) return;
    const confirmed = await requestConfirm({
      title: "بلاک گفتگوی خصوصی",
      message: "آیا از بلاک این کاربر در گفتگوی خصوصی مطمئن هستید؟",
      confirmText: "بلاک",
      color: "warning",
    });
    if (!confirmed) return;
    setMemberActionLoading("personal-block");
    try {
      await blockChatConversationUser(activeConversationId, {
        blockedUserId: Number(activeDirectPeerUserId),
        reason: personalBlockModal.reason || undefined,
        blockedUntil: getBlockUntil(personalBlockModal.duration),
      });
      setPersonalBlockModal({ open: false, reason: "", duration: "forever" });
      await fetchPersonalBlockStatus(activeConversationId);
      await fetchPersonalBlocks(activeConversationId);
      toast.success("کاربر بلاک شد.");
    } finally {
      setMemberActionLoading("");
    }
  };

  const handlePersonalUnblock = async () => {
    if (!activeConversationId || !activeDirectPeerUserId || !canManagePersonalBlocks) return;
    const confirmed = await requestConfirm({
      title: "آنبلاک کاربر",
      message: "آیا از آنبلاک این کاربر مطمئن هستید؟",
      confirmText: "آنبلاک",
      color: "success",
    });
    if (!confirmed) return;
    setMemberActionLoading("personal-unblock");
    try {
      await unblockChatConversationUser(activeConversationId, activeDirectPeerUserId);
      await fetchPersonalBlockStatus(activeConversationId);
      await fetchPersonalBlocks(activeConversationId);
      toast.success("کاربر آنبلاک شد");
    } finally {
      setMemberActionLoading("");
    }
  };

  const handleBlockModalSubmit = async (e) => {
    e.preventDefault();
    const confirmed = await requestConfirm({
      title: "بلاک مدیریتی مجموعه",
      message: "آیا از بلاک این کاربر در چت مجموعه مطمئن هستید؟",
      confirmText: "بلاک",
      color: "warning",
    });
    if (!confirmed) return;
    await blockChatUser(activeSchoolId, {
      blockedUserId: Number(blockModal.userId),
      reason: blockModal.reason || undefined,
      blockedUntil: getBlockUntil(blockModal.duration),
    });
    toast.success("کاربر در چت مجموعه بلاک شد.");
    setBlockModal({ open: false, userId: "", name: "", reason: "", duration: "forever" });
    await fetchBlockedUsers();
    const stats = await getChatSchoolStatistics(activeSchoolId, { silent: true }).catch(() => null);
    setStatistics(stats);
  };

  const handleDeleteMessage = async (message) => {
    const messageId = message?.id || message;
    if (
      !canDeleteConversationMessage({
        conversation: activeConversation || {},
        message: message || {},
        currentUserId,
        currentRole: currentConversationRole,
        hasPermission: canDeleteChatMessages,
      })
    ) {
      return;
    }
    const confirmed = await requestConfirm({
      title: "حذف پیام",
      message: "آیا از حذف پیام مطمئن هستید؟",
      confirmText: "حذف پیام",
      color: "danger",
    });
    if (!confirmed) return;
    const deleted = await deleteChatMessage(messageId);
    const deletedMessage = normalizeMessage(deleted?.message || deleted);
    setMessagesByConversationId((prev) => ({
      ...prev,
      [activeConversationId]: (prev[activeConversationId] || []).map((item) =>
        item.id === messageId
          ? {
              ...item,
              ...deletedMessage,
              status: deletedMessage.status || "deleted",
              deletedAt: deletedMessage.deletedAt || new Date().toISOString(),
              body: deletedMessage.body || "",
              attachments: [],
            }
          : item
      ),
    }));
  };

  const handleDeleteMemberMessages = async (member) => {
    const userId = getMemberUserId(member);
    if (!activeConversationId || !userId || !isManageableConversation || !canManageActiveConversation || !canDeleteChatMessages) {
      return;
    }
    const confirmed = await requestConfirm({
      title: "حذف پیام‌های کاربر",
      message: "همه پیام‌های این کاربر در این گفتگو حذف می‌شود. این عملیات برای اعضای گفتگو قابل مشاهده خواهد بود.",
      confirmText: "حذف پیام‌ها",
      color: "danger",
    });
    if (!confirmed) return;
    setMemberActionLoading(`delete-messages-${userId}`);
    try {
      const res = await deleteChatConversationUserMessages(activeConversationId, userId);
      const deletedCount = Number(res?.deletedCount ?? res?.deleted_count ?? 0);
      setMessagesByConversationId((prev) => ({
        ...prev,
        [activeConversationId]: (prev[activeConversationId] || []).map((item) =>
          String(item.senderUserId) === String(userId)
            ? { ...item, status: "deleted", deletedAt: item.deletedAt || new Date().toISOString(), body: "", attachments: [] }
            : item
        ),
      }));
      await fetchMessages({ conversationId: activeConversationId, page: 1 });
      toast.success(`${deletedCount} پیام حذف شد`);
    } catch (e) {
      if (e?.response?.status === 403) toast.error("شما امکان حذف پیام‌های این کاربر را ندارید.");
    } finally {
      setMemberActionLoading("");
    }
  };

  const handleEditMessage = async (e) => {
    e.preventDefault();
    if (!editingMessage || !editBody.trim()) return;
    const updated = await updateChatMessage(editingMessage.id, { body: editBody.trim() });
    const message = normalizeMessage(updated?.message || updated);
    setMessagesByConversationId((prev) => ({
      ...prev,
      [activeConversationId]: (prev[activeConversationId] || []).map((item) =>
        item.id === editingMessage.id ? { ...item, ...message, body: message.body || editBody.trim() } : item
      ),
    }));
    setEditingMessage(null);
    setEditBody("");
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const payload = {
      isEnabled: !!settingsDraft.isEnabled,
      maxFileSizeMb: Math.min(Number(settingsDraft.maxFileSizeMb || 0), 50),
      allowedMimeTypes: String(settingsDraft.allowedMimeTypesText || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      dailyMessageLimitPerUser: settingsDraft.dailyMessageLimitPerUser
        ? Number(settingsDraft.dailyMessageLimitPerUser)
        : undefined,
      monthlyStorageLimitMb: settingsDraft.monthlyStorageLimitMb
        ? Number(settingsDraft.monthlyStorageLimitMb)
        : undefined,
    };
    const saved = await updateChatSchoolSettings(activeSchoolId, payload);
    const next = { ...DEFAULT_SETTINGS, ...saved, allowedMimeTypes: toArray(saved.allowedMimeTypes || payload.allowedMimeTypes) };
    setSettings(next);
    setSettingsDraft(next);
    toast.success("تنظیمات چت ذخیره شد.");
  };

  const handleBlockUser = async (e) => {
    e.preventDefault();
    if (!blockForm.blockedUserId) return;
    await blockChatUser(activeSchoolId, {
      blockedUserId: Number(blockForm.blockedUserId),
      reason: blockForm.reason || undefined,
      blockedUntil: blockForm.blockedUntil || undefined,
    });
    setBlockForm({ blockedUserId: "", reason: "", blockedUntil: "" });
    await fetchBlockedUsers();
    const stats = await getChatSchoolStatistics(activeSchoolId, { silent: true }).catch(() => null);
    setStatistics(stats);
  };

  const handleUnblockUser = async (e) => {
    e.preventDefault();
    if (!unblockUserId) return;
    await unblockChatUser(activeSchoolId, unblockUserId);
    setUnblockUserId("");
    await fetchBlockedUsers();
    const stats = await getChatSchoolStatistics(activeSchoolId, { silent: true }).catch(() => null);
    setStatistics(stats);
  };

  const handleDownloadAttachment = async (attachment = {}) => {
    const url = getAttachmentUrlCandidates(attachment)[0] || "";
    const name = attachment.name || attachment.title || "file";
    if (!url) return;
    try {
      const token = getAccessToken();
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error("download failed");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const renderAttachment = (attachment = {}) => {
    const url = getAttachmentUrlCandidates(attachment)[0] || "";
    const mime = getAttachmentMimeType(attachment);
    const name = attachment.name || attachment.title || "فایل";
    const size = attachment.sizeBytes || attachment.size_bytes || attachment.size;
    const isSticker = mime.startsWith("image/") && String(name).startsWith("sticker-");
    if (mime.startsWith("image/") && url) {
      return (
        <div className={isSticker ? "school-chat-sticker-attachment" : "school-chat-image-attachment"}>
          <button type="button" onClick={() => setLightboxAttachment({ ...attachment, url, name })}>
            <img src={url} alt={name} className="school-chat-attachment-image" />
          </button>
          {!isSticker && (
            <Button color="light" size="sm" onClick={() => handleDownloadAttachment({ ...attachment, url, name })}>
              <i className="bx bx-download" />
            </Button>
          )}
        </div>
      );
    }
    if (mime.startsWith("audio/") && url) {
      return (
        <VoiceMessagePlayer
          attachment={{ ...attachment, url, name }}
          onDownload={() => handleDownloadAttachment({ ...attachment, url, name })}
        />
      );
    }
    if (mime.startsWith("video/") && url) {
      return (
        <div className="school-chat-media-card">
          <video controls src={url} className="w-100 school-chat-video" />
          <Button color="light" size="sm" onClick={() => handleDownloadAttachment({ ...attachment, url, name })}>
            <i className="bx bx-download" /> دانلود
          </Button>
        </div>
      );
    }
    return (
      <div className="school-chat-file">
        <i className="bx bx-file" />
        <span>{name}</span>
        <small>{formatBytes(size)}</small>
        <Button color="light" size="sm" onClick={() => handleDownloadAttachment({ ...attachment, url, name })}>
          <i className="bx bx-download" />
        </Button>
      </div>
    );
  };

  const activeTypingLabel = activeConversation ? getConversationTypingLabel(activeConversation) : "";
  const activeConversationSubtitle =
    activeTypingLabel ||
    (activeConversation?.type === "direct" ? getUserPresenceLabel(activeDirectPeerPresence) : resolveConversationSubtitle(activeConversation || {}));
  const stickerPickerPortal =
    typeof document !== "undefined" && stickerPickerOpen
      ? createPortal(
          <div
            className="school-chat-sticker-picker school-chat-sticker-picker-portal"
            ref={stickerPickerRef}
            style={{
              top: `${stickerPickerPosition.top}px`,
              left: `${stickerPickerPosition.left}px`,
              width: `${stickerPickerPosition.width}px`,
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <EmojiPicker
              onEmojiClick={handleEmojiInsert}
              width="100%"
              height={320}
              lazyLoadEmojis
              previewConfig={{ showPreview: false }}
              searchPlaceHolder="جستجوی استیکر"
            />
          </div>,
          document.body
        )
      : null;

  return (
    <div className="page-content">
      {stickerPickerPortal}
      <Container fluid>
        <Breadcrumbs title="چت" breadcrumbItem="چت آنلاین" />

        <Card className="school-chat-shell">
          <CardBody className="p-0">
            <div className="school-chat-toolbar">
              <div className="school-chat-school">
                <Label className="mb-1">مجموعه فعال</Label>
                <Input
                  type="select"
                  value={activeSchoolId}
                  onChange={handleSchoolChange}
                  disabled={schoolsLoading}
                >
                  {!schools.length && <option value="">مجموعه‌ای یافت نشد</option>}
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name || school.title || `مجموعه ${school.id}`}
                    </option>
                  ))}
                </Input>
              </div>
              <Badge color={connection === "connected" ? "success" : connection === "connecting" ? "warning" : "secondary"}>
                {connection === "connected" ? "متصل" : connection === "connecting" ? "در حال اتصال" : "قطع"}
              </Badge>
            </div>

            {forbiddenMessage && <Alert color="warning" className="m-3 mb-0">{forbiddenMessage}</Alert>}

            <div className={`school-chat-grid ${canShowDetailsPanel ? "school-chat-grid--details-open" : "school-chat-grid--no-details"}`}>
              <aside className={`school-chat-sidebar ${mobilePane === "list" ? "is-active" : ""}`}>
                <div className="school-chat-panel-header">
                  <InputGroup>
                    <Input
                      value={conversationSearch}
                      onChange={(e) => setConversationSearch(e.target.value)}
                      placeholder="جستجوی گفتگو"
                    />
                    {conversationsLoading && (
                      <InputGroupText className="school-chat-search-loading">
                        <Spinner size="sm" />
                      </InputGroupText>
                    )}
                    {canCreateConversation && (
                      <Button
                        color="primary"
                        onClick={() => {
                          setNewConversation((prev) => ({ ...prev, type: "group", memberUserIds: [] }));
                          setCreateModalOpen(true);
                        }}
                        disabled={!activeSchoolId}
                      >
                        <i className="bx bx-plus" />
                      </Button>
                    )}
                  </InputGroup>
                </div>

                <div className="school-chat-conversations">
                  {conversationsLoading && <div className="text-center p-4"><Spinner size="sm" /></div>}
                  {!conversationsLoading && conversations.map((item) => {
                    const title = resolveConversationTitle(item);
                    const typeMeta = getConversationTypeMeta(item.type);
                    const conversationTypingLabel = getConversationTypingLabel(item);
                    const directPeerId = item.type === "direct" ? getDirectConversationMemberId(item, currentUserId) : null;
                    const directPeerPresence = directPeerId ? presenceByUserId[String(directPeerId)] : null;
                    const conversationMessages = messagesByConversationId[item.id] || [];
                    const latestMessage = conversationMessages[conversationMessages.length - 1];
                    const preview =
                      conversationTypingLabel ||
                      getMessagePreview(latestMessage) ||
                      getLastMessagePreview(item) ||
                      item.description ||
                      "بدون پیام";
                    return (
                      <button
                        type="button"
                        key={item.id}
                        className={`school-chat-conversation school-chat-conversation--${typeMeta.key} ${
                          activeConversationId === item.id ? "active" : ""
                        }`}
                        onClick={() => handleConversationSelect(item.id)}
                      >
                        <span
                          className={`school-chat-avatar school-chat-avatar--${typeMeta.key} ${
                            directPeerPresence?.isOnline ? "is-online" : ""
                          }`}
                        >
                          <span>{resolveConversationAvatarText(item)}</span>
                          <i className={`bx ${typeMeta.icon}`} />
                          {directPeerPresence?.isOnline && <span className="school-chat-presence-dot" />}
                        </span>
                        <span className="school-chat-conversation-body">
                          <span className="school-chat-conversation-title">
                            <strong>{title}</strong>
                            <span className={`school-chat-type-badge school-chat-type-badge--${typeMeta.key}`}>
                              <i className={`bx ${typeMeta.icon}`} />
                              {typeMeta.label}
                            </span>
                          </span>
                          <small className={conversationTypingLabel ? "text-primary" : ""}>{preview}</small>
                        </span>
                        <span className="school-chat-conversation-meta">
                          <small>{formatChatDate(item.lastMessageAt || latestMessage?.createdAt)}</small>
                          {item.unreadCount > 0 && <Badge color="danger" pill>{item.unreadCount}</Badge>}
                          {canDeleteConversation && (
                            <span
                              role="button"
                              tabIndex={0}
                              className="school-chat-conversation-delete"
                              title="حذف گفتگو"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteConversation(item.id);
                              }}
                              onKeyDown={(e) => {
                                if (e.key !== "Enter" && e.key !== " ") return;
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteConversation(item.id);
                              }}
                            >
                              <i className="bx bx-trash" />
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                  {!conversationsLoading && !conversations.length && (
                    <div className="text-muted text-center p-4">
                      {debouncedConversationSearch ? "گفتگویی پیدا نشد" : "گفتگویی برای این مجموعه وجود ندارد."}
                    </div>
                  )}
                  {!!debouncedConversationSearch && (
                    <div className="school-chat-user-results">
                      <div className="school-chat-user-results-title">
                        <span>کاربران مجموعه</span>
                        {chatUserCandidatesLoading && <Spinner size="sm" />}
                      </div>
                      {!chatUserCandidatesLoading && !chatUserCandidates.length && (
                        <div className="text-muted small p-3">کاربری پیدا نشد.</div>
                      )}
                      {chatUserCandidates.map((user) => (
                        <button
                          type="button"
                          key={`candidate-${user.__chatUserId}`}
                          className="school-chat-user-result"
                          onClick={() => openDirectChat(user)}
                          disabled={openingDirectUserId === Number(user.__chatUserId)}
                        >
                          <span className="school-chat-avatar">{getUserAvatarText(user.__displayName)}</span>
                          <span>
                            <strong>{user.__displayName}</strong>
                            <small>{user.__roleLabels?.join("، ") || "کاربر"}</small>
                          </span>
                          {openingDirectUserId === Number(user.__chatUserId) && <Spinner size="sm" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </aside>

              <main className={`school-chat-main ${mobilePane === "chat" ? "is-active" : ""}`}>
                {activeConversation ? (
                  <>
                    <div className="school-chat-header">
                      <Button color="light" className="d-lg-none" onClick={() => setMobilePane("list")}>
                        <i className="bx bx-arrow-back" />
                      </Button>
                      <button
                        type="button"
                        className={`school-chat-header-profile ${detailsVisible ? "is-open" : ""}`}
                        onClick={() => {
                          if (canOpenDetailsPanel) {
                            setDetailsVisible((prev) => !prev);
                          }
                        }}
                        disabled={!canOpenDetailsPanel}
                        title={isManageableConversation ? "نمایش جزئیات گفتگو" : "نمایش مدیریت چت"}
                      >
                        <span
                          className={`school-chat-avatar school-chat-header-avatar ${
                            activeDirectPeerPresence?.isOnline ? "is-online" : ""
                          }`}
                        >
                          {resolveConversationAvatarText(activeConversation)}
                          {activeConversation?.type === "direct" && activeDirectPeerPresence?.isOnline && (
                            <span className="school-chat-presence-dot" />
                          )}
                        </span>
                        <span className="school-chat-header-title">
                          <h5 className="mb-1">{resolveConversationTitle(activeConversation)}</h5>
                          <small className={activeTypingLabel ? "text-primary" : "text-muted"}>
                            {activeConversationSubtitle}
                          </small>
                        </span>
                      </button>
                      <Input
                        className="school-chat-message-search"
                        value={messageSearch}
                        onChange={(e) => setMessageSearch(e.target.value)}
                        placeholder="جستجوی پیام"
                      />
                      {(canDeleteConversation || (activeDirectMember && (canManagePersonalBlocks || canAdminBlocks))) && (
                        <UncontrolledDropdown>
                          <DropdownToggle color="light" className="school-chat-header-action" caret={false}>
                            <i className="bx bx-dots-vertical-rounded" />
                          </DropdownToggle>
                          <DropdownMenu end>
                            {canDeleteConversation && (
                              <DropdownItem
                                className="text-danger"
                                disabled={memberActionLoading === `delete-conversation-${activeConversationId}`}
                                onClick={() => handleDeleteConversation(activeConversationId)}
                              >
                                حذف گفتگو
                              </DropdownItem>
                            )}
                            {activeDirectMember && canManagePersonalBlocks && (
                              <>
                                {canDeleteConversation && <DropdownItem divider />}
                                {composerPersonalBlockDisabled ? (
                                  <DropdownItem disabled={memberActionLoading === "personal-unblock"} onClick={handlePersonalUnblock}>
                                    آنبلاک کاربر
                                  </DropdownItem>
                                ) : (
                                  <DropdownItem disabled={memberActionLoading === "personal-block"} onClick={openPersonalBlockModal}>
                                    بلاک کاربر
                                  </DropdownItem>
                                )}
                              </>
                            )}
                            {activeDirectMember && canAdminBlocks && (
                              <>
                                {(canDeleteConversation || canManagePersonalBlocks) && <DropdownItem divider />}
                                <DropdownItem
                                  className="text-warning"
                                  onClick={() =>
                                    openBlockModal(getMemberUserId(activeDirectMember), getMemberDisplayName(activeDirectMember))
                                  }
                                >
                                  بلاک مدیریتی مجموعه
                                </DropdownItem>
                              </>
                            )}
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      )}
                    </div>

                    <div
                      className={`school-chat-messages ${isDraggingFile ? "is-dragging" : ""}`}
                      ref={messageListRef}
                      onScroll={handleMessageScroll}
                      onDrop={handleDrop}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingFile(true);
                      }}
                      onDragLeave={() => setIsDraggingFile(false)}
                    >
                      {isDraggingFile && <div className="school-chat-dropzone">فایل‌ها را اینجا رها کنید</div>}
                      {loadingOlder && <div className="text-center py-2"><Spinner size="sm" /></div>}
                      {messagesLoading && !activeMessages.length && <div className="text-center p-4"><Spinner size="sm" /></div>}
                      {activeMessages.map((message, index) => {
                        const isOwn = String(message.senderUserId) === String(currentUserId);
                        const senderName = resolveMessageSenderName(message);
                        const isGrouped = shouldGroupWithPreviousMessage(activeMessages[index - 1], message);
                        const isDeleted = message.status === "deleted" || message.deletedAt;
                        const isEdited = message.status === "edited" || message.editedAt;
                        const isSticker = isStickerMessage(message);
                        const reactions = reactionState[String(message.id)] || [];
                        const canOpenSenderDirect =
                          !isOwn &&
                          (activeConversation?.type === "group" || activeConversation?.type === "channel") &&
                          !!message.senderUserId;
                        const canDeleteThisMessage = canDeleteConversationMessage({
                          conversation: activeConversation || {},
                          message,
                          currentUserId,
                          currentRole: currentConversationRole,
                          hasPermission: canDeleteChatMessages,
                        });
                        const senderDirectLoading =
                          canOpenSenderDirect && openingDirectUserId === Number(message.senderUserId);
                        return (
                          <div key={message.id} className={`school-chat-message ${isOwn ? "own" : ""} ${isGrouped ? "grouped" : ""}`}>
                            {!isOwn && (
                              <button
                                type="button"
                                className={`school-chat-message-avatar ${canOpenSenderDirect ? "is-clickable" : ""}`}
                                disabled={!canOpenSenderDirect || senderDirectLoading}
                                title={canOpenSenderDirect ? `ارسال پیام خصوصی به ${senderName}` : undefined}
                                onClick={() => openDirectChatFromMessage(message, senderName)}
                              >
                                {!isGrouped ? (message.sender?.initials || getUserAvatarText(senderName || "کاربر")) : ""}
                                {senderDirectLoading && <Spinner size="sm" />}
                              </button>
                            )}
                            <div className={`school-chat-bubble ${isSticker ? "is-sticker" : ""}`}>
                              {!isOwn && !isGrouped && (
                                <button
                                  type="button"
                                  className={`school-chat-sender ${canOpenSenderDirect ? "is-clickable" : ""}`}
                                  disabled={!canOpenSenderDirect || senderDirectLoading}
                                  onClick={() => openDirectChatFromMessage(message, senderName)}
                                >
                                  {senderName}
                                </button>
                              )}
                              {isDeleted ? (
                                <em className="text-muted">این پیام حذف شده است.</em>
                              ) : (
                                <>
                                  {message.body && <p>{message.body}</p>}
                                  {!!message.attachments.length && (
                                    <div className="school-chat-attachments">
                                      {message.attachments.map((attachment, index) => (
                                        <React.Fragment key={`${message.id}-att-${index}`}>
                                          {renderAttachment(attachment)}
                                        </React.Fragment>
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                              <div className="school-chat-message-meta">
                                {isEdited && <span>ویرایش‌شده</span>}
                                <span>{formatChatDate(message.createdAt)}</span>
                              </div>
                              {!!reactions.length && (
                                <div className="school-chat-reactions">
                                  {reactions.map((reaction) => (
                                    <button
                                      type="button"
                                      key={`${message.id}-${reaction.emoji}`}
                                      className={reaction.reactedByMe ? "active" : ""}
                                      onClick={() => handleReact(message.id, reaction.emoji)}
                                    >
                                      {reaction.emoji} {reaction.count}
                                    </button>
                                  ))}
                                </div>
                              )}
                              {!isDeleted && (
                                <div className="school-chat-message-actions">
                                  {QUICK_REACTIONS.map((emoji) => (
                                    <Button key={emoji} color="link" size="sm" onClick={() => handleReact(message.id, emoji)}>
                                      {emoji}
                                    </Button>
                                  ))}
                                  {isOwn && (
                                      <Button color="link" size="sm" onClick={() => { setEditingMessage(message); setEditBody(message.body || ""); }}>
                                        ویرایش
                                      </Button>
                                  )}
                                  {canDeleteThisMessage && (
                                    <Button color="link" size="sm" className="text-danger" onClick={() => handleDeleteMessage(message)}>
                                      حذف پیام
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {!messagesLoading && !activeMessages.length && (
                        <div className="text-muted text-center p-4">پیامی وجود ندارد.</div>
                      )}
                    </div>

                    {!!activeTypingLabel && <div className="school-chat-typing">{activeTypingLabel}</div>}

                    <Form
                      className="school-chat-composer"
                      onSubmit={handleSend}
                      onDrop={handleDrop}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingFile(true);
                      }}
                      onDragLeave={() => setIsDraggingFile(false)}
                    >
                      {!settings.isEnabled && (
                        <Alert color="warning" className="py-2 mb-2">
                          چت این مجموعه غیرفعال است.
                        </Alert>
                      )}
                      {composerPermissionDisabled && (
                        <Alert color="warning" className="py-2 mb-2">
                          شما مجوز ارسال پیام در چت را ندارید.
                        </Alert>
                      )}
                      {composerChannelMemberDisabled && (
                        <Alert color="info" className="py-2 mb-2">
                          فقط ادمین‌های کانال می‌توانند پیام ارسال کنند.
                        </Alert>
                      )}
                      {composerReadOnlyDisabled && !composerChannelMemberDisabled && (
                        <Alert color="info" className="py-2 mb-2">
                          فقط ادمین‌ها می‌توانند در این گفتگو پیام ارسال کنند.
                        </Alert>
                      )}
                      {composerPersonalBlockDisabled && (
                        <Alert color="warning" className="py-2 mb-2 school-chat-composer-alert">
                          <span>این کاربر را بلاک کرده‌اید. برای ارسال پیام ابتدا آنبلاک کنید.</span>
                          <Button color="link" size="sm" onClick={handlePersonalUnblock}>
                            آنبلاک
                          </Button>
                        </Alert>
                      )}
                      {composerDirectBlockedDisabled && (
                        <Alert color="warning" className="py-2 mb-2">
                          {composerDisabledMessage}
                        </Alert>
                      )}
                      {!!pendingFiles.length && (
                        <div className="school-chat-pending">
                          {pendingFiles.map((item) => (
                            <div key={item.id} className="school-chat-pending-file">
                              {item.previewUrl ? <img src={item.previewUrl} alt={item.name} /> : <i className="bx bx-file" />}
                              <div>
                                <strong>{item.name}</strong>
                                <small>{formatBytes(item.sizeBytes)}</small>
                                <div className="school-chat-upload-progress">
                                  <span style={{ width: `${item.progress || 0}%` }} />
                                </div>
                                <small className={item.status === "error" ? "text-danger" : "text-muted"}>
                                  {item.status === "uploading"
                                    ? `در حال آپلود ${item.progress || 0}%`
                                    : item.status === "uploaded"
                                      ? "آپلود شد"
                                      : item.status === "error"
                                        ? item.error
                                        : "در صف ارسال"}
                                </small>
                              </div>
                              {item.status === "error" && (
                                <Button color="link" onClick={() => uploadPendingFile(item)}>
                                  تلاش مجدد
                                </Button>
                              )}
                              <Button color="link" className="text-danger" onClick={() => removePendingFile(item.id)}>
                                <i className="bx bx-x" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      {(voiceRecording || voiceDraft) && (
                        <div className="school-chat-voice-panel">
                          {voiceRecording ? (
                            <>
                              <span className="school-chat-recording-dot" />
                              <strong>{formatDuration(voiceSeconds)}</strong>
                              <div className="school-chat-waveform">
                                {Array.from({ length: 18 }).map((_, index) => (
                                  <span key={`voice-wave-${index}`} />
                                ))}
                              </div>
                              <Button color="success" size="sm" type="button" onClick={stopVoiceRecording}>
                                پایان
                              </Button>
                              <Button color="link" size="sm" type="button" className="text-danger" onClick={cancelVoiceRecording}>
                                لغو
                              </Button>
                            </>
                          ) : (
                            <>
                              <VoiceMessagePlayer
                                attachment={{ url: voiceDraft.previewUrl, name: voiceDraft.file?.name || "voice-message" }}
                              />
                              {!!voiceUploadProgress && (
                                <div className="school-chat-upload-progress">
                                  <span style={{ width: `${voiceUploadProgress}%` }} />
                                </div>
                              )}
                              <Button color="primary" size="sm" type="button" disabled={voiceSending || composerDisabled} onClick={sendVoiceMessage}>
                                {voiceSending ? <Spinner size="sm" /> : "ارسال وویس"}
                              </Button>
                              <Button color="link" size="sm" type="button" className="text-danger" onClick={removeVoiceDraft}>
                                حذف
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                      <InputGroup>
                        <Label className={`btn btn-light mb-0 ${composerDisabled ? "disabled" : ""}`}>
                          <i className="bx bx-paperclip" />
                          <Input type="file" multiple hidden disabled={composerDisabled} onChange={handleFileInput} />
                        </Label>
                        <Button
                          color="light"
                          type="button"
                          className="school-chat-sticker-control"
                          innerRef={stickerButtonRef}
                          disabled={composerDisabled}
                          onMouseDown={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={toggleStickerPicker}
                        >
                          <i className="bx bx-smile" />
                        </Button>
                        <Button
                          color={voiceRecording ? "danger" : "light"}
                          type="button"
                          disabled={composerDisabled || !!voiceDraft}
                          onClick={voiceRecording ? stopVoiceRecording : startVoiceRecording}
                        >
                          <i className={voiceRecording ? "bx bx-stop" : "bx bx-microphone"} />
                        </Button>
                        <Input
                          innerRef={composerInputRef}
                          value={composerBody}
                          onChange={handleComposerChange}
                          placeholder="پیام خود را بنویسید..."
                          disabled={composerDisabled}
                        />
                        <Button color="primary" type="submit" disabled={sending || composerDisabled}>
                          {sending ? <Spinner size="sm" /> : <i className="bx bx-send" />}
                        </Button>
                      </InputGroup>
                    </Form>
                  </>
                ) : (
                  <div className="school-chat-empty">یک گفتگو را انتخاب کنید یا گفتگوی جدید بسازید.</div>
                )}
              </main>

              {canShowDetailsPanel && (
                <aside className="school-chat-details">
                  <h5>{isManageableConversation ? "جزئیات گفتگو" : "مدیریت چت"}</h5>
                  {statistics && (
                    <Row className="g-2 school-chat-stats">
                      <Col xs="6"><span>پیام</span><strong>{statistics.messageCount ?? "-"}</strong></Col>
                      <Col xs="6"><span>فایل</span><strong>{statistics.fileCount ?? "-"}</strong></Col>
                      <Col xs="6"><span>حجم</span><strong>{formatBytes(statistics.storageBytes)}</strong></Col>
                      <Col xs="6"><span>بلاک</span><strong>{statistics.activeBlocks ?? "-"}</strong></Col>
                    </Row>
                  )}
                  {isManageableConversation && (
                    <div className="school-chat-member-list">
                      <div className="school-chat-panel-title">
                        <h6>اعضای گفتگو</h6>
                        {membersLoading && <Spinner size="sm" />}
                      </div>
                      {(canManageActiveConversation || activeConversation?.isReadOnly) && (
                        <FormGroup switch className="school-chat-readonly-toggle">
                          <Input
                            type="switch"
                            checked={!!activeConversation?.isReadOnly}
                            disabled={!canManageActiveConversation || !canUpdateConversation || memberActionLoading === "read-only"}
                            onChange={handleToggleConversationReadOnly}
                          />
                          <Label check>فقط خواندنی برای اعضای عادی</Label>
                        </FormGroup>
                      )}
                      {!canManageActiveConversation && activeConversation?.isReadOnly && (
                        <Alert color="info" className="py-2 mb-2">
                          این گفتگو فقط خواندنی است.
                        </Alert>
                      )}
                      {activeConversationMembers.map((member) => {
                        const memberId = getMemberUserId(member);
                        const memberName = getMemberDisplayName(member) || resolveUserNameById(memberId) || `کاربر ${memberId}`;
                        const role = getMemberRole(member);
                        const isSelfMember = String(memberId) === String(currentUserId);
                        const isOwner = role === "owner";
                        const memberPresence = presenceByUserId[String(memberId)];
                        return (
                          <div key={`member-${memberId}`} className="school-chat-member-row">
                            <span className={`school-chat-avatar sm ${memberPresence?.isOnline ? "is-online" : ""}`}>
                              {getMemberInitials(member)}
                              {memberPresence?.isOnline && <span className="school-chat-presence-dot" />}
                            </span>
                            <div className="school-chat-member-main">
                              <strong>{memberName}</strong>
                              <small className={memberPresence?.isOnline ? "text-success" : "text-muted"}>
                                {getUserPresenceLabel(memberPresence)}
                              </small>
                              <Badge color={role === "owner" ? "primary" : role === "admin" ? "info" : "secondary"}>
                                {MEMBER_ROLE_LABELS[role] || "عضو"}
                              </Badge>
                            </div>
                            <div className="school-chat-member-actions">
                              {canManageActiveConversation && canUpdateMembers && !isSelfMember && (
                                <Input
                                  type="select"
                                  bsSize="sm"
                                  value={role}
                                  disabled={isOwner || memberActionLoading === `role-${memberId}`}
                                  onChange={(e) => handleUpdateConversationMemberRole(member, e.target.value)}
                                >
                                  <option value="member">عضو</option>
                                  <option value="admin">ادمین</option>
                                  <option value="owner">مالک</option>
                                </Input>
                              )}
                              {canAdminBlocks && !isSelfMember && (
                                <Button color="link" size="sm" className="text-warning" onClick={() => openBlockModal(memberId, memberName)}>
                                  بلاک
                                </Button>
                              )}
                              {canManageActiveConversation && canDeleteChatMessages && (
                                <Button
                                  color="link"
                                  size="sm"
                                  className="text-danger"
                                  disabled={memberActionLoading === `delete-messages-${memberId}`}
                                  onClick={() => handleDeleteMemberMessages(member)}
                                >
                                  حذف پیام‌ها
                                </Button>
                              )}
                              {canManageActiveConversation && canDeleteMembers && !isSelfMember && !isOwner && (
                                <Button
                                  color="link"
                                  size="sm"
                                  className="text-danger"
                                  disabled={memberActionLoading === `remove-${memberId}`}
                                  onClick={() => handleRemoveConversationMember(member)}
                                >
                                  حذف
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {canManageActiveConversation && canAddMembers && (
                        <Form className="school-chat-member-add" onSubmit={handleMemberSearchSubmit}>
                          <Label>افزودن عضو</Label>
                          <InputGroup>
                            <Input
                              value={memberSearchTerm}
                              onChange={(e) => setMemberSearchTerm(e.target.value)}
                              placeholder="نام، موبایل یا نقش کاربر"
                            />
                            <Button color="primary" type="submit">
                              {memberSearchLoading ? <Spinner size="sm" /> : "جستجو"}
                            </Button>
                          </InputGroup>
                          {!!memberSearchResults.length && (
                            <div className="school-chat-member-search-results">
                              {memberSearchResults.map((user) => {
                                const userId = user.__chatUserId;
                                const exists = activeMemberIds.has(String(userId));
                                return (
                                  <div key={`member-result-${userId}`}>
                                    <span className="school-chat-avatar sm">{getUserAvatarText(user.__displayName)}</span>
                                    <div>
                                      <strong>{user.__displayName}</strong>
                                      {!!user.__roleLabels?.length && <small>{user.__roleLabels.join("، ")}</small>}
                                    </div>
                                    <Button
                                      color={exists ? "secondary" : "primary"}
                                      size="sm"
                                      disabled={exists || memberActionLoading === `add-${userId}`}
                                      onClick={() => handleAddConversationMember(user)}
                                    >
                                      {exists ? "عضو گفتگو" : "افزودن"}
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </Form>
                      )}
                    </div>
                  )}

                  {(adminVisible || canManageChat) && (
                    <Form onSubmit={handleSaveSettings} className="mt-3">
                      <h6>تنظیمات مجموعه</h6>
                      <FormGroup switch>
                        <Input
                          type="switch"
                          checked={!!settingsDraft.isEnabled}
                          onChange={(e) => setSettingsDraft((prev) => ({ ...prev, isEnabled: e.target.checked }))}
                        />
                        <Label check>فعال بودن چت</Label>
                      </FormGroup>
                      <FormGroup>
                        <Label>حداکثر حجم فایل (MB)</Label>
                        <Input
                          type="number"
                          max="50"
                          value={settingsDraft.maxFileSizeMb || ""}
                          onChange={(e) => setSettingsDraft((prev) => ({ ...prev, maxFileSizeMb: e.target.value }))}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label>Mime typeهای مجاز</Label>
                        <Input
                          value={
                            settingsDraft.allowedMimeTypesText ??
                            toArray(settingsDraft.allowedMimeTypes).join(", ")
                          }
                          onChange={(e) => setSettingsDraft((prev) => ({ ...prev, allowedMimeTypesText: e.target.value }))}
                          placeholder="image/png, application/pdf"
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label>سقف پیام روزانه</Label>
                        <Input
                          type="number"
                          value={settingsDraft.dailyMessageLimitPerUser || ""}
                          onChange={(e) => setSettingsDraft((prev) => ({ ...prev, dailyMessageLimitPerUser: e.target.value }))}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label>سقف storage ماهانه (MB)</Label>
                        <Input
                          type="number"
                          value={settingsDraft.monthlyStorageLimitMb || ""}
                          onChange={(e) => setSettingsDraft((prev) => ({ ...prev, monthlyStorageLimitMb: e.target.value }))}
                        />
                      </FormGroup>
                      <Button color="primary" block>ذخیره تنظیمات</Button>
                    </Form>
                  )}

                  {canAdminBlocks && (
                    <>
                      <hr />
                      <div className="school-chat-block-list">
                        <div className="school-chat-panel-title">
                          <h6>کاربران بلاک‌شده</h6>
                          {blocksLoading && <Spinner size="sm" />}
                        </div>
                        {blockedUsers.length ? (
                          blockedUsers.map((item) => {
                            const blockedUserId = getBlockUserId(item);
                            const blockedName = getBlockDisplayName(item) || resolveUserNameById(blockedUserId) || `کاربر ${blockedUserId}`;
                            return (
                              <div key={`blocked-${blockedUserId}`}>
                                <span className="school-chat-avatar sm">{getUserAvatarText(blockedName)}</span>
                                <div>
                                  <strong>{blockedName}</strong>
                                  {!!item.reason && <small>{item.reason}</small>}
                                </div>
                                <Button
                                  color="success"
                                  size="sm"
                                  disabled={memberActionLoading === `unblock-${blockedUserId}`}
                                  onClick={() => handleUnblockListedUser(item)}
                                >
                                  رفع بلاک
                                </Button>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-muted mb-0">کاربر بلاک‌شده‌ای وجود ندارد.</p>
                        )}
                      </div>
                      <Form onSubmit={handleBlockUser} className="mt-3">
                        <Label>بلاک دستی کاربر</Label>
                        <Input
                          className="mb-2"
                          value={blockForm.blockedUserId}
                          onChange={(e) => setBlockForm((prev) => ({ ...prev, blockedUserId: e.target.value }))}
                          placeholder="شناسه کاربر"
                        />
                        <Input
                          className="mb-2"
                          value={blockForm.reason}
                          onChange={(e) => setBlockForm((prev) => ({ ...prev, reason: e.target.value }))}
                          placeholder="دلیل"
                        />
                        <Input
                          className="mb-2"
                          type="datetime-local"
                          value={blockForm.blockedUntil}
                          onChange={(e) => setBlockForm((prev) => ({ ...prev, blockedUntil: e.target.value }))}
                        />
                        <Button color="warning" block>بلاک</Button>
                      </Form>
                      <Form onSubmit={handleUnblockUser} className="mt-2">
                        <InputGroup>
                          <Input value={unblockUserId} onChange={(e) => setUnblockUserId(e.target.value)} placeholder="شناسه کاربر" />
                          <Button color="success">رفع بلاک</Button>
                        </InputGroup>
                      </Form>
                    </>
                  )}
                </aside>
              )}
            </div>
          </CardBody>
        </Card>
      </Container>

      <Modal isOpen={createModalOpen} toggle={() => setCreateModalOpen(false)} centered>
        <Form onSubmit={handleCreateConversation}>
          <ModalHeader toggle={() => setCreateModalOpen(false)}>گفتگوی جدید</ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label>نوع گفتگو</Label>
              <ButtonGroup className="w-100">
                {["group", "channel"].map((type) => (
                  <Button
                    type="button"
                    key={type}
                    color={newConversation.type === type ? "primary" : "light"}
                    onClick={() =>
                      setNewConversation((prev) => ({
                        ...prev,
                        type,
                      }))
                    }
                  >
                    {type === "group" ? "گروه" : "کانال"}
                  </Button>
                ))}
              </ButtonGroup>
            </FormGroup>
            <FormGroup>
              <Label>عنوان</Label>
              <Input
                value={newConversation.title}
                onChange={(e) => setNewConversation((prev) => ({ ...prev, title: e.target.value }))}
              />
            </FormGroup>
            <FormGroup>
              <Label>توضیح</Label>
              <Input
                value={newConversation.description}
                onChange={(e) => setNewConversation((prev) => ({ ...prev, description: e.target.value }))}
              />
            </FormGroup>
            <FormGroup>
              <Label>جستجوی کاربر</Label>
              <Input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  setSubmittedUserSearch(userSearch);
                }}
                placeholder="نام یا شماره"
              />
            </FormGroup>
            <FormGroup>
              <Label>اعضا</Label>
              <Input
                type="select"
                multiple
                value={newConversation.memberUserIds.map(String)}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions).map((option) => option.value);
                  setNewConversation((prev) => ({ ...prev, memberUserIds: selected }));
                }}
              >
                {userOptions
                  .filter((user) => user.__chatUserId)
                  .map((user) => (
                    <option key={`${getId(user)}-${user.__chatUserId}`} value={user.__chatUserId}>
                      {user.__displayName} - {user.__roleLabels?.join("، ") || "کاربر"} - کاربر #{user.__chatUserId}
                    </option>
                  ))}
              </Input>
              {!!newConversation.memberUserIds.length && (
                <div className="school-chat-selected-users">
                  {newConversation.memberUserIds.map((id) => (
                    <span key={`selected-${id}`}>
                      {userOptionById[String(id)]?.__displayName || `کاربر ${id}`}
                      <button
                        type="button"
                        onClick={() =>
                          setNewConversation((prev) => ({
                            ...prev,
                            memberUserIds: prev.memberUserIds.filter((item) => String(item) !== String(id)),
                          }))
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="light" type="button" onClick={() => setCreateModalOpen(false)}>انصراف</Button>
            <Button color="primary">ایجاد</Button>
          </ModalFooter>
        </Form>
      </Modal>

      <Modal isOpen={!!lightboxAttachment} toggle={() => setLightboxAttachment(null)} centered size="lg">
        <ModalHeader toggle={() => setLightboxAttachment(null)}>{lightboxAttachment?.name || "تصویر"}</ModalHeader>
        <ModalBody className="text-center">
          {lightboxAttachment?.url && (
            <img src={lightboxAttachment.url} alt={lightboxAttachment.name || "attachment"} className="school-chat-lightbox-image" />
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => handleDownloadAttachment(lightboxAttachment)}>
            دانلود
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={confirmModal.open} toggle={() => closeConfirmModal(false)} centered>
        <ModalHeader toggle={() => closeConfirmModal(false)}>{confirmModal.title}</ModalHeader>
        <ModalBody>
          <p className="mb-0 school-chat-confirm-message">{confirmModal.message}</p>
        </ModalBody>
        <ModalFooter>
          <Button color="light" type="button" onClick={() => closeConfirmModal(false)}>
            {confirmModal.cancelText}
          </Button>
          <Button color={confirmModal.color} type="button" onClick={() => closeConfirmModal(true)}>
            {confirmModal.confirmText}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={personalBlockModal.open} toggle={() => setPersonalBlockModal((prev) => ({ ...prev, open: false }))} centered>
        <Form onSubmit={handlePersonalBlockSubmit}>
          <ModalHeader toggle={() => setPersonalBlockModal((prev) => ({ ...prev, open: false }))}>
            بلاک کاربر در گفتگوی خصوصی
          </ModalHeader>
          <ModalBody>
            <Alert color="warning" className="py-2">
              {getMemberDisplayName(activeDirectMember || {}) || resolveUserNameById(activeDirectPeerUserId) || "این کاربر"} فقط در این گفتگوی مستقیم بلاک می‌شود.
            </Alert>
            <FormGroup>
              <Label>مدت زمان</Label>
              <Input
                type="select"
                value={personalBlockModal.duration}
                onChange={(e) => setPersonalBlockModal((prev) => ({ ...prev, duration: e.target.value }))}
              >
                <option value="forever">دائمی</option>
                <option value="hour">۱ ساعت</option>
                <option value="today">امروز</option>
                <option value="week">۷ روز</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label>دلیل</Label>
              <Input
                value={personalBlockModal.reason}
                onChange={(e) => setPersonalBlockModal((prev) => ({ ...prev, reason: e.target.value }))}
                placeholder="اختیاری"
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="light" type="button" onClick={() => setPersonalBlockModal((prev) => ({ ...prev, open: false }))}>
              انصراف
            </Button>
            <Button color="warning" disabled={memberActionLoading === "personal-block"}>
              بلاک
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      <Modal isOpen={blockModal.open} toggle={() => setBlockModal((prev) => ({ ...prev, open: false }))} centered>
        <Form onSubmit={handleBlockModalSubmit}>
          <ModalHeader toggle={() => setBlockModal((prev) => ({ ...prev, open: false }))}>بلاک کاربر</ModalHeader>
          <ModalBody>
            <Alert color="warning" className="py-2">
              {blockModal.name || `کاربر ${blockModal.userId}`} در چت این مجموعه بلاک می‌شود.
            </Alert>
            <FormGroup>
              <Label>مدت زمان</Label>
              <Input
                type="select"
                value={blockModal.duration}
                onChange={(e) => setBlockModal((prev) => ({ ...prev, duration: e.target.value }))}
              >
                <option value="hour">۱ ساعت</option>
                <option value="today">تا پایان امروز</option>
                <option value="week">۷ روز</option>
                <option value="forever">دائمی</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label>دلیل</Label>
              <Input
                value={blockModal.reason}
                onChange={(e) => setBlockModal((prev) => ({ ...prev, reason: e.target.value }))}
                placeholder="اختیاری"
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="light" type="button" onClick={() => setBlockModal((prev) => ({ ...prev, open: false }))}>
              انصراف
            </Button>
            <Button color="warning">بلاک</Button>
          </ModalFooter>
        </Form>
      </Modal>

      <Modal isOpen={!!editingMessage} toggle={() => setEditingMessage(null)} centered>
        <Form onSubmit={handleEditMessage}>
          <ModalHeader toggle={() => setEditingMessage(null)}>ویرایش پیام</ModalHeader>
          <ModalBody>
            <Input type="textarea" rows="4" value={editBody} onChange={(e) => setEditBody(e.target.value)} />
          </ModalBody>
          <ModalFooter>
            <Button color="light" type="button" onClick={() => setEditingMessage(null)}>انصراف</Button>
            <Button color="primary">ذخیره</Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default Chat;
