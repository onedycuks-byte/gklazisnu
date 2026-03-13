import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Auth() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/admin");
    } else {
      navigate("/staff-login", { replace: true });
    }
  }, [user, navigate]);

  return null;
}
