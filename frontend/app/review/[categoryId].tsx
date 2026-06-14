import { useLocalSearchParams } from "expo-router";
import ReviewFlow from "../../src/components/ReviewFlow";

export default function CategoryReviewScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  return <ReviewFlow categoryId={categoryId} />;
}
