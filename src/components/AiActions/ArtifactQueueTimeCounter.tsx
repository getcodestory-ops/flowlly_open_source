import React, { useState, useEffect } from "react";
import { Box, Text, Heading } from "@chakra-ui/react";

interface TimeConfig {
  run_time: string; // Format: "HH:MM:SS"
  delivery_time: string | null;
}
interface RunConfig {
  day: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  start: Date;
  end: Date | null;
  time: TimeConfig[];
  time_zone: string;
}

interface CountdownTimerProps {
  runConfig: RunConfig;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ runConfig }) => {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const runTimeParts = runConfig.time[0].run_time.split(":").map(Number);
    const dayOfWeek = runConfig.day[0];

    const updateCountdown = () => {
      const now = new Date();
      const currentDay = now.getUTCDay();
      let targetDate: Date;

      if (currentDay <= dayOfWeek) {
        // If today is before or the same as the run day, set this week's day
        targetDate = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() + (dayOfWeek - currentDay),
            runTimeParts[0],
            runTimeParts[1],
            runTimeParts[2]
          )
        );
      } else {
        // Otherwise, set to next week's day
        targetDate = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() + (7 - (currentDay - dayOfWeek)),
            runTimeParts[0],
            runTimeParts[1],
            runTimeParts[2]
          )
        );
      }

      const timeDiff = targetDate.getTime() - now.getTime();

      if (timeDiff > 0) {
        const seconds = Math.floor((timeDiff / 1000) % 60);
        const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
        const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        setTimeRemaining({ days, hours, minutes, seconds });
      } else {
        setTimeRemaining(null); // The time has passed for this week
      }
    };

    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer); // Cleanup timer on component unmount
  }, [runConfig]);

  return (
    <Box textAlign="center" py={10} px={6}>
      {timeRemaining && (
        <Text fontSize="sm">
          {timeRemaining.days} days, {timeRemaining.hours} hours,{" "}
          {timeRemaining.minutes} minutes, {timeRemaining.seconds} seconds
        </Text>
      )}
    </Box>
  );
};

export default CountdownTimer;
