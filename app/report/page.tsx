"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const severityOptions = [
  {
    value: 1,
    label: "Minor",
    description: "Small issue with limited impact",
  },
  {
    value: 2,
    label: "Small",
    description: "Noticeable issue affecting a small area",
  },
  {
    value: 3,
    label: "Moderate",
    description: "Issue affecting regular water usage",
  },
  {
    value: 4,
    label: "Serious",
    description: "Major issue affecting the community",
  },
  {
    value: 5,
    label: "Critical",
    description: "Severe issue requiring urgent attention",
  },
];

export default function ReportPage() {
  const router = useRouter();

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [severity, setSeverity] = useState<number | null>(null);

  const [description, setDescription] = useState("");

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [submitting, setSubmitting] = useState(false);

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload JPG, JPEG, PNG or WEBP image.");
      return;
    }

    setImage(file);

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  }

  function handleLocation() {
    if (!navigator.geolocation) {
      setLocationError(
        "Location is not available on this device."
      );
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationLoading(false);
      },
      () => {
        setLocationError(
          "Location access was not granted. Please allow location access."
        );
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!image) {
      alert("Please upload an image.");
      return;
    }

    if (latitude === null || longitude === null) {
      alert("Please use your current location.");
      return;
    }

    if (severity === null) {
      alert("Please select the severity.");
      return;
    }

    setSubmitting(true);

    /*
      Backend API will be connected here next.

      POST /api/reports
    */

    console.log({
      image,
      description,
      severity_rating: severity,
      latitude,
      longitude,
    });

    // Temporary demo behaviour
    setTimeout(() => {
      setSubmitting(false);

      alert(
        "Report form is ready. Backend connection will be added next."
      );

      router.push("/my-reports");
    }, 800);
  }

  return (
    <main className="min-h-screen bg-[#f5f9fc] text-[#092f50]">

      {/* HEADER */}

      <header className="border-b border-[#dce7ef] bg-white">
        <div className="mx-auto flex h-[76px] max-w-[1180px] items-center justify-between px-6 lg:px-8">

          <div>
            <h1 className="text-[21px] font-bold tracking-[-0.03em]">
              AquaWatch AI
            </h1>

            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0879b1]">
              CITIZEN PORTAL
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="
              text-[13px]
              font-semibold
              text-[#41657c]
              hover:text-[#075985]
            "
          >
            Back
          </button>

        </div>
      </header>


      {/* CONTENT */}

      <section className="mx-auto max-w-[850px] px-6 py-10 lg:px-8">

        <div className="mb-8">

          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0879b1]">
            REPORT A PROBLEM
          </p>

          <h2 className="mt-3 text-[34px] font-bold tracking-[-0.04em]">
            Report a Water Problem
          </h2>

          <p className="mt-3 max-w-[650px] text-[14px] leading-6 text-[#6b8294]">
            Upload a photo, share your current location and tell us
            how serious the problem is.
          </p>

        </div>


        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* IMAGE */}

          <div className="border border-[#d5e2eb] bg-white p-6">

            <h3 className="text-[16px] font-bold">
              1. Upload a Photo
            </h3>

            <p className="mt-1 text-[13px] text-[#71879a]">
              Required · JPG, JPEG, PNG or WEBP
            </p>

            <label
              htmlFor="image"
              className="
                mt-5
                flex
                min-h-[220px]
                cursor-pointer
                items-center
                justify-center
                border-2
                border-dashed
                border-[#cbdde8]
                bg-[#f9fcfe]
                transition
                hover:border-[#0879b1]
                hover:bg-[#f4fafd]
              "
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Selected water problem"
                  className="max-h-[300px] max-w-full object-contain"
                />
              ) : (
                <div className="text-center">

                  <p className="text-[15px] font-semibold text-[#31566e]">
                    Choose an image
                  </p>

                  <p className="mt-1 text-[12px] text-[#8a9dac]">
                    Click here to upload
                  </p>

                </div>
              )}

              <input
                id="image"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

          </div>


          {/* LOCATION */}

          <div className="border border-[#d5e2eb] bg-white p-6">

            <h3 className="text-[16px] font-bold">
              2. Your Location
            </h3>

            <p className="mt-1 text-[13px] text-[#71879a]">
              Required · Use your current browser location
            </p>

            <button
              type="button"
              onClick={handleLocation}
              disabled={locationLoading}
              className="
                mt-5
                h-[48px]
                rounded-md
                bg-[#075985]
                px-6
                text-[14px]
                font-bold
                text-white
                transition
                hover:bg-[#064d73]
                disabled:cursor-not-allowed
                disabled:opacity-70
              "
            >
              {locationLoading
                ? "Getting Location..."
                : "Use My Current Location"}
            </button>

            {latitude !== null && longitude !== null && (
              <div className="mt-4 border border-[#cde2ee] bg-[#f1f8fc] px-4 py-3">

                <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#0879b1]">
                  Location Captured
                </p>

                <p className="mt-2 text-[13px] text-[#46667b]">
                  Latitude: {latitude.toFixed(6)}
                </p>

                <p className="text-[13px] text-[#46667b]">
                  Longitude: {longitude.toFixed(6)}
                </p>

              </div>
            )}

            {locationError && (
              <p className="mt-3 text-[13px] text-[#a33a3a]">
                {locationError}
              </p>
            )}

          </div>


          {/* SEVERITY */}

          <div className="border border-[#d5e2eb] bg-white p-6">

            <h3 className="text-[16px] font-bold">
              3. Problem Severity
            </h3>

            <p className="mt-1 text-[13px] text-[#71879a]">
              Required · Select how serious the problem is
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-5">

              {severityOptions.map((option) => {

                const selected = severity === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSeverity(option.value)}
                    className={`
                      min-h-[100px]
                      border
                      p-4
                      text-left
                      transition
                      ${
                        selected
                          ? "border-[#0879b1] bg-[#edf7fc]"
                          : "border-[#d5e2eb] bg-white hover:border-[#9dbaca]"
                      }
                    `}
                  >

                    <p
                      className={`
                        text-[20px]
                        font-bold
                        ${
                          selected
                            ? "text-[#075985]"
                            : "text-[#31566e]"
                        }
                      `}
                    >
                      {option.value}
                    </p>

                    <p className="mt-1 text-[13px] font-bold text-[#244b67]">
                      {option.label}
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-[#7c91a1]">
                      {option.description}
                    </p>

                  </button>
                );
              })}

            </div>

          </div>


          {/* DESCRIPTION */}

          <div className="border border-[#d5e2eb] bg-white p-6">

            <h3 className="text-[16px] font-bold">
              4. Description
            </h3>

            <p className="mt-1 text-[13px] text-[#71879a]">
              Optional · Add any useful information
            </p>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={5}
              placeholder="Describe the water problem..."
              className="
                mt-5
                w-full
                resize-none
                border
                border-[#cbdce7]
                bg-white
                p-4
                text-[14px]
                text-[#092f50]
                outline-none
                placeholder:text-[#9aabba]
                focus:border-[#0879b1]
                focus:ring-2
                focus:ring-[#0879b1]/10
              "
            />

          </div>


          {/* SUBMIT */}

          <div className="flex justify-end">

            <button
              type="submit"
              disabled={submitting}
              className="
                h-[52px]
                rounded-md
                bg-[#075985]
                px-9
                text-[14px]
                font-bold
                text-white
                shadow-[0_8px_20px_rgba(7,89,133,0.18)]
                transition
                hover:bg-[#064d73]
                disabled:cursor-not-allowed
                disabled:opacity-70
              "
            >
              {submitting
                ? "Submitting..."
                : "Submit Water Problem"}
            </button>

          </div>

        </form>

      </section>

    </main>
  );
}