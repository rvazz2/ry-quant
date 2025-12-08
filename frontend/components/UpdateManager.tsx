"use client";

import React, { useEffect, useState } from "react";
import { useSettings } from "@/contexts/SettingsContext";

const UpdateManager = () => {
    const { setUpdateAvailable, registerUpdateHandler } = useSettings();
    const [worker, setWorker] = useState<ServiceWorker | null>(null);

    useEffect(() => {
        // Register the handler to be called when user clicks "Restart"
        registerUpdateHandler(() => {
            if (worker) {
                worker.postMessage({ type: "SKIP_WAITING" });
            }
            if (window.workbox) {
                window.workbox.messageSkipWaiting();
            }
        });

        const onControllerChange = () => {
            window.location.reload();
        };

        navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

        return () => {
            navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
        };
    }, [registerUpdateHandler, worker]);

    useEffect(() => {
        // 1. Register the Service Worker logic
        if (
            typeof window !== "undefined" &&
            "serviceWorker" in navigator &&
            window.workbox !== undefined
        ) {
            const wb = window.workbox;

            // 2. Listen for the "waiting" event (Update Found and Ready)
            wb.addEventListener("waiting", () => {
                setUpdateAvailable(true);
                // Get the underlying registration
                navigator.serviceWorker.getRegistration().then((reg) => {
                    if (reg && reg.waiting) {
                        setWorker(reg.waiting);
                    }
                });
            });

            wb.register();
        }
    }, [setUpdateAvailable]);

    // No UI for this component, it's a silent listener
    return null;
};

export default UpdateManager;

// Add types for window.workbox
declare global {
    interface Window {
        workbox: any;
    }
}
