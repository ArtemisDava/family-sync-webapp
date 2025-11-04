import { useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../contexts/user.context";
import { useNavigate } from "react-router-dom";
import { FamiliesService } from "../services/families.service";

const joinToTheFamily = async (code: string, token?: string) => {
  const response = await FamiliesService.joinToTheFamily(code, token);
  return response;
};

export default function InvitePage() {
  const navigate = useNavigate();
  const { token } = useUser();
  const params = useParams();

  const joinFamily = useCallback(async () => {
    if (params.code && token) {
      try {
        await joinToTheFamily(params.code, token);
        navigate("/profile");
      } catch (error) {
        console.error("Failed to join family:", error);
        navigate("/");
      }
    }
  }, [params.code, token, navigate]);

  useEffect(() => {
    if (!token) {
      navigate(`/singup?invite=${params.code}`);
    }
    joinFamily();
  }, [token, navigate]);

  return <div>Invite Page</div>;
}
