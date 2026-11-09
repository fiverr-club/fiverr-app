import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  PlusCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import {
  fiverrApi,
  SEED_CONVERSATIONS,
  type Conversation,
  type PackageTierName,
} from "@/lib/api";
import { desktopClient } from "@/lib/desktop";

export function InboxView() {
  const [conversations, setConversations] =
    useState<Conversation[]>(SEED_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>(
    SEED_CONVERSATIONS[0].id
  );
  const [messageInput, setMessageInput] = useState<string>("");
  const [offerModalOpen, setOfferModalOpen] = useState<boolean>(false);
  const [sendingMsg, setSendingMsg] = useState<boolean>(false);
  const [inboxToast, setInboxToast] = useState<string | null>(null);

  const [offerTitle, setOfferTitle] = useState<string>(
    "Custom DDD Microservice + Kubernetes Helm Package"
  );
  const [offerTier, setOfferTier] = useState<PackageTierName>("Standard");
  const [offerPrice, setOfferPrice] = useState<number>(450);
  const [offerDays, setOfferDays] = useState<number>(5);
  const [offerRevisions, setOfferRevisions] = useState<number>(4);

  useEffect(() => {
    async function loadInbox() {
      const liveConvs = await fiverrApi.getConversations();
      if (liveConvs && liveConvs.length > 0) {
        setConversations(liveConvs);
        setActiveConvId((prev) =>
          liveConvs.some((c) => c.id === prev) ? prev : liveConvs[0].id
        );
      }
    }
    loadInbox();
  }, []);

  const activeConv =
    conversations.find((c) => c.id === activeConvId) || conversations[0];

  async function handleSelectConversation(convId: string) {
    setActiveConvId(convId);
    const msgs = await fiverrApi.getConversationMessages(convId);
    if (msgs && msgs.length > 0) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId ? { ...c, messages: msgs, unreadCount: 0 } : c
        )
      );
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!messageInput.trim() || sendingMsg) return;
    setSendingMsg(true);
    const text = messageInput.trim();
    setMessageInput("");

    const savedMsg = await fiverrApi.sendMessage({
      conversationId: activeConv.id,
      senderId: activeConv.buyerId,
      recipientId: activeConv.sellerId,
      gigId: activeConv.gigId,
      content: text,
      messageType: "TEXT",
    });

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== activeConv.id) return conv;
        return {
          ...conv,
          lastMessage: text,
          lastMessageTime: "Just now",
          unreadCount: 0,
          messages: [...conv.messages, savedMsg],
        };
      })
    );
    setSendingMsg(false);
  }

  async function handleSendCustomOffer(e: React.FormEvent) {
    e.preventDefault();
    setSendingMsg(true);
    const offerContent = `Custom Offer: ${offerTitle} ($${offerPrice} - ${offerDays} days delivery)`;
    const savedOfferMsg = await fiverrApi.sendMessage({
      conversationId: activeConv.id,
      senderId:
        activeConv.sellerId || "22222222-2222-2222-2222-222222222222",
      recipientId:
        activeConv.buyerId || "11111111-1111-1111-1111-111111111111",
      gigId: activeConv.gigId || "33333333-3333-3333-3333-333333333333",
      content: offerContent,
      messageType: "CUSTOM_OFFER",
      customOffer: {
        title: offerTitle,
        packageTier: offerTier,
        price: offerPrice,
        deliveryDays: offerDays,
        revisions: offerRevisions,
      },
    });

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== activeConv.id) return conv;
        return {
          ...conv,
          lastMessage: `Custom Offer: ${offerTitle} ($${offerPrice})`,
          lastMessageTime: "Just now",
          messages: [
            ...conv.messages,
            {
              ...savedOfferMsg,
              sender: "seller",
              senderName: conv.participantName,
            },
          ],
        };
      })
    );
    setSendingMsg(false);
    setOfferModalOpen(false);
    await desktopClient.notify(
      "Custom Offer Dispatched",
      `${offerTitle} ($${offerPrice}) sent to ${activeConv.participantName}.`
    );
    setInboxToast("Custom offer dispatched via POST /api/v1/messages!");
  }

  async function handleAcceptOffer(msgId: string) {
    const targetMsg = activeConv.messages.find((m) => m.id === msgId);
    const offer = targetMsg?.customOffer;
    if (offer) {
      const createdOrder = await fiverrApi.createOrder({
        gigId:
          offer.gigId ||
          activeConv.gigId ||
          "33333333-3333-3333-3333-333333333333",
        packageTier: offer.packageTier || "Standard",
        requirements: `Accepted Custom Offer: ${offer.title}`,
        amount: offer.price,
        sellerId: activeConv.sellerId,
      });
      await fiverrApi.holdEscrow({
        orderId: createdOrder.id,
        sellerId: activeConv.sellerId,
        grossAmount: offer.price,
      });
      await desktopClient.notify(
        `Custom Offer Funded • ${createdOrder.orderNumber}`,
        `$${offer.price} locked in Escrow via fiverr-payment-service.`
      );
      setInboxToast(
        `Custom Offer accepted! Order ${createdOrder.orderNumber} created & $${offer.price} locked in Escrow.`
      );
      window.dispatchEvent(new CustomEvent("fiverrex-session-change"));
    }

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== activeConv.id) return conv;
        return {
          ...conv,
          messages: conv.messages.map((m) => {
            if (m.id !== msgId || !m.customOffer) return m;
            return {
              ...m,
              customOffer: {
                ...m.customOffer,
                status: "ACCEPTED",
              },
            };
          }),
        };
      })
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#1dbf73]">
            <Sparkles className="h-3.5 w-3.5" />
            Real-Time Messaging (`fiverr-messaging-service`)
          </span>
          <h1 className="mt-1.5 text-2xl font-extrabold text-gray-900">
            Buyer &amp; Seller Inbox
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setOfferModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0a4226] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-900"
        >
          <PlusCircle className="h-4 w-4 text-[#1dbf73]" />
          <span>Send Custom Offer</span>
        </button>
      </div>

      {inboxToast && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-950">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#1dbf73]" />
            <span>{inboxToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setInboxToast(null)}
            className="text-emerald-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid min-h-[600px] grid-cols-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid-cols-12">
        {/* Left Conversation Sidebar */}
        <div className="border-b border-gray-200 bg-gray-50/50 lg:col-span-4 lg:border-b-0 lg:border-r">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              All Conversations ({conversations.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {conversations.map((conv) => {
              const isSelected = conv.id === activeConv.id;
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`flex w-full items-start gap-3 p-4 text-left transition ${
                    isSelected ? "bg-emerald-50/70" : "hover:bg-gray-100/70"
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={conv.participantAvatar}
                      alt={conv.participantName}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#1dbf73]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-xs font-extrabold text-gray-900">
                        {conv.participantName}
                      </p>
                      <span className="text-[10px] font-semibold text-gray-400">
                        {conv.lastMessageTime}
                      </span>
                    </div>
                    <p className="truncate text-[11px] font-medium text-[#1dbf73]">
                      {conv.relatedGigTitle}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-gray-600">
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Chat Thread */}
        <div className="flex flex-col justify-between lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <img
                src={activeConv.participantAvatar}
                alt={activeConv.participantName}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900">
                    {activeConv.participantName}
                  </h3>
                  {activeConv.participantLevel && (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      {activeConv.participantLevel}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  @{activeConv.participantUsername} • Regarding:{" "}
                  {activeConv.relatedGigTitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="h-4 w-4 text-[#1dbf73]" />
              <span>Escrow Protected Thread</span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {activeConv.messages.map((msg) => {
              const isBuyer = msg.sender === "buyer";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isBuyer ? "items-end" : "items-start"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2 text-[11px] text-gray-400">
                    <span className="font-bold text-gray-700">
                      {msg.senderName}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-xl rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      isBuyer
                        ? "bg-[#1dbf73] text-white"
                        : "border border-gray-200 bg-gray-50 text-gray-800"
                    }`}
                  >
                    <p>{msg.text}</p>

                    {msg.customOffer && (
                      <div className="mt-3 rounded-xl border border-emerald-200 bg-white p-4 text-gray-800 shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                          <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-[#1dbf73]">
                            Custom Offer • {msg.customOffer.packageTier}
                          </span>
                          <span className="text-base font-extrabold text-gray-900">
                            ${msg.customOffer.price}
                          </span>
                        </div>
                        <p className="mt-2 text-xs font-bold text-gray-900">
                          {msg.customOffer.title}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-[11px] text-gray-600">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-[#1dbf73]" />
                            {msg.customOffer.deliveryDays} Days Delivery
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <RefreshCw className="h-3.5 w-3.5 text-[#1dbf73]" />
                            {msg.customOffer.revisions} Revisions
                          </span>
                        </div>

                        <div className="mt-3 pt-2">
                          {msg.customOffer.status === "ACCEPTED" ? (
                            <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#1dbf73]">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Offer Accepted &amp; Funded in Escrow</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAcceptOffer(msg.id)}
                              className="w-full rounded-lg bg-[#1dbf73] py-2 text-xs font-bold text-white transition hover:bg-[#19a463]"
                            >
                              Accept &amp; Fund Escrow ($
                              {msg.customOffer.price})
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-3 border-t border-gray-200 bg-gray-50 p-4"
          >
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={`Message ${activeConv.participantName}...`}
              className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs focus:border-[#1dbf73] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setOfferModalOpen(true)}
              className="hidden rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 sm:inline-flex"
            >
              + Custom Offer
            </button>
            <button
              type="submit"
              disabled={sendingMsg}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1dbf73] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#19a463] disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{sendingMsg ? "Sending..." : "Send"}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Send Custom Offer Modal */}
      {offerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#0a4226] px-6 py-4 text-white">
              <h3 className="text-sm font-bold">Create Custom Escrow Offer</h3>
              <button
                type="button"
                onClick={() => setOfferModalOpen(false)}
                className="rounded-lg p-1 text-white/80 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSendCustomOffer} className="space-y-4 p-6">
              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Deliverable Scope Title
                </label>
                <input
                  type="text"
                  required
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Tier
                  </label>
                  <select
                    value={offerTier}
                    onChange={(e) =>
                      setOfferTier(e.target.value as PackageTierName)
                    }
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-2.5 py-2 text-xs font-semibold"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Days
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={offerDays}
                    onChange={(e) => setOfferDays(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Revisions Included
                </label>
                <input
                  type="number"
                  min={0}
                  value={offerRevisions}
                  onChange={(e) => setOfferRevisions(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={sendingMsg}
                className="w-full rounded-xl bg-[#1dbf73] py-3 text-xs font-bold text-white transition hover:bg-[#19a463] disabled:opacity-50"
              >
                {sendingMsg
                  ? "Dispatching Offer..."
                  : "Send Custom Offer to Thread"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

