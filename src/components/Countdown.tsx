"use client";

import React, { useState, useEffect } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Countdown({ targetDate }: { targetDate?: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    let destination = targetDate ? new Date(targetDate).getTime() : NaN;

    // If target date is invalid or in the past, default to end of today (rolling countdown)
    if (isNaN(destination) || destination <= Date.now()) {
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      destination = endOfToday.getTime();
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = destination - now;

      if (difference <= 0) {
        clearInterval(interval);
        // Start a new rolling countdown for the next day
        const endOfTomorrow = new Date();
        endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
        endOfTomorrow.setHours(23, 59, 59, 999);
        setTimeLeft({ days: 0, hours: 23, minutes: 59, seconds: 59 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <div style={styles.container}>
        <div style={styles.box}><span style={styles.num}>--</span><span style={styles.label}>Days</span></div>
        <div style={styles.box}><span style={styles.num}>--</span><span style={styles.label}>Hours</span></div>
        <div style={styles.box}><span style={styles.num}>--</span><span style={styles.label}>Mins</span></div>
        <div style={styles.box}><span style={styles.num}>--</span><span style={styles.label}>Secs</span></div>
      </div>
    );
  }

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <span style={styles.num}>{formatNumber(timeLeft.days)}</span>
        <span style={styles.label}>DAYS</span>
      </div>
      <div style={styles.box}>
        <span style={styles.num}>{formatNumber(timeLeft.hours)}</span>
        <span style={styles.label}>HOURS</span>
      </div>
      <div style={styles.box}>
        <span style={styles.num}>{formatNumber(timeLeft.minutes)}</span>
        <span style={styles.label}>MINUTES</span>
      </div>
      <div style={styles.box}>
        <span style={styles.num}>{formatNumber(timeLeft.seconds)}</span>
        <span style={styles.label}>SECONDS</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    gap: "16px",
    marginTop: "32px",
    flexWrap: "wrap",
  },
  box: {
    background: "rgba(255, 255, 255, 0.12)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "12px",
    padding: "16px 24px",
    minWidth: "90px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.15)",
  },
  num: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#ffffff",
    fontFamily: "var(--font-sans)",
    lineHeight: "1.1",
  },
  label: {
    fontSize: "9px",
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    letterSpacing: "1px",
    marginTop: "4px",
  },
};
