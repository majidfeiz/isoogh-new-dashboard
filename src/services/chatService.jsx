import { apiDelete, apiGet, apiPatch, apiPost } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

const unwrapData = (payload) => payload?.data?.data || payload?.data || payload || {};

const normalizePagination = (meta = {}, fallback = {}) => ({
  page: meta.page ?? fallback.page ?? 1,
  limit: meta.limit ?? fallback.limit ?? 20,
  total: meta.total ?? fallback.total ?? 0,
  lastPage:
    meta.lastPage ??
    (meta.total && (meta.limit || fallback.limit)
      ? Math.ceil((meta.total || 0) / (meta.limit || fallback.limit || 20))
      : 1),
});

export async function getChatConversations({ page = 1, limit = 20, search = "" } = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.chat.conversations), {
    params: {
      page,
      limit,
      search: search || undefined,
    },
  });
  const data = unwrapData(res);
  const items = data.items || data.data || [];
  const meta = data.meta || data.pagination || {};
  return { items, pagination: normalizePagination(meta, { page, limit, total: items.length }) };
}

export async function createChatConversation(payload) {
  const res = await apiPost(getApiUrl(API_ROUTES.chat.conversations), payload);
  return unwrapData(res);
}

export async function deleteChatConversation(conversationId) {
  const res = await apiDelete(getApiUrl(API_ROUTES.chat.conversation(conversationId)));
  return unwrapData(res);
}

export async function uploadChatFile({ schoolId, conversationId, file, onUploadProgress } = {}) {
  const formData = new FormData();
  formData.append("schoolId", schoolId);
  formData.append("conversationId", conversationId);
  formData.append("file", file);

  const res = await apiPost(getApiUrl(API_ROUTES.chat.fileUpload), formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
  return unwrapData(res);
}

export async function getChatSchoolUsers({ schoolId, search = "", limit = 20 } = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.chat.schoolUsers(schoolId)), {
    params: {
      search: search || undefined,
      limit,
    },
  });
  const data = unwrapData(res);
  return data.items || data.data || [];
}

export async function getChatMessages({
  conversationId,
  page = 1,
  limit = 20,
  search = "",
} = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.chat.conversationMessages(conversationId)), {
    params: {
      page,
      limit,
      search: search || undefined,
    },
  });
  const data = unwrapData(res);
  const items = data.items || data.data || [];
  const meta = data.meta || data.pagination || {};
  return { items, pagination: normalizePagination(meta, { page, limit, total: items.length }) };
}

export async function getChatConversationPresence(conversationId, config = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.chat.conversationPresence(conversationId)), config);
  const data = unwrapData(res);
  return data.items || data.data || [];
}

export async function getChatConversationMembers(conversationId, config = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.chat.conversationMembers(conversationId)), config);
  const data = unwrapData(res);
  return data.items || data.data || [];
}

export async function addChatConversationMembers(conversationId, userIds = []) {
  const res = await apiPost(getApiUrl(API_ROUTES.chat.conversationMembers(conversationId)), {
    userIds: userIds.map(Number).filter(Boolean),
  });
  return unwrapData(res);
}

export async function updateChatConversationMember(conversationId, userId, payload) {
  const res = await apiPatch(
    getApiUrl(API_ROUTES.chat.conversationMember(conversationId, userId)),
    payload
  );
  return unwrapData(res);
}

export async function deleteChatConversationMember(conversationId, userId) {
  const res = await apiDelete(getApiUrl(API_ROUTES.chat.conversationMember(conversationId, userId)));
  return unwrapData(res);
}

export async function updateChatConversationSettings(conversationId, payload) {
  const res = await apiPatch(getApiUrl(API_ROUTES.chat.conversationSettings(conversationId)), payload);
  return unwrapData(res);
}

export async function getChatConversationBlocks(conversationId, config = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.chat.conversationBlocks(conversationId)), config);
  const data = unwrapData(res);
  return data.items || data.data || [];
}

export async function getChatConversationBlockStatus(conversationId, config = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.chat.conversationBlockStatus(conversationId)), config);
  return unwrapData(res);
}

export async function blockChatConversationUser(conversationId, payload) {
  const res = await apiPost(getApiUrl(API_ROUTES.chat.conversationBlocks(conversationId)), payload);
  return unwrapData(res);
}

export async function unblockChatConversationUser(conversationId, blockedUserId) {
  const res = await apiDelete(getApiUrl(API_ROUTES.chat.conversationBlock(conversationId, blockedUserId)));
  return unwrapData(res);
}

export async function sendChatMessage(conversationId, payload) {
  const res = await apiPost(getApiUrl(API_ROUTES.chat.conversationMessages(conversationId)), payload);
  return unwrapData(res);
}

export async function updateChatMessage(messageId, payload) {
  const res = await apiPatch(getApiUrl(API_ROUTES.chat.message(messageId)), payload);
  return unwrapData(res);
}

export async function deleteChatMessage(messageId) {
  const res = await apiDelete(getApiUrl(API_ROUTES.chat.message(messageId)));
  return unwrapData(res);
}

export async function deleteChatConversationUserMessages(conversationId, userId) {
  const res = await apiDelete(getApiUrl(API_ROUTES.chat.conversationUserMessages(conversationId, userId)));
  return unwrapData(res);
}

export async function reactToChatMessage(messageId, emoji) {
  const res = await apiPost(getApiUrl(API_ROUTES.chat.messageReactions(messageId)), { emoji });
  return unwrapData(res);
}

export async function markChatConversationRead(conversationId, messageId) {
  const res = await apiPost(getApiUrl(API_ROUTES.chat.conversationRead(conversationId)), {
    messageId,
  });
  return unwrapData(res);
}

export async function getChatSchoolSettings(schoolId, config = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.chat.schoolSettings(schoolId)), config);
  return unwrapData(res);
}

export async function updateChatSchoolSettings(schoolId, payload) {
  const res = await apiPatch(getApiUrl(API_ROUTES.chat.schoolSettings(schoolId)), payload);
  return unwrapData(res);
}

export async function getChatSchoolStatistics(schoolId, config = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.chat.schoolStatistics(schoolId)), config);
  return unwrapData(res);
}

export async function getChatSchoolBlocks(schoolId, config = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.chat.schoolBlocks(schoolId)), config);
  const data = unwrapData(res);
  return data.items || data.data || [];
}

export async function blockChatUser(schoolId, payload) {
  const res = await apiPost(getApiUrl(API_ROUTES.chat.schoolBlocks(schoolId)), payload);
  return unwrapData(res);
}

export async function unblockChatUser(schoolId, blockedUserId) {
  const res = await apiDelete(getApiUrl(API_ROUTES.chat.schoolBlock(schoolId, blockedUserId)));
  return unwrapData(res);
}
