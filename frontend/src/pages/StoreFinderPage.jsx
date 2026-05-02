import { useEffect, useRef, useState } from "react";
import { Compass, LocateFixed, MapPinned, RefreshCcw } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function StoreFinderPage() {
  const hasRequestedLocation = useRef(false);
  const [stores, setStores] = useState([]);
  const [location, setLocation] = useState(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [locationMessage, setLocationMessage] = useState("We’ll show your city when the public location service confirms it.");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleUseLocation = () => {
    setHasSearched(true);

    if (!navigator.onLine) {
      setError("You’re offline. Reconnect to look up nearby optical stores.");
      setStores([]);
      setLocationLabel("Current area");
      setLocationMessage("City lookup is paused while you’re offline, but your private vault still works normally.");
      return;
    }

    if (!navigator.geolocation) {
      setError("This browser does not support GPS location lookup.");
      setLocationLabel("Current area");
      setLocationMessage("This device can’t provide city-level GPS data for the public store finder.");
      return;
    }

    setIsLoading(true);
    setError("");
    setLocationLabel("");
    setLocationMessage("Checking the public location service for your city.");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLocation({ lat, lng });

        try {
          const [storesResult, labelResult] = await Promise.allSettled([
            fetch(`${BACKEND_URL}/api/public/optical-stores?lat=${lat}&lng=${lng}`).then(async (response) => {
              const payload = await response.json();
              if (!response.ok) {
                throw new Error("Could not load nearby stores.");
              }
              return Array.isArray(payload) ? payload : [];
            }),
            fetch(`${BACKEND_URL}/api/public/location-label?lat=${lat}&lng=${lng}`).then(async (response) => {
              const payload = await response.json();
              return response.ok ? payload.city || "Current area" : "Current area";
            }),
          ]);

          if (storesResult.status === "rejected") {
            throw storesResult.reason;
          }

          setStores(storesResult.value);
          if (labelResult.status === "fulfilled" && labelResult.value) {
            setLocationLabel(labelResult.value);
            setLocationMessage(`Nearby store results are centered around ${labelResult.value}.`);
          } else {
            setLocationLabel("Current area");
            setLocationMessage("City lookup is temporarily unavailable, so nearby store results are shown for your current area.");
          }
          setError("");
        } catch {
          setError("Nearby optical stores could not load from the public provider right now.");
          setStores([]);
          setLocationLabel("Current area");
          setLocationMessage("The city lookup or store provider is temporarily unavailable. Try again in a moment.");
        } finally {
          setIsLoading(false);
        }
      },
      () => {
        setError("Location permission is needed so the app can sense nearby optical stores automatically.");
        setLocationLabel("Current area");
        setLocationMessage("Once location permission is granted, we’ll replace this fallback with your city name.");
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  useEffect(() => {
    if (hasRequestedLocation.current) {
      return;
    }

    hasRequestedLocation.current = true;
    handleUseLocation();
  }, []);

  return (
    <AppShell
      actions={
        <Button data-testid="use-current-location-button" onClick={handleUseLocation} type="button">
          <LocateFixed className="h-4 w-4" /> Refresh location
        </Button>
      }
      description="This public tool passively senses GPS and shows nearby optical stores by city. Prescription photos, expiration dates, PD, and reminders are never sent here."
      eyebrow="Public store finder"
      title="Nearby optical stores"
    >
      <section className="grid gap-6 xl:grid-cols-[0.85fr,1.15fr]">
        <div className="space-y-4">
          <div className="vault-card" data-testid="stores-location-card">
            <p className="vault-eyebrow">How it works</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--app-text)]">GPS only, no private vault data</h2>
            <p className="mt-3 text-sm text-[var(--app-text-soft)]">
              The app senses your current location automatically to look up nearby optical stores. There is no manual location form added in this enhancement.
            </p>
            <div className="mt-5 rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4 text-sm text-[var(--app-text-soft)]" data-testid="stores-location-status">
              {location
                ? `Current city: ${locationLabel || "Checking your city"}`
                : `Current city: ${locationLabel || "Current area"}`}
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--app-text-soft)]" data-testid="stores-location-message">
              {locationMessage}
            </p>
          </div>

          {error ? (
            <div className="vault-card border-rose-200/70 bg-rose-50/65 text-rose-800" data-testid="stores-error-message">
              <div className="space-y-3">
                <p>{error}</p>
                <p className="text-sm text-rose-700/80" data-testid="stores-error-guidance">
                  Your private vault still works locally while public store search is unavailable. If the city provider or store provider is interrupted, the app falls back to your current area until the service responds again.
                </p>
                <Button className="h-8 px-3 text-xs" data-testid="stores-error-retry-button" onClick={handleUseLocation} size="sm" type="button" variant="outline">
                  <RefreshCcw className="h-3.5 w-3.5" /> Try again
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-4" data-testid="stores-results-section">
          {isLoading ? (
            <div className="vault-card" data-testid="stores-loading-state">Searching nearby optical stores...</div>
          ) : hasSearched && !error && stores.length === 0 ? (
            <div className="vault-card space-y-4" data-testid="stores-no-results-state">
              <div>
                <p className="vault-eyebrow">No nearby results</p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--app-text)]">No optical stores showed up from this search</h2>
                <p className="mt-2 text-sm text-[var(--app-text-soft)]">
                  Try again in a different city area or reconnect if public map data is temporarily limited.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--app-border)] bg-white/45 p-4 text-sm text-[var(--app-text-soft)]" data-testid="stores-no-results-guidance">
                This result affects only the public store finder. Your prescriptions, reminders, and other private vault records remain local and available.
              </div>
              <Button className="h-8 w-full px-3 text-xs sm:w-auto" data-testid="stores-no-results-retry-button" onClick={handleUseLocation} size="sm" type="button" variant="outline">
                <RefreshCcw className="h-3.5 w-3.5" /> Retry search
              </Button>
            </div>
          ) : stores.length === 0 ? (
            <div className="vault-card space-y-4" data-testid="stores-empty-state">
              <div>
                <p className="vault-eyebrow">Checking your area</p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--app-text)]">The app is ready to sense your nearby stores</h2>
                <p className="mt-2 text-sm text-[var(--app-text-soft)]">
                  GPS location is requested automatically. If you denied permission earlier, use <span className="font-semibold text-[var(--app-text)]">Refresh location</span> to try again and show your city.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--app-border)] bg-white/45 p-4 text-sm text-[var(--app-text-soft)]" data-testid="stores-empty-guidance">
                Your private vault data stays separate. Only location is used for this public store search.
              </div>
            </div>
          ) : (
            stores.map((store) => {
              const directionsHref =
                store.source === "maps_fallback"
                  ? store.website
                  : `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;

              return (
                <article className="vault-card" data-testid={`store-card-${store.id}`} key={store.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="vault-eyebrow">Optical store</p>
                      <h2 className="mt-2 text-2xl font-semibold text-[var(--app-text)]" data-testid={`store-name-${store.id}`}>
                        {store.name}
                      </h2>
                    </div>
                    <div className="inline-flex rounded-full bg-[var(--app-surface-soft)] px-3 py-1 text-sm font-medium text-[var(--app-brand)]" data-testid={`store-distance-${store.id}`}>
                      {store.distance_km} km
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-[var(--app-text-soft)]">
                    <div className="vault-inline-meta" data-testid={`store-address-${store.id}`}>
                      <MapPinned className="h-4 w-4" aria-hidden="true" />
                      <span>{store.address || "Address not listed"}</span>
                    </div>
                    <div className="vault-inline-meta" data-testid={`store-phone-${store.id}`}>
                      <Compass className="h-4 w-4" aria-hidden="true" />
                      <span>{store.phone || "Phone not listed"}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <a className="inline-flex rounded-full bg-[var(--app-brand)] px-5 py-3 text-sm font-medium text-white" data-testid={`store-directions-link-${store.id}`} href={directionsHref} rel="noreferrer" target="_blank">
                      Open directions
                    </a>
                    {store.website ? (
                      <a className="inline-flex rounded-full border border-[var(--app-border)] bg-white px-5 py-3 text-sm font-medium text-[var(--app-text)]" data-testid={`store-website-link-${store.id}`} href={store.website} rel="noreferrer" target="_blank">
                        Visit website
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </AppShell>
  );
}
