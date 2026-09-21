"use client";

import { useState } from "react";
import ImagePreview from "./ImagePreview";
import LocationPicker, { type Coordinates } from "./LocationPicker";
import SeveritySelector from "./SeveritySelector";

export interface ReportFormValues {
  image: File;
  location: Coordinates;
  severity: 1 | 2 | 3 | 4 | 5;
  description: string;
}

interface ReportFormProps {
  onSubmit: (values: ReportFormValues) => void;
  submitting?: boolean;
}

export default function ReportForm({ onSubmit, submitting }: ReportFormProps) {
  const [image, setImage] = useState<File | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [severity, setSeverity] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ image?: string; location?: string; severity?: string }>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!image) nextErrors.image = "Add a photo of the problem to continue.";
    if (!location) nextErrors.location = "Share your location so it can be routed correctly.";
    if (!severity) nextErrors.severity = "Select how serious the problem is.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      image: image as File,
      location: location as Coordinates,
      severity: severity as 1 | 2 | 3 | 4 | 5,
      description: description.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <section aria-labelledby="photo-heading">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="photo-heading" className="font-display text-base font-semibold text-ink-900">
            Photo
          </h2>
          <span className="text-xs font-medium text-status-critical">Required</span>
        </div>
        <ImagePreview file={image} onChange={setImage} />
        {errors.image && (
          <p className="mt-2 text-sm text-status-critical" role="alert">
            {errors.image}
          </p>
        )}
      </section>

      <section aria-labelledby="location-heading">
        <h2 id="location-heading" className="mb-3 font-display text-base font-semibold text-ink-900">
          Your Location
        </h2>
        <LocationPicker value={location} onChange={setLocation} />
        {errors.location && (
          <p className="mt-2 text-sm text-status-critical" role="alert">
            {errors.location}
          </p>
        )}
      </section>

      <section aria-labelledby="severity-heading">
        <h2 id="severity-heading" className="mb-3 font-display text-base font-semibold text-ink-900">
          How serious is the problem?
        </h2>
        <SeveritySelector value={severity} onChange={setSeverity} />
        {errors.severity && (
          <p className="mt-2 text-sm text-status-critical" role="alert">
            {errors.severity}
          </p>
        )}
      </section>

      <section aria-labelledby="description-heading">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="description-heading" className="font-display text-base font-semibold text-ink-900">
            Tell us more
          </h2>
          <span className="text-xs font-medium text-ink-700/50">Optional</span>
        </div>
        <label htmlFor="description" className="sr-only">
          Problem description
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the problem if you can..."
          className="w-full resize-none rounded-xl border border-surface-line bg-surface-raised px-4 py-3 text-sm text-ink-900 placeholder:text-ink-700/40 focus:border-teal-500"
        />
      </section>

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center rounded-xl bg-teal-500 px-6 py-4 text-base font-semibold text-white shadow-raised transition-colors hover:bg-teal-600 disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
        <p className="mt-3 text-center text-xs text-ink-700/50">
          Your report will be automatically categorised and prioritised.
        </p>
      </div>
    </form>
  );
}
