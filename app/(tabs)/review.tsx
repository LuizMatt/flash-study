import { useState, useCallback } from "react";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import ReviewFlow from "../../src/components/ReviewFlow";

export default function ReviewScreen() {
  const [sessionKey, setSessionKey] = useState(0);
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();

  useFocusEffect(
    useCallback(() => {
      setSessionKey((prev) => prev + 1);
    }, []),
  );

  return <ReviewFlow key={`${categoryId}-${sessionKey}`} categoryId={categoryId} />;
}
