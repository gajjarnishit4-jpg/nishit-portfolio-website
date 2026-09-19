"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import {
  CALENDAR_LINK,
  DISCOUNT_CODE,
  WHATSAPP_NUMBER,
} from "@/app/lib/open-limits-brain";

type DiscountResponse = {
  code?: string;
  error?: string;
};

type FieldName = "name" | "email" | "phone" | "niche";

type FormValues = Record<FieldName, string>;
type FormErrors = Partial<Record<FieldName, string>>;

const DISCOUNT_STORAGE_KEY = "open-limits-discount-dismissed";
const fieldOrder: FieldName[] = ["name", "email", "phone", "niche"];

const initialValues: FormValues = {
  name: "",
  email: "",
  phone: "",
  niche: "",
};

function isLocalTestHost() {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function shouldRememberPopupChoice() {
  return typeof window !== "undefined" && !isLocalTestHost();
}

function validateField(name: FieldName, value: string) {
  const trimmed = value.trim();
  if (!trimmed)
    return `${name === "niche" ? "Niche" : name[0].toUpperCase() + name.slice(1)} is required.`;
  if (name === "name" && trimmed.length < 2)
    return "Add at least 2 characters.";
  if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
    return "Add a valid email.";
  if (name === "phone" && trimmed.replace(/\D/g, "").length < 7)
    return "Add a valid phone or WhatsApp number.";
  if (name === "niche" && trimmed.length < 2)
    return "Tell us your project niche.";
  return "";
}

function validateAll(values: FormValues) {
  return fieldOrder.reduce<FormErrors>((errors, field) => {
    const error = validateField(field, values[field]);
    if (error) errors[field] = error;
    return errors;
  }, {});
}

export function DiscountPopup({
  open: controlledOpen,
  onOpenChange,
}: { open?: boolean; onOpenChange?: (open: boolean) => void } = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [showForm, setShowForm] = useState(false);
  const [claimedCode, setClaimedCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState<FormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const inputRefs = useRef<Partial<Record<FieldName, HTMLInputElement | null>>>(
    {},
  );
  const submitRef = useRef<HTMLButtonElement | null>(null);
  const advanceTimer = useRef<number | null>(null);

  useEffect(() => {
    if (controlledOpen !== undefined) return;
    if (
      shouldRememberPopupChoice() &&
      window.localStorage.getItem(DISCOUNT_STORAGE_KEY)
    )
      return;
    const timer = window.setTimeout(() => setInternalOpen(true), 5600);
    return () => window.clearTimeout(timer);
  }, [controlledOpen]);

  function rememberPopupChoice() {
    if (!shouldRememberPopupChoice()) return;
    window.localStorage.setItem(DISCOUNT_STORAGE_KEY, "1");
  }

  function closePopup() {
    rememberPopupChoice();
    setOpen(false);
  }

  function focusAndScroll(target: FieldName | "submit", shouldFocus = true) {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => {
      const node =
        target === "submit" ? submitRef.current : inputRefs.current[target];
      node?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (shouldFocus) node?.focus();
    }, 180);
  }

  function revealForm() {
    setShowForm(true);
    focusAndScroll("name");
  }

  function handleFieldChange(event: ChangeEvent<HTMLInputElement>) {
    const field = event.currentTarget.name as FieldName;
    const value = event.currentTarget.value;
    const nextIndex = fieldOrder.indexOf(field) + 1;
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      const next = { ...current };
      const fieldError = validateField(field, value);
      if (fieldError) next[field] = fieldError;
      else delete next[field];
      return next;
    });

    if (!validateField(field, value)) {
      focusAndScroll(fieldOrder[nextIndex] || "submit", false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const errors = validateAll(values);
    setFieldErrors(errors);
    const firstInvalid = fieldOrder.find((field) => errors[field]);
    if (firstInvalid) {
      focusAndScroll(firstInvalid);
      setError("Finish the highlighted fields to unlock the code.");
      return;
    }

    setIsSubmitting(true);

    try {
      const eventId = crypto.randomUUID();
      const response = await fetch("/api/discount-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          niche: values.niche.trim(),
          page: window.location.pathname,
          eventId,
          fbp: document.cookie.match(/(?:^|;\s*)_fbp=([^;]+)/)?.[1],
          fbc: document.cookie.match(/(?:^|;\s*)_fbc=([^;]+)/)?.[1],
        }),
      });
      const data = (await response.json()) as DiscountResponse;
      if (!response.ok) {
        setError(data.error || "Add email and phone to unlock the code.");
        return;
      }
      setClaimedCode(data.code || DISCOUNT_CODE);
      rememberPopupChoice();
    } catch {
      setError("Connection dipped. Try once more or WhatsApp us directly.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="discount-pop"
      role="dialog"
      aria-modal="true"
      aria-label="30% off digital project"
    >
      <button
        className="discount-pop__scrim"
        onClick={closePopup}
        aria-label="Close discount popup"
      />
      <div
        className={
          showForm || claimedCode
            ? "discount-pop__card discount-pop__card--flipped"
            : "discount-pop__card"
        }
      >
        <div className="discount-pop__flipper">
          <section className="discount-pop__face discount-pop__face--front">
            <div className="discount-pop__burst" aria-hidden="true">
              <span>30%</span>
              <b>OFF</b>
            </div>
            <div className="discount-pop__tease">
              <p className="discount-pop__kicker">New digital projects</p>
              <h2>Get 30% off.</h2>
              <p>
                Unlock the code for a premium web, software, app or commerce
                sprint.
              </p>
              <button type="button" onClick={revealForm}>
                Unlock 30% <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>

          <section className="discount-pop__face discount-pop__face--back">
            <div className="discount-pop__content">
              <p className="discount-pop__kicker">Claim your code</p>
              <h2>Fill info.</h2>
              <p>Drop your details and we will reveal the code instantly.</p>

              {claimedCode ? (
                <div className="discount-pop__success">
                  <span>Your code</span>
                  <strong>{claimedCode}</strong>
                  <a href={CALENDAR_LINK} target="_blank" rel="noreferrer">
                    Book your call →
                  </a>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Fast-track WhatsApp →
                  </a>
                </div>
              ) : (
                <form className="discount-pop__form" onSubmit={handleSubmit}>
                  {fieldOrder.map((field) => (
                    <label className="discount-pop__field" key={field}>
                      <input
                        aria-label={
                          field === "niche"
                            ? "Project niche"
                            : field === "phone"
                              ? "Phone or WhatsApp"
                              : field === "email"
                                ? "Email"
                                : "Name"
                        }
                        aria-describedby={`${field}-discount-error`}
                        aria-invalid={Boolean(fieldErrors[field])}
                        autoComplete={
                          field === "name"
                            ? "name"
                            : field === "email"
                              ? "email"
                              : field === "phone"
                                ? "tel"
                                : "organization-title"
                        }
                        inputMode={
                          field === "phone"
                            ? "tel"
                            : field === "email"
                              ? "email"
                              : "text"
                        }
                        name={field}
                        onChange={handleFieldChange}
                        placeholder={
                          field === "name"
                            ? "Name"
                            : field === "email"
                              ? "Email"
                              : field === "phone"
                                ? "Phone / WhatsApp"
                                : "Niche, e.g. skincare"
                        }
                        ref={(node) => {
                          inputRefs.current[field] = node;
                        }}
                        required
                        type={
                          field === "email"
                            ? "email"
                            : field === "phone"
                              ? "tel"
                              : "text"
                        }
                        value={values[field]}
                      />
                      {fieldErrors[field] ? (
                        <span
                          className="discount-pop__field-error"
                          id={`${field}-discount-error`}
                        >
                          {fieldErrors[field]}
                        </span>
                      ) : null}
                    </label>
                  ))}
                  {error ? (
                    <div className="discount-pop__error">{error}</div>
                  ) : null}
                  <button ref={submitRef} type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Unlocking..." : "Reveal my code"}
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
      <button
        className="discount-pop__close discount-pop__close--floating"
        onClick={closePopup}
        aria-label="Close discount popup"
      >
        ×
      </button>
    </div>
  );
}
