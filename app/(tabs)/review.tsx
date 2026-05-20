import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import ReviewFlow from "../../src/components/ReviewFlow";

export default function ReviewScreen() {
  const [sessionKey, setSessionKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setSessionKey((prev) => prev + 1);
    }, []),
  );

  return <ReviewFlow key={sessionKey} />;
}
