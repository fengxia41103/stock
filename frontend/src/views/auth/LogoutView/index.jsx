import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import api from "@/api/client";

const LogoutView = () => {
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/auth/logout/").finally(() => {
      localStorage.removeItem("apiKey");
      sessionStorage.clear();
      navigate("/login", { replace: true });
    });
  }, [navigate]);

  return null;
};

export default LogoutView;
