"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setErrMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setErrMsg(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      setStatus("error");
      setErrMsg(
        "Network error. Please email JKH.Build@gmail.com directly."
      );
    }
  };

  if (status === "success") {
    return (
      <div className="jh-form jh-form--success" role="status" aria-live="polite">
        <div className="jh-form__success-h">Message sent.</div>
        <p className="jh-form__success-p">
          Thanks — I&apos;ll be in touch shortly.
        </p>
        <button
          type="button"
          className="jh-form__reset"
          onClick={() => setStatus("idle")}
        >
          Send another →
        </button>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form className="jh-form" onSubmit={onSubmit} noValidate>
      <div className="jh-form__row">
        <label className="jh-form__field">
          <span className="jh-form__label">Name</span>
          <input
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
          />
        </label>
        <label className="jh-form__field">
          <span className="jh-form__label">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
          />
        </label>
      </div>
      <label className="jh-form__field">
        <span className="jh-form__label">Subject (optional)</span>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={submitting}
          placeholder="e.g. estimating engagement, change order review"
        />
      </label>
      <label className="jh-form__field">
        <span className="jh-form__label">Message</span>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={submitting}
        />
      </label>
      {status === "error" && (
        <div className="jh-form__error" role="alert">
          {errMsg}
        </div>
      )}
      <div className="jh-form__actions">
        <button
          type="submit"
          className="jh-form__submit"
          disabled={submitting}
        >
          {submitting ? "Sending…" : "Send message →"}
        </button>
      </div>
    </form>
  );
}
