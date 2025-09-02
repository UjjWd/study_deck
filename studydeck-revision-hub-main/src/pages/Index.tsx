
// Redirect user to dashboard root if at `/`
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
const Index = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/dashboard", { replace: true });
  }, [navigate]);
  return null;
};
export default Index;
