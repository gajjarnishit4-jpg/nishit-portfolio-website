"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import {
  CALENDAR_LINK,
  DISCOUNT_CODE,
} from "@/tenants/fullstack/lib/business-context";
import { getBrowserSessionId } from "@/tenants/fullstack/lib/browser-session";
import { createOpenAIAdsEventId, hasOpenAIAdsConsent, measureOpenAIAds } from "@/tenants/fullstack/lib/openai-ads";

type DiscountResponse = {
  code?: string;
  error?: string;
};

type FieldName = "name" | "email" | "phone" | "niche";

type FormValues = Record<FieldName, string>;
type FormErrors = Partial<Record<FieldName, string>>;

const fieldOrder: FieldName[] = ["name", "email", "phone", "niche"];

const initialValues: FormValues = {
  name: "",
  email: "",
  phone: "",
  niche: "",
};

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
    return "Tell Nishit your project niche.";
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
  open,
  onOpenChange,
}: { open: boolean; onOpenChange: (open: boolean) => void }) {
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

  function closePopup() {
    onOpenChange(false);
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
      const adsConsent = hasOpenAIAdsConsent();
      const eventId = adsConsent ? createOpenAIAdsEventId() : undefined;
      const response = await fetch("/api/discount-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          niche: values.niche.trim(),
          page: window.location.pathname,
          sessionId: getBrowserSessionId(),
          eventId,
          adsConsent,
        }),
      });
      const data = (await response.json()) as DiscountResponse;
      if (!response.ok) {
        setError(data.error || "Add email and phone to unlock the code.");
        return;
      }
      setClaimedCode(data.code || DISCOUNT_CODE);
      if (eventId) measureOpenAIAds("lead_created", { type: "customer_action" }, eventId);
    } catch {
      setError("Connection dipped. Try once more or contact Nishit directly.");
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
              <p>Drop your details to reveal the code instantly.</p>

              {claimedCode ? (
                <div className="discount-pop__success">
                  <span>Your code</span>
                  <strong>{claimedCode}</strong>
                  <a href={CALENDAR_LINK} target="_blank" rel="noreferrer">
                    Book your call →
                  </a>
                  <a
                    href={CALENDAR_LINK}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Contact Nishit →
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
                  <p className="inquiry-privacy">Nishit Gajjar uses these details personally to respond to your project inquiry. No newsletter signup. <a href="/privacy-policy">Privacy policy</a> · <a href="/terms-of-use">Offer terms</a></p>
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
