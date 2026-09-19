"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { CALENDAR_LINK, WHATSAPP_NUMBER } from "@/tenants/fullstack/lib/business-context";
import { getBrowserSessionId } from "@/tenants/fullstack/lib/browser-session";

const BOOKING_EVENT = "fullstack-guys-booking-request";
const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}`;

type BookingResponse = {
  calendarLink?: string;
  whatsappLink?: string;
  error?: string;
};

type FormValues = {
  name: string;
  email: string;
  phone: string;
};

const initialValues: FormValues = {
  name: "",
  email: "",
  phone: "",
};

export function openBookingCapture() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(BOOKING_EVENT));
}

function validate(values: FormValues) {
  if (values.name.trim().length < 2) return "Add your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) return "Add a valid email.";
  if (values.phone.replace(/\D/g, "").length < 7) return "Add a valid phone or WhatsApp number.";
  return "";
}

export function BookingCapture() {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const show = () => {
      setOpen(true);
      setError("");
      window.setTimeout(() => nameRef.current?.focus(), 40);
    };
    window.addEventListener(BOOKING_EVENT, show);
    return () => window.removeEventListener(BOOKING_EVENT, show);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const nextError = validate(values);
    if (nextError) {
      setError(nextError);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/booking-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          page: window.location.pathname,
          sessionId: getBrowserSessionId(),
        }),
      });
      const data = (await response.json()) as BookingResponse;
      if (!response.ok) {
        setError(data.error || "Please add your details before booking.");
        return;
      }
      window.location.href = data.calendarLink || CALENDAR_LINK;
    } catch {
      setError("Connection dipped. Try again before booking.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="booking-capture" role="dialog" aria-modal="true" aria-label="Book a discovery call">
      <button className="booking-capture__scrim" aria-label="Close booking form" onClick={() => setOpen(false)} />
      <form className="booking-capture__card" onSubmit={submit}>
        <button className="booking-capture__close" type="button" aria-label="Close" onClick={() => setOpen(false)}>
          <X size={18} />
        </button>
        <span>BOOK A CALL</span>
        <h2>Tell Nishit who is booking.</h2>
        <p>
          Add your details first. After the inquiry is saved, you can choose a discovery-call slot directly with Nishit.
        </p>
        <label>
          Name
          <input
            ref={nameRef}
            name="name"
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            autoComplete="name"
            required
          />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            value={values.email}
            onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
            autoComplete="email"
            required
          />
        </label>
        <label>
          Phone / WhatsApp
          <input
            name="phone"
            value={values.phone}
            onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))}
            autoComplete="tel"
            required
          />
        </label>
        {error ? <p className="booking-capture__error">{error}</p> : null}
        <button className="accent-button" type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save details & book"} <ArrowUpRight size={16} />
        </button>
        <a className="booking-capture__whatsapp" href={whatsappLink} target="_blank" rel="noreferrer">
          Fast-track on WhatsApp <ArrowUpRight size={14} />
        </a>
      </form>
    </div>
  );
}
