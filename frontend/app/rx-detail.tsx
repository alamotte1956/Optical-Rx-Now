import { useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function RxDetailRedirect() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    // Redirect to the prescription/[id] route
    if (id) {
      router.replace({ pathname: "/prescription/[id]", params: { id: Array.isArray(id) ? id[0] : id, memberId: "" } });
    } else {
      router.back();
    }
  }, [id]);

  return null;
}




