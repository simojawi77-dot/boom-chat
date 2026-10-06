"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { AppNav } from "../sharedUi";
import {
  fetchConversation,
  searchUsers,
  sendMessage,
  type DirectoryUser,
  type Message,
} from "@/lib/api";
import { connectChatSocket } from "@/lib/socket";
import styles from "../home.module.css";

export default function MessagesPage() {
  const [people, setPeople] = useState<DirectoryUser[]>([]);
  const [active, setActive] = useState<DirectoryUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [text, setText] = useState("");
  const socketRef = useRef<ReturnType<typeof connectChatSocket> | null>(null);

  useEffect(() => {
    searchUsers()
      .then((response) => setPeople(response.items))
      .catch((error) => toast.error(error.message));
  }, []);

  useEffect(() => {
    if (!active) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = connectChatSocket((message: Message) => {
      setMessages((current) => {
        if (current.some((entry) => entry.id === message.id)) {
          return current;
        }

        const isForActiveConversation =
          message.senderId === active.id || message.receiverId === active.id;

        if (!isForActiveConversation) {
          return current;
        }

        return [...current, message];
      });
    });

    socketRef.current?.disconnect();
    socketRef.current = socket;

    return () => {
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [active]);

  useEffect(() => {
    if (!active) {
      const frame = window.requestAnimationFrame(() => {
        setMessages([]);
        setNextCursor(null);
        setHasMore(false);
      });

      return () => window.cancelAnimationFrame(frame);
    }

    fetchConversation(active.id, { limit: 50 })
      .then((result) => {
        setMessages(result.items);
        setNextCursor(result.nextCursor);
        setHasMore(result.hasMore);
      })
      .catch((error) => toast.error(error.message));
  }, [active]);

  async function send(event: FormEvent) {
    event.preventDefault();

    if (!active || !text.trim()) {
      return;
    }

    try {
      const message = await sendMessage({
        receiverId: active.id,
        content: text,
      });

      setMessages((current) => [...current, message]);
      setText("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Message failed");
    }
  }

  return (
    <main className={styles.page}>
      <AppNav />
      <section className={styles.routePage}>
        <p className={styles.sectionLabel}>Inbox</p>
        <h1>Messages</h1>
        <div className={styles.messageShell}>
          <aside>
            {people.map((person) => (
              <button
                key={person.id}
                onClick={() => setActive(person)}
                className={active?.id === person.id ? styles.selectedPerson : ""}
              >
                <strong>{person.displayName || person.username}</strong>
                <small>{person.city || "Member"}</small>
              </button>
            ))}
          </aside>

          <div
            className={styles.routeCard}
            data-next-cursor={nextCursor ?? ""}
            data-has-more={hasMore}
          >
            {active ? (
              <>
                <h2>{active.displayName || active.username}</h2>
                <div className={styles.messageList}>
                  {messages.map((message) => (
                    <p key={message.id}>{message.content}</p>
                  ))}
                </div>
                <form className={styles.messageForm} onSubmit={send}>
                  <input
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Write a message…"
                  />
                  <button className={styles.primaryButton}>
                    <Send size={17} />
                    Send
                  </button>
                </form>
              </>
            ) : (
              <p>Choose a person to open a conversation.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
